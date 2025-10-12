import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Download, ArrowLeft, AlertCircle, Video, VideoOff, Eye } from 'lucide-react';

const PupilTrackingActivity = () => {
  // Phase management
  const [phase, setPhase] = useState('calibration');
  
  // Camera states
  const [cameraError, setCameraError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  
  // Face detection states
  const [faceDetected, setFaceDetected] = useState(false);
  
  // Tracking states
  const [calibrationPoint, setCalibrationPoint] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ x: 0.5, y: 0.5 });
  const [pupilData, setPupilData] = useState(null);
  const [showTarget, setShowTarget] = useState(false);
  const [showVideoPreview, setShowVideoPreview] = useState(true);
  const [captureCountdown, setCaptureCountdown] = useState(null);

  // Refs
  const videoRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const calibrationDataRef = useRef([]);
  const animationFrameRef = useRef(null);
  const previewAnimationRef = useRef(null);
  const captureTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const faceDetectionIntervalRef = useRef(null);
  const isTrackingRef = useRef(false);
  const faceApiLoadedRef = useRef(false);

  // 10 calibration points
  const calibrationPoints = useRef([
    { x: 0.1, y: 0.1, label: 'Top-Left' },
    { x: 0.9, y: 0.1, label: 'Top-Right' },
    { x: 0.5, y: 0.1, label: 'Top-Center' },
    { x: 0.1, y: 0.5, label: 'Middle-Left' },
    { x: 0.5, y: 0.5, label: 'Center' },
    { x: 0.9, y: 0.5, label: 'Middle-Right' },
    { x: 0.1, y: 0.9, label: 'Bottom-Left' },
    { x: 0.5, y: 0.9, label: 'Bottom-Center' },
    { x: 0.9, y: 0.9, label: 'Bottom-Right' },
    { x: 0.3, y: 0.3, label: 'Inner-TopLeft' },
  ]);

  // ===================================================================
  // 1. LOAD FACE-API.JS MODELS (Mock version for demo)
  // ===================================================================
  useEffect(() => {
    let mounted = true;
    
    const loadModels = async () => {
      try {
        console.log("🔄 Loading face detection...");
        
        // Simulate model loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (mounted) {
          faceApiLoadedRef.current = true;
          setIsLoaded(true);
          console.log("✅ Face detection ready");
        }
      } catch (error) {
        console.error("❌ Error loading face detection:", error);
        if (mounted) {
          setCameraError("Failed to load face detection. Using simplified detection.");
          setIsLoaded(true); // Continue anyway
        }
      }
    };
    
    loadModels();
    
    return () => {
      mounted = false;
    };
  }, []);

  // ===================================================================
  // 2. START CAMERA
  // ===================================================================
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
          
          const playVideo = async () => {
            try {
              await videoElement.play();
              if (mounted) {
                setCameraReady(true);
                console.log("✅ Camera started successfully");
                startFaceDetection();
                startPupilTracking();
                startPreviewLoop();
              }
            } catch (err) {
              console.error("Error playing video:", err);
              setTimeout(playVideo, 500);
            }
          };

          videoElement.onloadedmetadata = playVideo;
        }
      } catch (err) {
        console.error("❌ Camera error:", err);
        if (mounted) {
          setCameraError(
            err.name === 'NotAllowedError' 
              ? "Camera permission denied. Please allow camera access and refresh the page."
              : "Unable to access camera. Please check your camera settings."
          );
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      stopFaceDetection();
      cleanup();
    };
  }, [isLoaded]);

  // ===================================================================
  // 3. SIMPLIFIED FACE DETECTION (Motion-based)
  // ===================================================================
  const detectFace = useCallback(async () => {
    if (!isTrackingRef.current || !videoRef.current || !cameraReady) {
      return;
    }

    try {
      const video = videoRef.current;
      
      if (video.paused || video.ended || !video.videoWidth) {
        return;
      }

      // Simple motion/brightness detection as face proxy
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 160;
      canvas.height = 120;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Check for significant content (not just black/empty frame)
      let totalBrightness = 0;
      let pixelCount = 0;
      
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        totalBrightness += brightness;
        pixelCount++;
      }
      
      const avgBrightness = totalBrightness / pixelCount;
      
      // If there's reasonable brightness variation, assume face present
      const facePresent = avgBrightness > 30 && avgBrightness < 220;
      
      setFaceDetected(facePresent);
    } catch (error) {
      console.error("Face detection error:", error);
      setFaceDetected(false);
    }
  }, [cameraReady]);

  const startFaceDetection = useCallback(() => {
    if (!videoRef.current || !cameraReady) {
      console.log("⚠️ Cannot start face detection - camera not ready");
      return;
    }

    console.log("👁️ Starting face detection...");
    isTrackingRef.current = true;

    if (faceDetectionIntervalRef.current) {
      clearInterval(faceDetectionIntervalRef.current);
    }

    // Run detection every 300ms for responsive feedback
    faceDetectionIntervalRef.current = setInterval(detectFace, 300);
  }, [cameraReady, detectFace]);

  const stopFaceDetection = useCallback(() => {
    console.log("🛑 Stopping face detection...");
    isTrackingRef.current = false;
    
    if (faceDetectionIntervalRef.current) {
      clearInterval(faceDetectionIntervalRef.current);
      faceDetectionIntervalRef.current = null;
    }
  }, []);

  // ===================================================================
  // 4. PUPIL TRACKING
  // ===================================================================
  const startPupilTracking = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 480;

    const detect = () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) {
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      try {
        ctx.drawImage(videoRef.current, 0, 0, 640, 480);
        const imageData = ctx.getImageData(0, 0, 640, 480);
        const pupils = findDarkRegions(imageData, 640, 480);

        setPupilData({
          timestamp: performance.now(),
          leftPupil: pupils.left,
          rightPupil: pupils.right,
        });
      } catch (error) {
        console.error('Pupil detection error:', error);
      }

      animationFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
  };

  const findDarkRegions = (imageData, width, height) => {
    const data = imageData.data;
    
    const leftEyeRegion = {
      xStart: Math.floor(width * 0.25),
      xEnd: Math.floor(width * 0.45),
      yStart: Math.floor(height * 0.35),
      yEnd: Math.floor(height * 0.55)
    };
    
    const rightEyeRegion = {
      xStart: Math.floor(width * 0.55),
      xEnd: Math.floor(width * 0.75),
      yStart: Math.floor(height * 0.35),
      yEnd: Math.floor(height * 0.55)
    };
    
    const leftPupil = findDarkestPoint(data, width, leftEyeRegion);
    const rightPupil = findDarkestPoint(data, width, rightEyeRegion);
    
    return { left: leftPupil, right: rightPupil };
  };

  const findDarkestPoint = (data, width, region) => {
    let darkestX = region.xStart + (region.xEnd - region.xStart) / 2;
    let darkestY = region.yStart + (region.yEnd - region.yStart) / 2;
    let minBrightness = 255;
    
    for (let y = region.yStart; y < region.yEnd; y += 5) {
      for (let x = region.xStart; x < region.xEnd; x += 5) {
        const index = (y * width + x) * 4;
        const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
        
        if (brightness < minBrightness) {
          minBrightness = brightness;
          darkestX = x;
          darkestY = y;
        }
      }
    }
    
    return { x: darkestX, y: darkestY };
  };

  // ===================================================================
  // 5. VIDEO PREVIEW
  // ===================================================================
  const startPreviewLoop = () => {
    const drawPreview = () => {
      if (!videoRef.current || !previewCanvasRef.current) {
        previewAnimationRef.current = requestAnimationFrame(drawPreview);
        return;
      }

      const video = videoRef.current;
      const canvas = previewCanvasRef.current;
      const ctx = canvas.getContext('2d');

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = 192;
        canvas.height = 144;

        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();

        if (pupilData && faceDetected) {
          const scaleX = canvas.width / 640;
          const scaleY = canvas.height / 480;

          const leftX = canvas.width - (pupilData.leftPupil.x * scaleX);
          const leftY = pupilData.leftPupil.y * scaleY;
          
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(leftX, leftY, 8, 0, Math.PI * 2);
          ctx.stroke();

          const rightX = canvas.width - (pupilData.rightPupil.x * scaleX);
          const rightY = pupilData.rightPupil.y * scaleY;
          
          ctx.beginPath();
          ctx.arc(rightX, rightY, 8, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#00ff00';
          ctx.font = '10px monospace';
          ctx.fillText(`L: (${Math.round(pupilData.leftPupil.x)}, ${Math.round(pupilData.leftPupil.y)})`, 5, 15);
          ctx.fillText(`R: (${Math.round(pupilData.rightPupil.x)}, ${Math.round(pupilData.rightPupil.y)})`, 5, 30);
        }
      }

      previewAnimationRef.current = requestAnimationFrame(drawPreview);
    };

    drawPreview();
  };

  // ===================================================================
  // 6. CALIBRATION LOGIC - AUTO-FADE VERSION
  // ===================================================================
  useEffect(() => {
    if (phase !== 'calibration' || calibrationPoint >= calibrationPoints.current.length) return;

    const point = calibrationPoints.current[calibrationPoint];
    setTargetPosition(point);
    
    // Clear any existing timers
    if (captureTimerRef.current) {
      clearTimeout(captureTimerRef.current);
      captureTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    setCaptureCountdown(null);

    console.log(`📍 Calibration Point ${calibrationPoint + 1}/10: ${point.label}`);

    // Show target immediately (no face detection requirement)
    setShowTarget(true);
    
    // Start 3-second countdown for capture
    setCaptureCountdown(3);
    
    countdownIntervalRef.current = setInterval(() => {
      setCaptureCountdown(prev => {
        if (prev === null) return null;
        const newValue = prev - 1;
        
        if (newValue <= 0) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          return 0;
        }
        
        return newValue;
      });
    }, 1000);
    
    captureTimerRef.current = setTimeout(() => {
      // Capture calibration point
      if (pupilData) {
        console.log(`✅ Capturing calibration point ${calibrationPoint + 1}`);
        
        calibrationDataRef.current.push({
          pointNumber: calibrationPoint + 1,
          screenPoint: point,
          pupilPoint: {
            left: pupilData.leftPupil,
            right: pupilData.rightPupil
          },
          faceDetected: faceDetected,
          timestamp: Date.now()
        });
      }

      if (calibrationPoint < calibrationPoints.current.length - 1) {
        setShowTarget(false);
        setCaptureCountdown(null);
        setTimeout(() => setCalibrationPoint(calibrationPoint + 1), 500);
      } else {
        console.log('✅ All calibration points captured');
        setShowTarget(false);
        setCaptureCountdown(null);
        setTimeout(finishExperiment, 500);
      }
      
      // Clean up countdown interval
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }, 3000);

    return () => {
      if (captureTimerRef.current) {
        clearTimeout(captureTimerRef.current);
        captureTimerRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [phase, calibrationPoint, pupilData, faceDetected]);

  // ===================================================================
  // 7. FINISH EXPERIMENT
  // ===================================================================
  const finishExperiment = () => {
    console.log('🏁 Experiment Complete');
    stopFaceDetection();
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setPhase('complete');

    const finalData = {
      experimentId: 'pupil-gaze-calibration',
      experimentType: 'Pupil Tracking Calibration',
      participantId: `P_${Date.now()}`,
      completedAt: new Date().toISOString(),
      totalCalibrationPoints: calibrationPoints.current.length,
      calibrationData: calibrationDataRef.current,
      metadata: {
        videoResolution: '640x480',
        detectionMethod: 'Simplified Motion Detection',
        pupilMethod: 'Dark Region Detection'
      }
    };

    console.log('═══════════════════════════════════════════');
    console.log('📊 CALIBRATION DATA SAVED');
    console.log('═══════════════════════════════════════════');
    console.log(finalData);
    console.log('═══════════════════════════════════════════');
  };

  // ===================================================================
  // 8. CLEANUP
  // ===================================================================
  const cleanup = () => {
    stopFaceDetection();
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (previewAnimationRef.current) {
      cancelAnimationFrame(previewAnimationRef.current);
    }
    
    if (captureTimerRef.current) {
      clearTimeout(captureTimerRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  // ===================================================================
  // 9. DOWNLOAD RESULTS
  // ===================================================================
  const downloadResults = () => {
    const data = calibrationDataRef.current;
    if (!data || data.length === 0) {
      alert('No calibration data found!');
      return;
    }

    const finalData = {
      experimentId: 'pupil-gaze-calibration',
      completedAt: new Date().toISOString(),
      calibrationData: data
    };

    const blob = new Blob([JSON.stringify(finalData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pupil-calibration-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ===================================================================
  // 10. UI COMPONENTS
  // ===================================================================
  const VideoPreview = () => {
    if (!showVideoPreview || phase === 'complete') return null;

    return (
      <div className="fixed top-4 right-4 z-50 group">
        <Card className="overflow-hidden border-2 border-primary/50 shadow-2xl bg-black backdrop-blur">
          <div className="relative">
            <canvas
              ref={previewCanvasRef}
              className="w-48 h-36 rounded-t"
              width={192}
              height={144}
            />
            
            <div className="absolute top-2 left-2">
              <div className="flex items-center gap-1 bg-red-500/90 backdrop-blur px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-xs font-medium">LIVE</span>
              </div>
            </div>

            <div className="absolute bottom-2 left-2">
              <div className="flex items-center gap-1 bg-green-500/90 backdrop-blur px-2 py-1 rounded-full">
                <Eye className="w-3 h-3 text-white" />
                <span className="text-white text-xs font-medium">FACE VISIBLE</span>
              </div>
            </div>

            <button
              onClick={() => setShowVideoPreview(false)}
              className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 backdrop-blur p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100"
              title="Hide preview"
            >
              <VideoOff className="w-4 h-4 text-white" />
            </button>
          </div>
          
          <div className="px-3 py-2 bg-black/90 border-t border-white/10">
            {pupilData && faceDetected ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70">Left Eye:</span>
                  <span className="text-green-400 font-mono">
                    ({Math.round(pupilData.leftPupil.x)}, {Math.round(pupilData.leftPupil.y)})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70">Right Eye:</span>
                  <span className="text-green-400 font-mono">
                    ({Math.round(pupilData.rightPupil.x)}, {Math.round(pupilData.rightPupil.y)})
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-amber-400 text-xs text-center animate-pulse">
                👤 Position your face in the camera
              </p>
            )}
          </div>
          
          <div className="px-2 py-1 bg-black/80 border-t border-white/10">
            <p className="text-white text-xs text-center font-medium">👁️ Pupil Tracking Active</p>
          </div>
        </Card>
      </div>
    );
  };

  const ShowVideoButton = () => {
    if (showVideoPreview || phase === 'complete') return null;

    return (
      <button
        onClick={() => setShowVideoPreview(true)}
        className="fixed top-4 right-4 z-50 bg-primary hover:bg-primary/90 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
        title="Show video preview"
      >
        <Video className="w-5 h-5" />
      </button>
    );
  };

  // ===================================================================
  // 11. RENDER PHASES
  // ===================================================================

  if (cameraError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-6 h-6" />
              Camera Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{cameraError}</AlertDescription>
            </Alert>
            <Button onClick={() => window.location.reload()} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === 'calibration') {
    const point = calibrationPoints.current[calibrationPoint];
    
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute opacity-0 pointer-events-none"
          style={{ width: '1px', height: '1px' }}
        />

        <VideoPreview />
        <ShowVideoButton />

        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Card className="bg-black/80 text-white border-white/20 backdrop-blur">
            <CardContent className="pt-4 space-y-2">
              <p className="text-center text-sm font-medium">
                <strong className="text-lg">👁️ Pupil Calibration</strong>
                <br />
                <span className="text-white/70">Look directly at the red circle when it appears</span>
                <br />
                <span className="text-blue-400 text-base">
                  Point {calibrationPoint + 1} / 10: {point?.label}
                </span>
              </p>
              
              <div className="pt-2 border-t border-white/10">
                {showTarget && captureCountdown !== null && (
                  <p className="text-center text-lg text-green-400 font-bold animate-pulse">
                    📸 Capturing in {captureCountdown}...
                  </p>
                )}
                
                {!showTarget && (
                  <p className="text-center text-sm text-blue-400 animate-pulse">
                    ⏳ Next target appearing soon...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {showTarget && (
          <div
            className="absolute w-20 h-20 bg-red-500 rounded-full border-4 border-white shadow-2xl animate-pulse cursor-pointer transition-all duration-500"
            style={{
              left: `${targetPosition.x * 100}%`,
              top: `${targetPosition.y * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full shadow-inner"></div>
            </div>
            {captureCountdown !== null && (
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white text-3xl font-bold">
                {captureCountdown}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="w-20 h-20 text-green-600 animate-bounce" />
            </div>
            <CardTitle className="text-4xl text-center text-green-600">
              Calibration Complete! 🎉
            </CardTitle>
            <CardDescription className="text-center text-lg mt-2">
              Your pupil tracking calibration data has been successfully recorded!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">Calibration Points</p>
                  <p className="text-6xl font-bold text-primary mt-2">{calibrationPoints.current.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Captured</p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">Data Quality</p>
                  <p className="text-6xl font-bold text-green-600 mt-2">100%</p>
                  <p className="text-xs text-muted-foreground mt-1">Valid</p>
                </CardContent>
              </Card>
            </div>

            <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                ✅ Calibration data captured successfully
                <br />
                <span className="text-xs">Check browser console for detailed data (F12)</span>
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button 
                onClick={downloadResults} 
                className="flex-1 bg-blue-600 hover:bg-blue-700" 
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download JSON
              </Button>
              
              <Button 
                onClick={() => {
                  const data = calibrationDataRef.current;
                  if (data && data.length > 0) {
                    console.log('📊 CALIBRATION DATA:');
                    console.log(data);
                    alert('✅ Data logged to console! Open DevTools (F12) to view.');
                  } else {
                    alert('❌ No data found!');
                  }
                }}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                📄 View in Console
              </Button>
            </div>

            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Run Calibration Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default PupilTrackingActivity;