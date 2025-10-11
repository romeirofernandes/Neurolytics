import { useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function TestModels() {
  const [modelStatus, setModelStatus] = useState({
    tinyFaceDetector: false,
    faceLandmark68: false,
    faceExpression: false,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const testModels = async () => {
      try {
        const MODEL_URL = "/models";
        
        // Test tiny face detector
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setModelStatus(prev => ({ ...prev, tinyFaceDetector: true }));
        
        // Test face landmarks
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        setModelStatus(prev => ({ ...prev, faceLandmark68: true }));
        
        // Test face expressions
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        setModelStatus(prev => ({ ...prev, faceExpression: true }));
        
        console.log("✅ All models loaded successfully!");
      } catch (err) {
        console.error("❌ Error loading models:", err);
        setError(err.message);
      }
    };
    
    testModels();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Face-API Models Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Tiny Face Detector</span>
              {modelStatus.tinyFaceDetector ? (
                <CheckCircle2 className="text-green-600" />
              ) : (
                <XCircle className="text-red-600" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>Face Landmarks (68 points)</span>
              {modelStatus.faceLandmark68 ? (
                <CheckCircle2 className="text-green-600" />
              ) : (
                <XCircle className="text-red-600" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>Face Expressions</span>
              {modelStatus.faceExpression ? (
                <CheckCircle2 className="text-green-600" />
              ) : (
                <XCircle className="text-red-600" />
              )}
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 text-sm text-red-800 dark:text-red-200">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {!error && Object.values(modelStatus).every(v => v) && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3 text-sm text-green-800 dark:text-green-200">
              ✅ All models loaded successfully! You can now use emotion tracking.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}