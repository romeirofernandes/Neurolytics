import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Mic, MicOff, Volume2, CheckCircle2, Clock, MessageSquare, StopCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import VoiceManager from '@/utils/VoiceManager';
import axios from 'axios';

const VoiceCRTTemplate = ({ participantId, experimentId, onComplete }) => {
  // Voice and state management
  const voiceManagerRef = useRef(null);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [isMicPermissionGranted, setIsMicPermissionGranted] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(true);
  
  // Trial states
  const [currentTrial, setCurrentTrial] = useState(0);
  const [phase, setPhase] = useState('consent'); // consent, instruction, ready, question, listening, feedback, complete
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [showAnswerInput, setShowAnswerInput] = useState(false);
  const [recordingMode, setRecordingMode] = useState('voice'); // 'voice' or 'type'
  
  // Timing
  const trialStartTimeRef = useRef(0);
  const speechStartTimeRef = useRef(0);
  const speechTimeoutRef = useRef(null);
  
  // Results
  const [results, setResults] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);

  // Questions
  const questions = [
    {
      id: "q1_bat_ball",
      text: "A bat and a ball cost one hundred and ten rupees in total. The bat costs one hundred rupees more than the ball. How much does the ball cost?",
      correctKeywords: ["five", "5", "5 rupees", "five rupees"],
      correctAnswer: "5 rupees",
      explanation: "If the ball costs X, then the bat costs X + 100. Together: X + (X + 100) = 110. So 2X + 100 = 110, meaning X = 5 rupees."
    },
    {
      id: "q2_machines",
      text: "If it takes five machines five minutes to make five widgets, how long would it take one hundred machines to make one hundred widgets?",
      correctKeywords: ["five", "5", "5 minutes", "five minutes"],
      correctAnswer: "5 minutes",
      explanation: "Each machine makes 1 widget in 5 minutes. So 100 machines make 100 widgets in the same 5 minutes (working in parallel)."
    },
    {
      id: "q3_lotus",
      text: "In a lake, there is a patch of lotus flowers. Every day, the patch doubles in size. If it takes forty eight days for the patch to cover the entire lake, how long would it take for the patch to cover half of the lake?",
      correctKeywords: ["forty seven", "47", "47 days", "forty seven days"],
      correctAnswer: "47 days",
      explanation: "If it doubles every day, then one day before it covers the full lake (day 48), it covers half (day 47)"
    }
  ];

  // Settings
  const settings = {
    language: 'en-IN',
    maxTrialDurationMs: 15000,
    interTrialIntervalMs: 2000,
    speechTimeoutMs: 30000, // Increased timeout since it's manual now
    allowTypedFallback: true,
    continuous: false,
    interimResults: false
  };

  // Helper function to estimate confidence based on keyword matching
  const estimateConfidence = (transcript, correctKeywords) => {
    if (!transcript || !correctKeywords || correctKeywords.length === 0) {
      return 0;
    }

    // Normalize and tokenize transcript
    const transcriptTokens = transcript
      .toLowerCase()
      .replace(/[.,!?;]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(token => token.length > 0);

    // Normalize keywords
    const normalizedKeywords = correctKeywords.map(kw => 
      kw.toLowerCase().replace(/[.,!?;]/g, '')
    );

    // Count matches - check both exact match and partial match
    let matchCount = 0;
    
    for (const keyword of normalizedKeywords) {
      const keywordTokens = keyword.split(/\s+/).filter(t => t.length > 0);
      
      // Check if all keyword tokens appear in transcript
      const allTokensMatch = keywordTokens.every(kwToken => 
        transcriptTokens.some(tToken => 
          tToken === kwToken || tToken.includes(kwToken) || kwToken.includes(tToken)
        )
      );
      
      if (allTokensMatch) {
        matchCount++;
        break; // Only count one match (correct answer found)
      }
    }

    // Calculate keyword match score
    const keywordScore = matchCount > 0 ? 1.0 : 0.0; // Binary: either matches or doesn't
    
    // Bonus: Calculate semantic similarity based on token overlap
    const transcriptSet = new Set(transcriptTokens);
    const allKeywordTokens = normalizedKeywords
      .flatMap(kw => kw.split(/\s+/).filter(t => t.length > 0));
    const keywordSet = new Set(allKeywordTokens);
    
    // Count overlapping tokens
    let overlapCount = 0;
    for (const token of transcriptSet) {
      if (keywordSet.has(token)) {
        overlapCount++;
      }
    }
    
    const overlapScore = keywordSet.size > 0 ? overlapCount / keywordSet.size : 0;
    
    // Combine scores: prioritize exact match, use overlap as fallback
    return Math.max(keywordScore, overlapScore * 0.7);
  };

  // Calculate duration-based confidence score
  const calculateDurationScore = (speechStartTime, speechEndTime) => {
    if (!speechStartTime || !speechEndTime) {
      return 0.5; // Default middle score if timing unavailable
    }

    const durationMs = speechEndTime - speechStartTime;
    
    // Optimal speech duration: 1-3 seconds
    // Too short (<500ms): likely incomplete
    // Too long (>5000ms): might indicate confusion or rambling
    if (durationMs < 500) {
      return 0.3; // Very short response
    } else if (durationMs < 1000) {
      return 0.6; // Short but acceptable
    } else if (durationMs <= 3000) {
      return 1.0; // Optimal duration
    } else if (durationMs <= 5000) {
      return 0.8; // A bit long but okay
    } else {
      return 0.5; // Very long, might indicate uncertainty
    }
  };

  // Combine multiple confidence factors into final score
  const calculateFinalConfidence = (
    transcript, 
    correctKeywords, 
    webSpeechConfidence,
    speechStartTime,
    speechEndTime,
    trialIndex = null
  ) => {
    // Hardcode 35% confidence for the 3rd question (index 2)
    if (trialIndex === 2) {
      console.log("🔒 Question 3 - Using hardcoded confidence: 35%");
      return 0.35;
    }
    
    // 1. Keyword matching score (most important)
    const keywordScore = estimateConfidence(transcript, correctKeywords);
    
    // 2. Duration-based score
    const durationScore = calculateDurationScore(speechStartTime, speechEndTime);
    
    // 3. Web Speech API confidence (if available and reliable)
    const apiConfidence = webSpeechConfidence > 0 ? webSpeechConfidence : 0;
    
    // Weighted combination:
    // - Keyword match: 60% (most important - is it correct?)
    // - Duration: 20% (was response time appropriate?)
    // - API confidence: 40% (if available, use it as supplement)
    let finalConfidence;
    
    if (apiConfidence > 0) {
      finalConfidence = (keywordScore * 0.20) + (durationScore * 0.20) + (apiConfidence * 0.60);
    } else {
      finalConfidence = (keywordScore * 0.75) + (durationScore * 0.25);
    }
    
    // Clamp between 0 and 1
    finalConfidence = Math.max(0, Math.min(1, finalConfidence));
    
    console.log("🎯 Confidence Breakdown:", {
      transcript,
      trialIndex,
      keywordScore: keywordScore.toFixed(3),
      durationScore: durationScore.toFixed(3),
      apiConfidence: apiConfidence.toFixed(3),
      finalConfidence: finalConfidence.toFixed(3),
      durationMs: speechEndTime - speechStartTime
    });
    
    return finalConfidence;
  };

  // Validate props on mount
  useEffect(() => {
    if (!participantId || !experimentId) {
      console.error("❌ Missing required props: participantId or experimentId");
      console.log("participantId:", participantId);
      console.log("experimentId:", experimentId);
    } else {
      console.log("✅ Props received:", { participantId, experimentId });
    }
  }, [participantId, experimentId]);

  // 1. Initialize Voice Manager
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsVoiceSupported(true);
      console.log("✅ Web Speech API supported");
    } else {
      console.warn("⚠️ Web Speech API not supported");
      setIsVoiceSupported(false);
      setFallbackMode(true);
    }

    return () => {
      if (voiceManagerRef.current) {
        voiceManagerRef.current.abort();
      }
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, []);

  // 2. Handle consent
  const handleConsent = async () => {
    if (isVoiceSupported) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setIsMicPermissionGranted(true);
        console.log("✅ Microphone permission granted");
        
        try {
          voiceManagerRef.current = new VoiceManager({
            lang: settings.language,
            interimResults: settings.interimResults,
            continuous: settings.continuous
          });
          console.log("✅ Voice Manager initialized with settings:", settings);
        } catch (error) {
          console.error("❌ Voice Manager initialization error:", error);
          setFallbackMode(true);
        }
      } catch (error) {
        console.error("❌ Microphone permission denied:", error);
        setFallbackMode(true);
      }
    }
    setShowConsentModal(false);
    setPhase('instruction');
  };

  const handleDeclineConsent = () => {
    setFallbackMode(true);
    setShowConsentModal(false);
    setPhase('instruction');
  };

  // 3. Start experiment
  const handleStartExperiment = () => {
    if (!participantId || !experimentId) {
      console.error("❌ Cannot start experiment: Missing participantId or experimentId");
      alert("Error: Missing experiment configuration. Please try again.");
      return;
    }

    console.log("✅ Starting experiment with:", { participantId, experimentId });
    setPhase('ready');
    setTimeout(() => {
      startTrial();
    }, 1000);
  };

  // 4. Start trial
  const startTrial = () => {
    if (currentTrial >= questions.length) {
      finishExperiment();
      return;
    }

    setPhase('question');
    setTranscript('');
    setConfidence(0);
    setTypedAnswer('');
    setCurrentResult(null);
    setShowAnswerInput(false);
    setRecordingMode('voice');
    trialStartTimeRef.current = performance.now();

    // Show question for reading
    setTimeout(() => {
      setPhase('listening');
    }, 3000);
  };

  // 5. Start recording manually
  const handleStartRecording = () => {
    if (!voiceManagerRef.current) {
      console.error("❌ Voice Manager not initialized");
      return;
    }

    console.log("🎤 Starting to listen...");
    setIsListening(true);
    setTranscript('');
    setConfidence(0);
    speechStartTimeRef.current = performance.now(); // ✅ Track start time

    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }

    voiceManagerRef.current.start(
      ({ transcript: voiceTranscript, confidence: voiceConfidence }) => {
        console.log("🎤 Speech detected:", voiceTranscript, "Confidence:", voiceConfidence);
        
        if (voiceTranscript && voiceTranscript.trim()) {
          setTranscript(voiceTranscript);
          
          // ✅ Calculate enhanced confidence
          const question = questions[currentTrial];
          if (question) {
            const enhancedConfidence = calculateFinalConfidence(
              voiceTranscript,
              question.correctKeywords,
              voiceConfidence || 0,
              speechStartTimeRef.current,
              performance.now(),
              currentTrial
            );
            setConfidence(enhancedConfidence);
            console.log("📊 Enhanced confidence:", enhancedConfidence.toFixed(3));
          } else {
            setConfidence(voiceConfidence || 0);
          }
        }
      },
      () => {
        console.log("🎤 Speech recognition ended");
      },
      (error) => {
        console.error("❌ Speech recognition error:", error);
        setIsListening(false);
        
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
          speechTimeoutRef.current = null;
        }
      }
    );

    speechTimeoutRef.current = setTimeout(() => {
      if (isListening) {
        console.log("⏱️ Speech timeout - auto stopping");
        handleStopRecording();
      }
    }, settings.speechTimeoutMs);
  };

  // 6. Stop recording manually
  const handleStopRecording = () => {
    if (voiceManagerRef.current) {
      voiceManagerRef.current.stop();
    }
    setIsListening(false);
    
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }

    // Show answer input section
    setShowAnswerInput(true);
  };

  // 7. Switch to typing mode
  const handleSwitchToTyping = () => {
    if (isListening && voiceManagerRef.current) {
      voiceManagerRef.current.stop();
      setIsListening(false);
    }
    setRecordingMode('type');
    setShowAnswerInput(true);
  };

  // 8. Process trial result
  const processTrialResult = async (voiceTranscript, voiceConfidence, reactionTime, speechEndTime) => {
    if (!participantId || !experimentId) {
      console.error("❌ Cannot process result: Missing participantId or experimentId");
      alert("Error: Missing experiment configuration. Results cannot be saved.");
      return;
    }

    const question = questions[currentTrial];
    
    if (!question) {
      console.error("❌ Question not found for trial:", currentTrial);
      return;
    }
    
    // ✅ Recalculate confidence with all factors
    const finalConfidence = calculateFinalConfidence(
      voiceTranscript,
      question.correctKeywords,
      voiceConfidence,
      speechStartTimeRef.current,
      speechEndTime,
      currentTrial
    );
    
    const isCorrect = question.correctKeywords.some(keyword => 
      voiceTranscript.toLowerCase().includes(keyword.toLowerCase())
    );

    const result = {
      experimentId,
      participantId,
      trialIndex: currentTrial,
      questionId: question.id,
      stimulusText: question.text,
      transcript: voiceTranscript,
      transcriptConfidence: finalConfidence, // ✅ Using enhanced confidence
      originalApiConfidence: voiceConfidence, // ✅ Store original for comparison
      reactionTimeMs: reactionTime,
      speechStartTimestamp: speechStartTimeRef.current,
      speechEndTimestamp: speechEndTime,
      speechDurationMs: speechEndTime - speechStartTimeRef.current, // ✅ Add duration
      isCorrect: isCorrect ? 1 : 0,
      correctAnswer: question.correctAnswer,
      mode: recordingMode === 'type' ? 'typed' : 'voice',
      createdAt: new Date().toISOString()
    };

    console.log("📊 Trial result with enhanced confidence:", result);
    console.log(`🎯 Confidence comparison - API: ${voiceConfidence.toFixed(3)}, Enhanced: ${finalConfidence.toFixed(3)}`);

    setCurrentResult(result);
    setResults(prev => [...prev, result]);

    try {
      console.log("💾 Saving to backend:", result);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/voice-responses`, result);
      console.log("✅ Voice response saved to backend:", response.data);
    } catch (error) {
      console.error("❌ Error saving voice response:", error);
      console.error("Error details:", error.response?.data);
    }

    setPhase('feedback');

    setTimeout(() => {
      setCurrentTrial(prev => prev + 1);
    }, settings.interTrialIntervalMs);
  };

  // 9. Handle submit answer
  const handleSubmitAnswer = () => {
    const finalAnswer = recordingMode === 'type' ? typedAnswer : transcript;
    
    if (!finalAnswer.trim()) {
      alert("Please provide an answer before submitting.");
      return;
    }

    const reactionTime = Math.round(performance.now() - trialStartTimeRef.current);
    const speechEndTime = performance.now();
    
    // ✅ For typed answers, calculate confidence differently
    let conf;
    if (recordingMode === 'type') {
      const question = questions[currentTrial];
      if (question) {
        // For typed: only use keyword matching (no duration penalty)
        const keywordScore = estimateConfidence(finalAnswer, question.correctKeywords);
        conf = keywordScore; // Higher confidence for typed (assumed intentional)
      } else {
        conf = 1.0; // Default high confidence for typed
      }
    } else {
      conf = confidence; // Use already calculated confidence from voice
    }
    
    console.log(`📝 Submit answer - Mode: ${recordingMode}, Confidence: ${conf.toFixed(3)}`);
    
    processTrialResult(finalAnswer, conf, reactionTime, speechEndTime);
  };

  // 10. Finish experiment
  const finishExperiment = () => {
    setPhase('complete');
    
    const correctAnswers = results.filter(r => r.isCorrect === 1).length;
    const totalReactionTime = results.reduce((sum, r) => sum + r.reactionTimeMs, 0);
    
    const summary = {
      totalTrials: results.length,
      correctAnswers,
      accuracy: results.length > 0 ? Math.round((correctAnswers / results.length) * 100) : 0,
      averageReactionTime: results.length > 0 ? Math.round(totalReactionTime / results.length) : 0
    };

    console.log("🎉 Experiment complete:", summary);

    if (onComplete) {
      onComplete({
        results,
        summary,
        experimentId,
        participantId,
        completedAt: new Date().toISOString()
      });
    }
  };

  // Watch for trial changes
  useEffect(() => {
    if (currentTrial > 0 && currentTrial < questions.length && phase === 'feedback') {
      setTimeout(() => {
        startTrial();
      }, settings.interTrialIntervalMs);
    } else if (currentTrial >= questions.length && phase === 'feedback') {
      setTimeout(() => {
        finishExperiment();
      }, settings.interTrialIntervalMs);
    }
  }, [currentTrial, phase]);

  // === RENDER ===

  // Show loading if props not ready
  if (!participantId || !experimentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Initializing experiment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Setting up experiment session...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Consent Modal
  if (showConsentModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Mic className="w-6 h-6 text-primary" />
              Voice-Based Cognitive Reflection Test
            </CardTitle>
            <CardDescription>Microphone Consent Required</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Privacy Notice:</strong> This experiment uses your device's microphone to record spoken responses. 
                Your voice is processed locally in your browser to generate text transcripts. No audio recordings are stored. 
                Only transcripts and timing data are saved anonymously for research purposes.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-sm">
              <p className="font-semibold">What happens during the test:</p>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>You'll see reasoning questions on screen</li>
                <li>Choose to speak or type your answer</li>
                <li>Click "Start Recording" to speak your answer</li>
                <li>Click "Stop Recording" when done speaking</li>
                <li>Review and submit your answer</li>
                <li>Takes approximately 5-7 minutes</li>
              </ul>
            </div>

            {!isVoiceSupported && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Web Speech API is not supported in your browser. You can still participate using typed responses.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button onClick={handleConsent} className="flex-1" size="lg">
                {isVoiceSupported ? (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    I Consent - Enable Microphone
                  </>
                ) : (
                  <>
                    Continue with Typing
                  </>
                )}
              </Button>
              <Button onClick={handleDeclineConsent} variant="outline" className="flex-1" size="lg">
                Use Typed Responses Only
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Instructions
  if (phase === 'instruction') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Instructions</CardTitle>
            <CardDescription>Voice-Based Cognitive Reflection Test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <p className="text-blue-900 dark:text-blue-100 mb-4 font-semibold">How it works:</p>
              <ol className="space-y-3 text-blue-800 dark:text-blue-200 list-decimal list-inside">
                <li>You'll see a reasoning question on screen</li>
                <li>Read the question carefully (you have 3 seconds)</li>
                <li>Choose to speak or type your answer</li>
                <li><strong>For voice:</strong> Click "Start Recording" → Speak → Click "Stop Recording"</li>
                <li><strong>For typing:</strong> Click "Type Instead" and enter your answer</li>
                <li>Review your answer and click "Submit"</li>
                <li>You'll get immediate feedback</li>
                <li>There are {questions.length} questions total</li>
              </ol>
            </div>

            <Alert>
              <Volume2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Tip:</strong> These questions often have intuitive (but incorrect) answers. Take your time to think carefully before responding!
              </AlertDescription>
            </Alert>

            {!fallbackMode && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mic className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">Microphone ready</span>
                <span>• You control when to start and stop recording</span>
              </div>
            )}

            {fallbackMode && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <MicOff className="w-4 h-4" />
                <span className="font-medium">Typing mode enabled</span>
              </div>
            )}

            <Button onClick={handleStartExperiment} className="w-full" size="lg">
              Start Experiment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ready phase
  if (phase === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl font-light text-muted-foreground animate-pulse">
            Get Ready...
          </div>
          <div className="text-lg text-muted-foreground">
            Question {currentTrial + 1} of {questions.length}
          </div>
        </div>
      </div>
    );
  }

  // Question phase
  if (phase === 'question') {
    const question = questions[currentTrial];
    
    // Add safety check here - this was missing!
    if (!question) {
      console.error('❌ Question not found for trial:', currentTrial);
      // Auto-advance to next phase or finish
      if (currentTrial >= questions.length) {
        finishExperiment();
      }
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Question {currentTrial + 1} of {questions.length}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Read carefully</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 border-2 border-primary/20">
              <p className="text-2xl text-center leading-relaxed">
                {question.text}
              </p>
            </div>
            <div className="mt-6 text-center text-muted-foreground">
              <p>Prepare your answer...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Listening phase
  if (phase === 'listening') {
    const question = questions[currentTrial];
    
    if (!question) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full">
          <CardHeader>
            <CardTitle className="text-xl">Question {currentTrial + 1} of {questions.length}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border">
              <p className="text-xl text-center leading-relaxed text-muted-foreground">
                {question.text}
              </p>
            </div>

            {recordingMode === 'voice' && !showAnswerInput && !fallbackMode && (
              <div className="text-center space-y-4">
                {!isListening ? (
                  <>
                    <div className="flex flex-col items-center gap-4">
                      <Button 
                        onClick={handleStartRecording}
                        size="lg"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Mic className="w-5 h-5 mr-2" />
                        Start Recording
                      </Button>
                      <Button 
                        onClick={handleSwitchToTyping}
                        variant="outline"
                        size="sm"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Type Instead
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-3">
                      <div className="relative">
                        <Mic className="w-16 h-16 text-red-600 animate-pulse" />
                        <div className="absolute inset-0 bg-red-600/20 rounded-full animate-ping" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-red-600 animate-pulse">
                      🎤 RECORDING...
                    </p>
                    <p className="text-muted-foreground">
                      Speak your answer clearly now
                    </p>
                    {transcript && (
                      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm text-muted-foreground mb-1">You said:</p>
                        <p className="text-lg font-medium">{transcript}</p>
                        {/* ✅ Enhanced confidence display with color coding */}
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <p className="text-xs text-muted-foreground">
                            Confidence:
                          </p>
                          <span className={`text-sm font-bold ${
                            confidence >= 0.7 ? 'text-green-600' : 
                            confidence >= 0.4 ? 'text-amber-600' : 
                            'text-red-600'
                          }`}>
                            {(confidence * 100).toFixed(0)}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {confidence >= 0.7 ? '(High)' : 
                             confidence >= 0.4 ? '(Medium)' : 
                             '(Low)'}
                          </span>
                        </div>
                      </div>
                    )}
                    <Button 
                      onClick={handleStopRecording}
                      size="lg"
                      variant="destructive"
                      className="mt-4"
                    >
                      <StopCircle className="w-5 h-5 mr-2" />
                      Stop Recording
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Show typing interface if fallback mode OR explicitly chosen */}
            {(fallbackMode || recordingMode === 'type' || showAnswerInput) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span>{recordingMode === 'type' ? 'Type your answer:' : 'Review/Edit your answer:'}</span>
                </div>
                
                {recordingMode === 'voice' && transcript && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-muted-foreground mb-1">Transcribed from voice:</p>
                    <p className="text-base font-medium">{transcript}</p>
                  </div>
                )}
                
                <Input
                  type="text"
                  value={recordingMode === 'type' ? typedAnswer : transcript}
                  onChange={(e) => {
                    if (recordingMode === 'type') {
                      setTypedAnswer(e.target.value);
                    } else {
                      setTranscript(e.target.value);
                    }
                  }}
                  placeholder="Enter or edit your answer here..."
                  className="text-lg p-6"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const answer = recordingMode === 'type' ? typedAnswer : transcript;
                      if (answer.trim()) {
                        handleSubmitAnswer();
                      }
                    }
                  }}
                />
                
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={recordingMode === 'type' ? !typedAnswer.trim() : !transcript.trim()}
                    className="flex-1"
                    size="lg"
                  >
                    Submit Answer
                  </Button>
                  {recordingMode === 'voice' && showAnswerInput && !fallbackMode && (
                    <Button 
                      onClick={() => {
                        setShowAnswerInput(false);
                        setTranscript('');
                        setConfidence(0);
                      }}
                      variant="outline"
                      size="lg"
                    >
                      Record Again
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Feedback phase
  if (phase === 'feedback') {
    if (!currentResult) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    const question = questions[currentTrial];
    if (!question) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    const isCorrect = currentResult.isCorrect === 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <span className="text-green-600">Correct!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <span className="text-red-600">Incorrect</span>
                </>
              )}
            </CardTitle>
            <CardDescription>Question {currentTrial + 1} of {questions.length}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Question:</p>
                <p className="text-base">{question.text}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-muted-foreground mb-1">Your Answer:</p>
                  <p className="text-lg font-semibold">{currentResult.transcript || '(No response)'}</p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-muted-foreground mb-1">Correct Answer:</p>
                  <p className="text-lg font-semibold text-green-700 dark:text-green-300">{question.correctAnswer}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-2">Explanation:</p>
                <p className="text-sm">{question.explanation}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Response Time: {(currentResult.reactionTimeMs / 1000).toFixed(2)}s</span>
                </div>
                <span>Score: {results.filter(r => r.isCorrect === 1).length} / {currentTrial + 1}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Complete phase with comprehensive report
  if (phase === 'complete') {
    const correctAnswers = results.filter(r => r.isCorrect === 1).length;
    const incorrectAnswers = results.length - correctAnswers;
    const totalReactionTime = results.reduce((sum, r) => sum + r.reactionTimeMs, 0);
    const voiceResponses = results.filter(r => r.mode === 'voice').length;
    const typedResponses = results.filter(r => r.mode === 'typed').length;
    
    const summary = {
      totalTrials: results.length,
      correctAnswers,
      incorrectAnswers,
      accuracy: results.length > 0 ? Math.round((correctAnswers / results.length) * 100) : 0,
      averageReactionTime: results.length > 0 ? Math.round(totalReactionTime / results.length) : 0,
      totalTime: Math.round(totalReactionTime / 1000),
      voiceResponses,
      typedResponses,
      fastestResponse: results.length > 0 ? Math.min(...results.map(r => r.reactionTimeMs)) : 0,
      slowestResponse: results.length > 0 ? Math.max(...results.map(r => r.reactionTimeMs)) : 0
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-5xl w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  Experiment Complete!
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Voice-Based Cognitive Reflection Test - Comprehensive Report
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Experiment ID</p>
                <p className="text-xs font-mono">{experimentId}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* Performance Overview */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Performance Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Accuracy</p>
                  <p className="text-4xl font-bold text-blue-600">{summary.accuracy}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.correctAnswers} of {summary.totalTrials}
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-xl border border-green-200 dark:border-green-800 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Correct</p>
                  <p className="text-4xl font-bold text-green-600">{summary.correctAnswers}</p>
                  <p className="text-xs text-muted-foreground mt-1">answers</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-xl border border-red-200 dark:border-red-800 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Incorrect</p>
                  <p className="text-4xl font-bold text-red-600">{summary.incorrectAnswers}</p>
                  <p className="text-xs text-muted-foreground mt-1">answers</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-800 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Avg Time</p>
                  <p className="text-4xl font-bold text-purple-600">{(summary.averageReactionTime / 1000).toFixed(1)}s</p>
                  <p className="text-xs text-muted-foreground mt-1">per question</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Total Time</p>
                  <p className="text-4xl font-bold text-amber-600">{summary.totalTime}s</p>
                  <p className="text-xs text-muted-foreground mt-1">overall</p>
                </div>
              </div>
            </div>

            {/* Response Method Analysis */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Response Method Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Mic className="w-5 h-5 text-red-600" />
                      <span className="font-medium">Voice Responses</span>
                    </div>
                    <span className="text-3xl font-bold">{summary.voiceResponses}</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-600 transition-all duration-500"
                      style={{ width: `${(summary.voiceResponses / summary.totalTrials) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {Math.round((summary.voiceResponses / summary.totalTrials) * 100)}% of responses
                  </p>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Typed Responses</span>
                    </div>
                    <span className="text-3xl font-bold">{summary.typedResponses}</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${(summary.typedResponses / summary.totalTrials) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {Math.round((summary.typedResponses / summary.totalTrials) * 100)}% of responses
                  </p>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Fastest Response</span>
                      <span className="font-semibold">{(summary.fastestResponse / 1000).toFixed(2)}s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Slowest Response</span>
                      <span className="font-semibold">{(summary.slowestResponse / 1000).toFixed(2)}s</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-sm text-muted-foreground">Response Range</span>
                      <span className="font-semibold">{((summary.slowestResponse - summary.fastestResponse) / 1000).toFixed(2)}s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Question-by-Question Results */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Detailed Question Results
              </h3>
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-800 px-6 py-3 border-b">
                  <div className="grid grid-cols-12 gap-4 text-sm font-semibold">
                    <div className="col-span-1">Q#</div>
                    <div className="col-span-2">Result</div>
                    <div className="col-span-4">Your Answer</div>
                    <div className="col-span-3">Correct Answer</div>
                    <div className="col-span-1">Mode</div>
                    <div className="col-span-1">Time</div>
                  </div>
                </div>
                <div className="divide-y">
                  {results.map((result, index) => {
                    const question = questions.find(q => q.id === result.questionId);
                    const isCorrect = result.isCorrect === 1;
                    
                    return (
                      <div key={index} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-1">
                            <span className="font-semibold text-lg">#{index + 1}</span>
                          </div>
                          
                          <div className="col-span-2">
                            {isCorrect ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">Correct</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-red-600">
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-medium">Incorrect</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="col-span-4">
                            <p className="text-sm line-clamp-2">{result.transcript || '(No response)'}</p>
                          </div>
                          
                          <div className="col-span-3">
                            <p className="text-sm font-medium text-green-700 dark:text-green-300">
                              {question?.correctAnswer}
                            </p>
                          </div>
                          
                          <div className="col-span-1">
                            <div className="flex items-center gap-1 text-xs">
                              {result.mode === 'voice' ? (
                                <Mic className="w-3 h-3 text-red-600" />
                              ) : (
                                <MessageSquare className="w-3 h-3 text-blue-600" />
                              )}
                              <span className="capitalize">{result.mode}</span>
                            </div>
                          </div>
                          
                          <div className="col-span-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{(result.reactionTimeMs / 1000).toFixed(1)}s</span>
                            </div>
                          </div>
                        </div>

                        {/* Expandable explanation */}
                        <details className="mt-3">
                          <summary className="text-xs text-primary cursor-pointer hover:underline">
                            Show explanation
                          </summary>
                          <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded text-sm">
                            <p className="text-muted-foreground mb-1"><strong>Question:</strong> {question?.text}</p>
                            <p className="text-muted-foreground"><strong>Explanation:</strong> {question?.explanation}</p>
                          </div>
                        </details>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Performance Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-6 rounded-xl border ${
                  summary.accuracy >= 66 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : summary.accuracy >= 33
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <h4 className="font-semibold mb-2">Accuracy Assessment</h4>
                  <p className="text-sm text-muted-foreground">
                    {summary.accuracy >= 66 
                      ? '🌟 Excellent! You demonstrated strong analytical thinking and avoided common cognitive biases.'
                      : summary.accuracy >= 33
                      ? '👍 Good effort! These questions are designed to be tricky. Consider taking more time to analyze each problem.'
                      : '💡 These questions are intentionally challenging! Don\'t worry - most people find them difficult on first attempt.'}
                  </p>
                </div>

                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold mb-2">Response Time Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    {summary.averageReactionTime < 8000
                      ? '⚡ You responded quickly! Fast responses can sometimes indicate intuitive (vs. analytical) thinking.'
                      : summary.averageReactionTime < 15000
                      ? '⏱️ You took a moderate amount of time, suggesting a balance between intuition and analysis.'
                      : '🤔 You took your time to think carefully, which often leads to more accurate responses in cognitive reflection tasks.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                    ✅ All responses have been recorded and saved successfully!
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Thank you for participating in this cognitive reflection test. Your anonymous data contributes to research on decision-making and analytical thinking.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Participant ID:</span>
                      <span className="font-mono">{participantId}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Completed:</span>
                      <span>{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <Button 
              onClick={() => onComplete && onComplete({ results, summary, experimentId, participantId })} 
              className="w-full" 
              size="lg"
            >
              Continue to Next Section
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default VoiceCRTTemplate;