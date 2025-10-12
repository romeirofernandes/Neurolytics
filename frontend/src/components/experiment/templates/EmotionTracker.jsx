import React, { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, AlertCircle, CheckCircle2, Video } from 'lucide-react';

const EmotionTracker = ({ participantId, experimentId, onComplete }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const emotionIntervalRef = useRef(null);
  const previewIntervalRef = useRef(null); // Separate interval for preview
  const streamRef = useRef(null);
  const isTrackingRef = useRef(false);
  const isPreviewingRef = useRef(false);
  
  // Model and camera states
  const [isLoaded, setIsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [emotionConfidence, setEmotionConfidence] = useState(0);
  const [emotionData, setEmotionData] = useState([]);
  const [faceDetected, setFaceDetected] = useState(false);
  
  // Experiment states
  const [experimentStarted, setExperimentStarted] = useState(false);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [word, setWord] = useState('');
  const [color, setColor] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [results, setResults] = useState([]);
  const [isTraining, setIsTraining] = useState(true);
  const [showFixation, setShowFixation] = useState(false);

  const words = ['RED', 'GREEN', 'BLUE', 'YELLOW'];
  const colors = { 
    RED: 'var(--color-error)',     // Using --color-error from index.css
    GREEN: 'var(--color-success)',   // Using --color-success from index.css
    BLUE: 'var(--color-info)',    // Using --color-info from index.css
    YELLOW: 'var(--color-warning)'   // Using --color-warning from index.css
  };
  const keys = { r: 'RED', g: 'GREEN', b: 'BLUE', y: 'YELLOW' };

  // Emotion colors for visual feedback using index.css variables
  const emotionColors = {
    happy: 'var(--color-success)',    // --color-success
    sad: 'var(--color-info)',      // --color-info
    angry: 'var(--color-error)',    // --color-error
    fearful: 'var(--color-highlight)',  // --color-highlight
    disgusted: 'var(--color-warning)', // --color-warning
    surprised: 'hsl(var(--chart-4))', // Using chart-4 color from index.css
    neutral: 'var(--color-neutral)',   // --color-neutral
  };

  // 1. Load face-api.js models
  useEffect(() => {
    let mounted = true;
    
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        console.log("🔄 Loading face-api.js models...");
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        
        if (mounted) {
          setIsLoaded(true);
          console.log("✅ Face-api.js models loaded");
        }
      } catch (error) {
        console.error("❌ Error loading models:", error);
        if (mounted) {
          setCameraError("Failed to load emotion detection models. Please ensure model files are in /public/models/");
        }
      }
    };
    
    loadModels();
    
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Start camera and keep it alive
  useEffect(() => {
    if (!isLoaded) return;

    let mounted = true;
    let videoElement = videoRef.current;
    
    const startCamera = async () => {
      try {
        console.log("📹 Requesting camera access...");
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          },
          audio: false
        });

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        
        if (videoElement) {
          videoElement.srcObject = stream;
          
          // Force video to play and stay playing
          const playVideo = async () => {
            try {
              await videoElement.play();
              if (mounted) {
                setCameraReady(true);
                console.log("✅ Camera active");
                // Start preview emotion detection immediately
                startPreviewDetection();
              }
            } catch (err) {
              console.error("Error playing video:", err);
              // Retry after short delay
              setTimeout(playVideo, 500);
            }
          };

          videoElement.onloadedmetadata = playVideo;
          
          // Prevent pausing
          videoElement.onpause = () => {
            console.log("⚠️ Video paused, resuming...");
            playVideo();
          };

          // Keep stream active
          videoElement.onsuspend = () => {
            console.log("⚠️ Video suspended, reactivating...");
            playVideo();
          };
        }
      } catch (err) {
        console.error("❌ Camera error:", err);
        if (mounted) {
          setCameraError(
            err.name === 'NotAllowedError' 
              ? "Camera permission denied. Please allow camera access and refresh."
              : "Unable to access camera. Please check your camera settings."
          );
        }
      }
    };

    startCamera();

    // Cleanup
    return () => {
      mounted = false;
      isTrackingRef.current = false;
      isPreviewingRef.current = false;
      
      if (emotionIntervalRef.current) {
        clearInterval(emotionIntervalRef.current);
        emotionIntervalRef.current = null;
      }
      
      if (previewIntervalRef.current) {
        clearInterval(previewIntervalRef.current);
        previewIntervalRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log("🛑 Camera track stopped");
        });
        streamRef.current = null;
      }
    };
  }, [isLoaded]);

  // Keep video stream connected when experiment starts
  useEffect(() => {
    if (experimentStarted && videoRef.current && streamRef.current) {
      console.log("🔄 Reconnecting video stream for experiment view...");
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play()
        .then(() => console.log("✅ Video stream reconnected successfully"))
        .catch(err => console.error("Error reconnecting video:", err));
    }
  }, [experimentStarted]);

  // 3. Preview emotion detection (before experiment starts)
  const startPreviewDetection = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    console.log("👁️ Starting preview emotion detection...");
    isPreviewingRef.current = true;

    const detectPreviewEmotion = async () => {
      if (!isPreviewingRef.current || !videoRef.current) return;

      try {
        const video = videoRef.current;
        
        if (video.paused || video.ended || !video.videoWidth) return;

        const detections = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ 
            inputSize: 224,
            scoreThreshold: 0.5 
          }))
          .withFaceLandmarks()
          .withFaceExpressions();

        if (detections && isPreviewingRef.current) {
          setFaceDetected(true);
          const emotions = detections.expressions;
          const dominantEmotion = Object.keys(emotions).reduce((a, b) =>
            emotions[a] > emotions[b] ? a : b
          );

          setCurrentEmotion(dominantEmotion);
          setEmotionConfidence(emotions[dominantEmotion]);

          // Draw on canvas
          if (canvasRef.current && video.videoWidth && video.videoHeight) {
            const canvas = canvasRef.current;
            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            
            if (canvas.width !== displaySize.width || canvas.height !== displaySize.height) {
              faceapi.matchDimensions(canvas, displaySize);
            }
            
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            
            // Draw face box with thicker lines for preview
            ctx.strokeStyle = emotionColors[dominantEmotion] || '#6B7280';
            ctx.lineWidth = 3;
            const box = resizedDetections.detection.box;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
            
            // Draw emotion label with background
            ctx.fillStyle = emotionColors[dominantEmotion] || '#6B7280';
            ctx.font = 'bold 16px Arial';
            const text = `${dominantEmotion.toUpperCase()} ${(emotions[dominantEmotion] * 100).toFixed(0)}%`;
            const textMetrics = ctx.measureText(text);
            const textHeight = 20;
            const textY = box.y > 30 ? box.y - 10 : box.y + box.height + 25;
            
            // Background rectangle
            ctx.fillRect(box.x - 2, textY - textHeight, textMetrics.width + 8, textHeight + 6);
            
            // Text
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(text, box.x + 2, textY - 4);
          }
        } else {
          setFaceDetected(false);
          setCurrentEmotion("No face detected");
          setEmotionConfidence(0);
          
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }
      } catch (error) {
        console.error("Preview detection error:", error);
      }
    };

    // Start interval for preview
    previewIntervalRef.current = setInterval(detectPreviewEmotion, 1000);
  }, [emotionColors]);

  // 4. Stop preview detection
  const stopPreviewDetection = useCallback(() => {
    console.log("🛑 Stopping preview detection...");
    isPreviewingRef.current = false;
    
    if (previewIntervalRef.current) {
      clearInterval(previewIntervalRef.current);
      previewIntervalRef.current = null;
    }
  }, []);

  // 5. Emotion detection function (during experiment)
  const detectEmotion = useCallback(async () => {
    if (!isTrackingRef.current || !videoRef.current || !cameraReady) {
      console.log("⚠️ Detection skipped:", { 
        isTracking: isTrackingRef.current, 
        hasVideo: !!videoRef.current, 
        cameraReady 
      });
      return;
    }

    try {
      const video = videoRef.current;
      
      if (video.paused || video.ended || !video.videoWidth) {
        console.log("⚠️ Video not ready:", {
          paused: video.paused,
          ended: video.ended,
          dimensions: `${video.videoWidth}x${video.videoHeight}`
        });
        return;
      }

      console.log("🔍 Running detection... Video:", `${video.videoWidth}x${video.videoHeight}`);

      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ 
          inputSize: 224,
          scoreThreshold: 0.5 
        }))
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections && isTrackingRef.current) {
        setFaceDetected(true);
        const emotions = detections.expressions;
        const dominantEmotion = Object.keys(emotions).reduce((a, b) =>
          emotions[a] > emotions[b] ? a : b
        );

        console.log("✅ Face detected! Emotion:", dominantEmotion, `(${(emotions[dominantEmotion] * 100).toFixed(0)}%)`);

        const emotionRecord = {
          participantId,
          experimentId,
          timestamp: Date.now(),
          emotion: dominantEmotion,
          confidence: emotions[dominantEmotion],
          allEmotions: emotions,
          trialNumber: currentTrial,
          currentWord: word,
          currentColor: color,
          isTraining: isTraining,
        };

        setCurrentEmotion(dominantEmotion);
        setEmotionConfidence(emotions[dominantEmotion]);
        setEmotionData(prev => [...prev, emotionRecord]);

        // Draw on canvas (smaller overlay for experiment view)
        if (canvasRef.current && video.videoWidth && video.videoHeight) {
          const canvas = canvasRef.current;
          const displaySize = { width: video.videoWidth, height: video.videoHeight };
          
          if (canvas.width !== displaySize.width || canvas.height !== displaySize.height) {
            console.log("📐 Updating canvas dimensions to:", displaySize);
            faceapi.matchDimensions(canvas, displaySize);
          }
          
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          
          // Draw face box
          faceapi.draw.drawDetections(canvas, resizedDetections);
          
          // Draw emotion label
          const box = resizedDetections.detection.box;
          ctx.fillStyle = emotionColors[dominantEmotion] || '#6B7280';
          ctx.font = 'bold 12px Arial';
          ctx.fillText(
            `${dominantEmotion.toUpperCase()} ${(emotions[dominantEmotion] * 100).toFixed(0)}%`,
            box.x,
            box.y > 20 ? box.y - 8 : box.y + box.height + 18
          );
        }

        // Send to backend (non-blocking)
        axios.post(`${import.meta.env.VITE_API_URL}/api/emotions`, {
          participantId,
          experimentId,
          timestamp: emotionRecord.timestamp,
          emotion: dominantEmotion,
          confidence: emotions[dominantEmotion],
          allEmotions: emotions,
        }).catch(err => console.error("Error saving emotion (non-critical):", err.message));

      } else {
        console.log("⚠️ No face detected in frame");
        setFaceDetected(false);
        setCurrentEmotion("No face detected");
        setEmotionConfidence(0);
        
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    } catch (error) {
      console.error("Detection error:", error);
    }
  }, [participantId, experimentId, currentTrial, word, color, isTraining, cameraReady, emotionColors]);

  // 6. Start emotion tracking (during experiment)
  const startEmotionTracking = useCallback(() => {
    if (!videoRef.current || !cameraReady) {
      console.log("⚠️ Cannot start tracking - camera not ready");
      return;
    }

    // Stop preview detection
    stopPreviewDetection();

    console.log("🎬 Starting experiment emotion tracking...");
    isTrackingRef.current = true;

    if (emotionIntervalRef.current) {
      clearInterval(emotionIntervalRef.current);
    }

    emotionIntervalRef.current = setInterval(detectEmotion, 1000);
  }, [cameraReady, detectEmotion, stopPreviewDetection]);

  // 7. Stop emotion tracking
  const stopEmotionTracking = useCallback(() => {
    console.log("🛑 Stopping emotion tracking...");
    isTrackingRef.current = false;
    
    if (emotionIntervalRef.current) {
      clearInterval(emotionIntervalRef.current);
      emotionIntervalRef.current = null;
    }
  }, []);

  // 8. Stroop experiment logic
  const generateTrial = useCallback(() => {
    const newWord = words[Math.floor(Math.random() * words.length)];
    const newColor = words[Math.floor(Math.random() * words.length)];
    
    setShowFixation(true);
    setWord('');
    setColor('');
    
    setTimeout(() => {
      setShowFixation(false);
      setWord(newWord);
      setColor(newColor);
      setStartTime(Date.now());
    }, 500);
  }, []);

  const handleResponse = useCallback((response) => {
    if (!word || !color) return;
    
    const rt = Date.now() - startTime;
    const correct = response === color;
    const compatible = word === color ? 1 : 0;

    const result = {
      trialNumber: currentTrial,
      word,
      color,
      compatible,
      response,
      correct: correct ? 1 : 0,
      rt,
      timestamp: Date.now(),
      emotionAtResponse: currentEmotion,
    };

    setResults(prev => [...prev, result]);

    const nextTrial = currentTrial + 1;
    if (isTraining && nextTrial >= 10) {
      setIsTraining(false);
      setCurrentTrial(0);
      generateTrial();
    } else if (!isTraining && nextTrial >= 40) {
      finishExperiment();
    } else {
      setCurrentTrial(nextTrial);
      generateTrial();
    }
  }, [word, color, startTime, currentTrial, isTraining, currentEmotion, generateTrial]);

  const finishExperiment = useCallback(() => {
    console.log("🎉 Experiment complete!");
    stopEmotionTracking();

    const finalData = {
      stroopResults: results,
      emotionData: emotionData,
      participantId,
      experimentId,
      completedAt: new Date().toISOString(),
      summary: {
        totalTrials: results.length,
        accuracy: (results.filter(r => r.correct === 1).length / results.length * 100).toFixed(2) + '%',
        averageRT: (results.reduce((sum, r) => sum + r.rt, 0) / results.length).toFixed(0) + 'ms',
        emotionsTracked: emotionData.length,
      }
    };

    if (onComplete) {
      onComplete(finalData);
    }
  }, [results, emotionData, participantId, experimentId, stopEmotionTracking, onComplete]);

  // 9. Keyboard handler
  useEffect(() => {
    if (!experimentStarted) return;

    const handleKeyPress = (e) => {
      const key = e.key.toLowerCase();
      if (keys[key] && !showFixation) {
        handleResponse(keys[key]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [experimentStarted, showFixation, handleResponse, keys]);

  // 10. Start experiment
  const startExperiment = () => {
    if (!cameraReady) {
      alert("Please wait for camera to initialize");
      return;
    }

    console.log("🚀 Starting experiment...");
    
    // Ensure video stream is maintained
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => console.error("Error playing video:", err));
    }
    
    setExperimentStarted(true);
    
    // Small delay to ensure DOM is updated before starting tracking
    setTimeout(() => {
      // Re-attach stream to video element after state change
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play()
          .then(() => {
            console.log("✅ Video stream maintained during transition");
            startEmotionTracking();
            generateTrial();
          })
          .catch(err => {
            console.error("Error playing video:", err);
            // Try again
            setTimeout(() => {
              if (videoRef.current && streamRef.current) {
                videoRef.current.srcObject = streamRef.current;
                videoRef.current.play();
              }
            }, 100);
            startEmotionTracking();
            generateTrial();
          });
      } else {
        startEmotionTracking();
        generateTrial();
      }
    }, 100);
  };

  // === RENDER ===

  if (cameraError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-8 h-8" />
              <CardTitle>Camera Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{cameraError}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!experimentStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-4xl text-center">Stroop Task with Emotion Tracking</CardTitle>
            <CardDescription className="text-center text-base mt-2">
              Combines classic cognitive task with real-time facial emotion recognition
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative rounded-lg overflow-hidden border bg-black shadow-lg">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '400px', height: '300px', objectFit: 'cover' }}
                  className="rounded-lg"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{ width: '400px', height: '300px' }}
                />
                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/90">
                    <div className="text-primary-foreground text-center">
                      <Camera className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                      <p className="text-sm">Starting camera...</p>
                    </div>
                  </div>
                )}
                {cameraReady && !faceDetected && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-warning text-warning-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                    ⚠️ Position your face in the frame
                  </div>
                )}
              </div>

              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  {isLoaded ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span className="text-success font-semibold">Models Ready</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-muted-foreground">Loading models...</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {cameraReady ? (
                    <>
                      <Video className="w-5 h-5 text-success animate-pulse" />
                      <span className="text-success font-semibold">Camera Active</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-muted-foreground">Starting camera...</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {faceDetected ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span className="text-success font-semibold">Face Detected</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-warning" />
                      <span className="text-warning font-semibold">Looking for face...</span>
                    </>
                  )}
                </div>
              </div>

              {currentEmotion && faceDetected && (
                <div className="px-6 py-3 bg-muted rounded-lg border shadow">
                  <div className="text-center space-y-2">
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      Current Emotion Detected
                    </div>
                    <div className="flex items-center gap-3 justify-center">
                      <div 
                        className="w-4 h-4 rounded-full shadow-lg"
                        style={{ 
                          backgroundColor: emotionColors[currentEmotion],
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}
                      />
                      <span className="text-2xl font-bold capitalize" style={{ color: emotionColors[currentEmotion] }}>
                        {currentEmotion}
                      </span>
                      <span className="text-lg font-semibold text-muted-foreground">
                        {(emotionConfidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-xs text-success font-medium">
                      ✓ Emotion tracking working correctly!
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-muted border rounded-lg p-6">
              <div className="text-center space-y-2">
                <p className="text-base text-foreground">
                  Press the key for the <span className="text-xl font-black text-destructive underline">COLOR</span> you see,{' '}
                  <span className="font-bold">NOT the word!</span>
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="font-semibold text-base mb-2">What to expect:</p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>10 practice trials (to learn)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>40 test trials (for real data)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Takes about 5-7 minutes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Your face will be tracked throughout</span>
                  </li>
                </ul>
              </div>
            </div>

          {/* Start Button */}
          <div className="mt-8 max-w-2xl mx-auto space-y-4">
            <Button
              onClick={startExperiment}
              disabled={!isLoaded || !cameraReady || !faceDetected}
              className="w-full h-14 text-lg font-semibold"
              size="lg"
            >
              {!isLoaded ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Loading models...
                </span>
              ) : !cameraReady ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Starting camera...
                </span>
              ) : !faceDetected ? (
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Waiting for Face Detection...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Start Experiment
                </span>
              )}
            </Button>
            
            {!faceDetected && cameraReady && (
              <p className="text-center text-sm text-warning font-medium">
                ⚠️ Please position your face clearly in front of the camera to enable the start button
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Camera Feed - Always visible in corner */}
      <div className="fixed top-4 right-4 z-50">
        <Card className="w-80 shadow-2xl">
          <CardContent className="p-3 space-y-2">
            <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="rounded-lg border border-slate-300 dark:border-slate-600 w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 rounded-lg pointer-events-none w-full h-full"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
              {!faceDetected && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                  No Face
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between text-sm p-2 bg-secondary rounded">
              <span className="text-muted-foreground">Emotion:</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: emotionColors[currentEmotion] || '#6B7280' }}
                />
                <span className="font-semibold capitalize">
                  {currentEmotion || "Detecting..."}
                </span>
                <span className="text-xs text-muted-foreground">
                  {emotionConfidence ? `${(emotionConfidence * 100).toFixed(0)}%` : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
              <span>Trial {currentTrial + 1}/{isTraining ? 10 : 40}</span>
              <span className="font-medium">
                {isTraining ? "🎓 Training" : "🧪 Test"}
              </span>
              <span className={faceDetected ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {faceDetected ? "✓ Face" : "⚠ No Face"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Stroop Task</CardTitle>
            <CardDescription>
              {isTraining ? `Training ${currentTrial + 1}/10` : `Test ${currentTrial + 1}/40`}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center text-sm text-muted-foreground">
              Press the key for the <strong>COLOR</strong> (not the word)
            </div>

            <div className="flex justify-center items-center h-64 bg-slate-50 dark:bg-slate-900 rounded-lg">
              {showFixation ? (
                <div className="text-8xl text-foreground font-light">+</div>
              ) : (
                <div
                  className="text-7xl font-bold"
                  style={{ color: colors[color] }}
                >
                  {word}
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {Object.entries(colors).map(([name, colorValue]) => (
                <Button
                  key={name}
                  onClick={() => handleResponse(name)}
                  disabled={showFixation}
                  style={{ 
                    backgroundColor: colorValue,
                    opacity: showFixation ? 0.4 : 1,
                  }}
                  className="text-white h-12 text-lg font-bold hover:opacity-90"
                >
                  {name[0]}
                </Button>
              ))}
            </div>

            <div className="text-center text-xs text-muted-foreground bg-secondary p-2 rounded">
              <strong>R</strong> Red • <strong>G</strong> Green • <strong>B</strong> Blue • <strong>Y</strong> Yellow
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmotionTracker;
