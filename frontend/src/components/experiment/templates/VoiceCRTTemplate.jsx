import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Mic, MicOff, Volume2, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
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

  // Settings - INCREASED TIMEOUTS
  const settings = {
    language: 'en-IN',
    maxTrialDurationMs: 15000,
    interTrialIntervalMs: 2000,
    speechTimeoutMs: 12000,
    allowTypedFallback: true,
    continuous: false,
    interimResults: false
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
    // Check if Web Speech API is supported
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
        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop immediately, just checking permission
        setIsMicPermissionGranted(true);
        console.log("✅ Microphone permission granted");
        
        // Initialize VoiceManager after permission granted
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
    // Validate props before starting
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
    trialStartTimeRef.current = performance.now();

    // Show question, then start listening after 2 seconds
    setTimeout(() => {
      if (!fallbackMode) {
        startListening();
      } else {
        setPhase('listening'); // In fallback, just show input
      }
    }, 2000);
  };

  // 5. Start listening - FIXED VERSION
  const startListening = () => {
    if (!voiceManagerRef.current) {
      console.error("❌ Voice Manager not initialized");
      setFallbackMode(true);
      setPhase('listening');
      return;
    }

    console.log("🎤 Starting to listen...");
    setPhase('listening');
    setIsListening(true);
    speechStartTimeRef.current = performance.now();

    // Clear any existing timeout
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }

    // Start speech recognition
    voiceManagerRef.current.start(
      // onResult callback
      async ({ transcript: voiceTranscript, confidence: voiceConfidence, isFinal }) => {
        console.log("🎤 Speech detected:", voiceTranscript, "Confidence:", voiceConfidence, "isFinal:", isFinal);
        
        // Only process if we have a transcript
        if (voiceTranscript && voiceTranscript.trim()) {
          const speechEndTime = performance.now();
          const reactionTime = Math.round(speechEndTime - trialStartTimeRef.current);
          
          setTranscript(voiceTranscript);
          setConfidence(voiceConfidence);
          
          // Stop listening
          setIsListening(false);
          voiceManagerRef.current.stop();

          // Clear timeout
          if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
            speechTimeoutRef.current = null;
          }

          // Process result
          await processTrialResult(voiceTranscript, voiceConfidence, reactionTime, speechEndTime);
        }
      },
      // onEnd callback - DON'T immediately restart
      () => {
        console.log("🎤 Speech recognition ended");
        
        // Only handle if we're still in listening phase and haven't got a result
        if (isListening && !transcript) {
          console.log("⚠️ Recognition ended without transcript");
          // Don't automatically restart - let user see what happened
          setIsListening(false);
        }
      },
      // onError callback
      (error) => {
        console.error("❌ Speech recognition error:", error);
        setIsListening(false);
        
        // Clear timeout
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
          speechTimeoutRef.current = null;
        }
        
        // Switch to fallback mode
        if (error.error === 'not-allowed' || error.error === 'service-not-allowed') {
          alert("Microphone access was denied. Switching to typed input mode.");
          setFallbackMode(true);
          setPhase('listening');
        }
      }
    );

    // Set timeout - only if no response received
    speechTimeoutRef.current = setTimeout(() => {
      if (isListening && !transcript) {
        console.log("⏱️ Speech timeout - no response received");
        if (voiceManagerRef.current) {
          voiceManagerRef.current.stop();
        }
        setIsListening(false);
        
        // Offer to switch to typing
        if (confirm("No speech detected. Would you like to type your answer instead?")) {
          setFallbackMode(true);
          setPhase('listening');
        } else {
          // Record empty response
          processTrialResult("", 0, settings.speechTimeoutMs, performance.now());
        }
      }
    }, settings.speechTimeoutMs);
  };

  // 6. Retry listening button
  const handleRetryListening = () => {
    setTranscript('');
    setConfidence(0);
    startListening();
  };

  // 7. Process trial result
  const processTrialResult = async (voiceTranscript, voiceConfidence, reactionTime, speechEndTime) => {
    // Validate props before processing
    if (!participantId || !experimentId) {
      console.error("❌ Cannot process result: Missing participantId or experimentId");
      console.log("Current props:", { participantId, experimentId });
      alert("Error: Missing experiment configuration. Results cannot be saved.");
      return;
    }

    const question = questions[currentTrial];
    
    // Check if answer is correct
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
      transcriptConfidence: voiceConfidence,
      reactionTimeMs: reactionTime,
      speechStartTimestamp: trialStartTimeRef.current,
      speechEndTimestamp: speechEndTime,
      isCorrect: isCorrect ? 1 : 0,
      correctAnswer: question.correctAnswer,
      mode: fallbackMode ? 'typed' : 'voice',
      createdAt: new Date().toISOString()
    };

    console.log("📊 Trial result:", result);

    setCurrentResult(result);
    setResults(prev => [...prev, result]);

    // Save to backend
    try {
      console.log("💾 Saving to backend:", result);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/voice-responses`, result);
      console.log("✅ Voice response saved to backend:", response.data);
    } catch (error) {
      console.error("❌ Error saving voice response:", error);
      console.error("Error details:", error.response?.data);
    }

    // Show feedback
    setPhase('feedback');

    // Move to next trial after delay
    setTimeout(() => {
      setCurrentTrial(prev => prev + 1);
    }, settings.interTrialIntervalMs);
  };

  // 8. Handle typed submission (fallback mode)
  const handleSubmitTyped = () => {
    const reactionTime = Math.round(performance.now() - trialStartTimeRef.current);
    processTrialResult(typedAnswer, 1.0, reactionTime, performance.now());
  };

  // 9. Finish experiment
  const finishExperiment = () => {
    setPhase('complete');
    
    // Calculate summary
    const correctAnswers = results.filter(r => r.isCorrect === 1).length;
    const totalReactionTime = results.reduce((sum, r) => sum + r.reactionTimeMs, 0);
    
    const summary = {
      totalTrials: results.length,
      correctAnswers,
      accuracy: results.length > 0 ? Math.round((correctAnswers / results.length) * 100) : 0,
      averageReactionTime: results.length > 0 ? Math.round(totalReactionTime / results.length) : 0
    };

    console.log("🎉 Experiment complete:", summary);

    // Call onComplete callback if provided
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
                <li>Speak your answer aloud clearly</li>
                <li>Your speech is converted to text automatically</li>
                <li>Response time and accuracy are measured</li>
                <li>Takes approximately 5-7 minutes</li>
              </ul>
            </div>

            {!isVoiceSupported && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Web Speech API is not supported in your browser. You can still participate using typed responses instead.
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
                Use Typed Responses Instead
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
                <li>Read the question carefully</li>
                {!fallbackMode ? (
                  <>
                    <li>When you see "🎤 LISTENING", speak your answer clearly</li>
                    <li>Your speech will be automatically converted to text</li>
                    <li>If recognition fails, you can retry or type your answer</li>
                  </>
                ) : (
                  <>
                    <li>Type your answer in the text box</li>
                    <li>Click Submit when ready</li>
                  </>
                )}
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
                <span>• Speak clearly in a quiet environment</span>
              </div>
            )}

            {fallbackMode && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <MicOff className="w-4 h-4" />
                <span className="font-medium">Fallback mode: Typed responses</span>
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
              {!fallbackMode ? (
                <p className="animate-pulse">Prepare to speak your answer...</p>
              ) : (
                <p>Prepare to type your answer...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Listening phase
  if (phase === 'listening') {
    const question = questions[currentTrial];
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

            {!fallbackMode ? (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="relative">
                    <Mic className="w-16 h-16 text-red-600 animate-pulse" />
                    <div className="absolute inset-0 bg-red-600/20 rounded-full animate-ping" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-red-600 animate-pulse">
                  🎤 LISTENING...
                </p>
                <p className="text-muted-foreground">
                  Speak your answer clearly now
                </p>
                {transcript && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-muted-foreground mb-1">You said:</p>
                    <p className="text-lg font-medium">{transcript}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Confidence: {(confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                )}
                
                {/* Retry and Fallback buttons */}
                {isListening && (
                  <div className="flex gap-3 justify-center mt-6">
                    <Button 
                      onClick={() => {
                        if (voiceManagerRef.current) {
                          voiceManagerRef.current.stop();
                        }
                        setIsListening(false);
                        setTimeout(() => handleRetryListening(), 500);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Retry
                    </Button>
                    <Button 
                      onClick={() => {
                        if (voiceManagerRef.current) {
                          voiceManagerRef.current.stop();
                        }
                        setIsListening(false);
                        setFallbackMode(true);
                        setPhase('listening');
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Type Instead
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span>Type your answer:</span>
                </div>
                <Input
                  type="text"
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder="Enter your answer here..."
                  className="text-lg p-6"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && typedAnswer.trim()) {
                      handleSubmitTyped();
                    }
                  }}
                />
                <Button 
                  onClick={handleSubmitTyped} 
                  disabled={!typedAnswer.trim()}
                  className="w-full"
                  size="lg"
                >
                  Submit Answer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // FIXED: Check if currentResult exists before rendering feedback
  if (phase === 'feedback') {
    if (!currentResult) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    const question = questions[currentTrial];
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
                  <span>Response Time: {currentResult.reactionTimeMs}ms</span>
                </div>
                <span>Score: {results.filter(r => r.isCorrect === 1).length} / {currentTrial + 1}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === 'complete') {
    const correctAnswers = results.filter(r => r.isCorrect === 1).length;
    const totalReactionTime = results.reduce((sum, r) => sum + r.reactionTimeMs, 0);
    
    const summary = {
      totalTrials: results.length,
      correctAnswers,
      accuracy: results.length > 0 ? Math.round((correctAnswers / results.length) * 100) : 0,
      averageReactionTime: results.length > 0 ? Math.round(totalReactionTime / results.length) : 0
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              Experiment Complete!
            </CardTitle>
            <CardDescription>Voice-Based Cognitive Reflection Test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
                <p className="text-sm text-muted-foreground mb-2">Accuracy</p>
                <p className="text-4xl font-bold text-blue-600">{summary.accuracy}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.correctAnswers} / {summary.totalTrials} correct
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-800 text-center">
                <p className="text-sm text-muted-foreground mb-2">Avg Response Time</p>
                <p className="text-4xl font-bold text-purple-600">{summary.averageReactionTime}</p>
                <p className="text-xs text-muted-foreground mt-1">milliseconds</p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ Your responses have been recorded and saved. Thank you for participating!
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Mode: {fallbackMode ? 'Typed Input' : 'Voice Recognition'}
              </p>
            </div>

            <Button onClick={() => onComplete && onComplete({ results, summary })} className="w-full" size="lg">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default VoiceCRTTemplate;