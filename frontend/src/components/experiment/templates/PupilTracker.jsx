import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Eye, Target, CheckCircle2, AlertCircle, Download, ArrowLeft } from 'lucide-react';

const PupilTracker = ({ onComplete }) => {
  const navigate = useNavigate();
  const [requestingPermission, setRequestingPermission] = useState(false);
  const [phase, setPhase] = useState('consent'); // consent, calibration, trials, complete
  const [cameraError, setCameraError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [calibrationPoint, setCalibrationPoint] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ x: 0.5, y: 0.5 });
  const [trialStartTime, setTrialStartTime] = useState(0);
  const [results, setResults] = useState([]);
  const [pupilData, setPupilData] = useState(null);
  const [showTarget, setShowTarget] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const calibrationDataRef = useRef([]);
  const animationFrameRef = useRef(null);

  const totalTrials = 15;
  const calibrationPoints = [
    { x: 0.1, y: 0.1, label: 'Top-Left' },
    { x: 0.9, y: 0.1, label: 'Top-Right' },
    { x: 0.5, y: 0.5, label: 'Center' },
    { x: 0.1, y: 0.9, label: 'Bottom-Left' },
    { x: 0.9, y: 0.9, label: 'Bottom-Right' },
  ];

  // Handle consent and start camera
  const handleConsent = async () => {
    setRequestingPermission(true);
    
    try {
      // Test camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Stop test stream
      stream.getTracks().forEach(track => track.stop());
      
      console.log('✅ Camera permission granted');
      
      // Navigate to activity page
      navigate('/experiment/pupil-tracking-activity');
      
    } catch (error) {
      console.error('❌ Camera permission denied:', error);
      alert('⚠️ Camera permission is required. Please enable camera access and try again.');
      setRequestingPermission(false);
    }
  };

  // Simple tracking without heavy ML models
  const startSimpleTracking = () => {
    setIsTracking(true);
    detectPupilsSimple();
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Simple pupil detection using canvas pixel analysis
  const detectPupilsSimple = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 480;

    const detect = () => {
      if (!isTracking || !videoRef.current || videoRef.current.readyState !== 4) {
        if (isTracking) {
          animationFrameRef.current = requestAnimationFrame(detect);
        }
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
          faceDetected: true
        });
      } catch (error) {
        console.error('Detection error:', error);
      }

      animationFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
  };

  // Find dark regions (pupils) heuristically
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

  // Calibration effect
  useEffect(() => {
    if (phase !== 'calibration' || calibrationPoint >= calibrationPoints.length) return;

    console.log(`📍 Calibration point ${calibrationPoint + 1}/5: ${calibrationPoints[calibrationPoint].label}`);
    
    const point = calibrationPoints[calibrationPoint];
    setTargetPosition(point);
    setShowTarget(true);

    const timer = setTimeout(() => {
      if (pupilData) {
        calibrationDataRef.current.push({
          screenPoint: point,
          pupilPoint: pupilData
        });
      }

      if (calibrationPoint < calibrationPoints.length - 1) {
        setShowTarget(false);
        setTimeout(() => setCalibrationPoint(calibrationPoint + 1), 200);
      } else {
        console.log('✅ Calibration complete, starting trials');
        setShowTarget(false);
        setTimeout(() => {
          setPhase('trials');
          startTrials();
        }, 500);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [phase, calibrationPoint, pupilData]);

  const startTrials = () => {
    console.log('🎯 Starting trials phase');
    setCurrentTrial(0);
    runTrial(0);
  };

  const runTrial = (trialIndex) => {
    if (trialIndex >= totalTrials) {
      finishExperiment();
      return;
    }

    console.log(`🎯 Trial ${trialIndex + 1}/${totalTrials}`);
    
    const target = {
      x: 0.2 + Math.random() * 0.6,
      y: 0.2 + Math.random() * 0.6
    };

    setTargetPosition(target);
    setShowTarget(true);
    setTrialStartTime(performance.now());
    setCurrentTrial(trialIndex);
  };

  const handleTargetClick = () => {
    const reactionTime = performance.now() - trialStartTime;
    
    const trialResult = {
      trialNumber: currentTrial + 1,
      targetPosition,
      reactionTimeMs: Math.round(reactionTime),
      hit: 1,
      pupilData: pupilData,
      timestamp: Date.now()
    };

    setResults(prev => [...prev, trialResult]);
    console.log(`✅ Trial ${currentTrial + 1}: RT = ${Math.round(reactionTime)}ms`);

    setShowTarget(false);
    setTimeout(() => {
      runTrial(currentTrial + 1);
    }, 500);
  };

  const finishExperiment = () => {
    console.log('🏁 Experiment complete');
    stopTracking();
    setPhase('complete');

    const avgRT = results.reduce((sum, r) => sum + r.reactionTimeMs, 0) / results.length;
    const accuracy = (results.filter(r => r.hit).length / results.length) * 100;

    const finalData = {
      experimentId: 'pupil-gaze-reaction',
      participantId: `participant-${Date.now()}`,
      completedAt: new Date().toISOString(),
      totalTrials: results.length,
      accuracy: accuracy.toFixed(1),
      averageReactionTime: Math.round(avgRT),
      trials: results,
      calibrationData: calibrationDataRef.current
    };

    localStorage.setItem('pupilExperiment_FinalData', JSON.stringify(finalData));
    
    console.log('═══════════════════════════════════════════');
    console.log('🎯 PUPIL TRACKING EXPERIMENT COMPLETE');
    console.log('═══════════════════════════════════════════');
    console.log(JSON.stringify(finalData, null, 2));
    console.log('═══════════════════════════════════════════');

    if (onComplete) onComplete(finalData);
  };

  const downloadResults = () => {
    const data = localStorage.getItem('pupilExperiment_FinalData');
    if (!data) return;

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pupil-tracking-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up');
      stopTracking();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Debug: Log phase changes
  useEffect(() => {
    console.log(`📊 Phase changed to: ${phase}`);
  }, [phase]);

  // RENDER: Consent screen
  if (phase === 'consent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <Eye className="w-16 h-16 text-purple-600" />
            </div>
            <CardTitle className="text-3xl text-center">Pupil Tracking Experiment</CardTitle>
            <CardDescription className="text-center text-lg">
              Gaze-Target Reaction Time Task
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Camera className="h-4 w-4" />
              <AlertDescription>
                This experiment requires camera access to track your eye movements and pupil position.
                <br />
                <strong>Privacy:</strong> No video is recorded. Only pupil coordinates are saved.
              </AlertDescription>
            </Alert>

            <div className="space-y-4 text-sm">
              <h3 className="font-semibold text-lg">What you'll do:</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>Calibration</strong> - Look at 5 points on the screen (~10 seconds)</li>
                <li><strong>Trials</strong> - Click targets as fast as possible (15 trials, ~2 minutes)</li>
                <li><strong>Results</strong> - View your reaction times and download data</li>
              </ol>

              <h3 className="font-semibold text-lg mt-4">Requirements:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Working webcam with permissions enabled</li>
                <li>Good lighting (face toward a light source)</li>
                <li>Sit 30-60cm from screen</li>
                <li>Keep head relatively still during experiment</li>
              </ul>
            </div>

            {cameraError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{cameraError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button 
                onClick={handleConsent} 
                className="w-full" 
                size="lg"
                disabled={requestingPermission}
              >
                <Camera className="w-4 h-4 mr-2" />
                {requestingPermission ? 'Checking Camera...' : 'I Consent - Start Experiment'}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                By clicking this button, you consent to camera usage for this experiment
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // RENDER: Calibration phase
  if (phase === 'calibration') {
    const point = calibrationPoints[calibrationPoint];
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden">
        {/* Hidden video */}
        <video
          ref={videoRef}
          className="absolute opacity-0 pointer-events-none"
          autoPlay
          playsInline
          muted
          style={{ width: '1px', height: '1px' }}
        />

        {/* Instructions */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Card className="bg-black/80 text-white border-white/20">
            <CardContent className="pt-4">
              <p className="text-center text-sm font-medium">
                <strong className="text-lg">👁️ Calibration</strong>
                <br />
                Look directly at the red circle
                <br />
                <span className="text-red-400">Point {calibrationPoint + 1}/5: {point?.label}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Calibration target */}
        {showTarget && (
          <div
            className="absolute w-16 h-16 bg-red-500 rounded-full border-4 border-white shadow-2xl animate-pulse"
            style={{
              left: `${targetPosition.x * 100}%`,
              top: `${targetPosition.y * 100}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'all 0.3s ease-in-out'
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // RENDER: Trial phase
  if (phase === 'trials') {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden">
        {/* Hidden video */}
        <video
          ref={videoRef}
          className="absolute opacity-0 pointer-events-none"
          autoPlay
          playsInline
          muted
          style={{ width: '1px', height: '1px' }}
        />

        {/* Progress indicator */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Card className="bg-black/80 text-white border-white/20">
            <CardContent className="pt-4">
              <p className="text-center font-medium">
                <strong className="text-xl">🎯 Trial {currentTrial + 1} / {totalTrials}</strong>
                <br />
                <span className="text-sm text-green-400">Click the green target as fast as you can!</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Target */}
        {showTarget && (
          <div
            onClick={handleTargetClick}
            className="absolute w-20 h-20 bg-green-500 rounded-full border-4 border-white shadow-2xl cursor-pointer hover:scale-110 active:scale-95 transition-transform"
            style={{
              left: `${targetPosition.x * 100}%`,
              top: `${targetPosition.y * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <Target className="w-full h-full text-white p-4" />
          </div>
        )}
      </div>
    );
  }

  // RENDER: Complete phase
  if (phase === 'complete') {
    const avgRT = results.length > 0 ? results.reduce((sum, r) => sum + r.reactionTimeMs, 0) / results.length : 0;
    const accuracy = results.length > 0 ? (results.filter(r => r.hit).length / results.length) * 100 : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-600 animate-bounce" />
            </div>
            <CardTitle className="text-3xl text-center text-green-600">
              Experiment Complete! 🎉
            </CardTitle>
            <CardDescription className="text-center text-lg">
              Excellent work! Here are your results:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Results summary */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-2 border-primary/20">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">Trials Completed</p>
                  <p className="text-5xl font-bold text-primary">{results.length}</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-green-500/20">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="text-5xl font-bold text-green-600">{accuracy.toFixed(0)}%</p>
                </CardContent>
              </Card>
              <Card className="col-span-2 border-2 border-blue-500/20">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">Average Reaction Time</p>
                  <p className="text-5xl font-bold text-blue-600">{Math.round(avgRT)} ms</p>
                </CardContent>
              </Card>
            </div>

            {/* Data saved locally alert */}
            <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                ✅ Your data has been saved to browser storage and console (Press F12 to view)
              </AlertDescription>
            </Alert>

            {/* Action buttons */}
            <div className="flex gap-4">
              <Button onClick={downloadResults} className="flex-1" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Download JSON
              </Button>
              <Button 
                onClick={() => {
                  const data = localStorage.getItem('pupilExperiment_FinalData');
                  if (data) {
                    console.log('═══════════════════════════════════════════');
                    console.log('📊 EXPERIMENT DATA FROM LOCALSTORAGE:');
                    console.log(JSON.parse(data));
                    console.log('═══════════════════════════════════════════');
                    alert('✅ Data logged to console! Press F12 to view.');
                  }
                }}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                📄 View Console
              </Button>
            </div>

            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Run Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

PupilTracker.displayName = 'PupilTracker';

export default PupilTracker;