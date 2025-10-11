import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const StroopTaskTemplate = ({ participantId, experimentId, onComplete }) => {
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
  const colors = { RED: 'red', GREEN: 'green', BLUE: 'blue', YELLOW: 'yellow' };
  const keys = { r: 'RED', g: 'GREEN', b: 'BLUE', y: 'YELLOW' };

  // Generate trial
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

  // Handle response
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
  }, [word, color, startTime, currentTrial, isTraining, generateTrial]);

  // Finish experiment
  const finishExperiment = useCallback(() => {
    const finalData = {
      stroopResults: results,
      participantId,
      experimentId,
      completedAt: new Date().toISOString(),
      summary: {
        totalTrials: results.length,
        accuracy: (results.filter(r => r.correct === 1).length / results.length * 100).toFixed(2) + '%',
        averageRT: (results.reduce((sum, r) => sum + r.rt, 0) / results.length).toFixed(0) + 'ms',
      }
    };

    if (onComplete) {
      onComplete(finalData);
    }
  }, [results, participantId, experimentId, onComplete]);

  // Keyboard handler
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

  // Start experiment
  const startExperiment = () => {
    setExperimentStarted(true);
    generateTrial();
  };

  // Watch for trial changes
  useEffect(() => {
    if (currentTrial > 0 && currentTrial < (isTraining ? 10 : 40) && experimentStarted) {
      // Auto-advance is handled by handleResponse
    }
  }, [currentTrial, isTraining, experimentStarted]);

  // === RENDER ===

  // Instructions screen
  if (!experimentStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Stroop Task</CardTitle>
            <CardDescription className="text-center text-base mt-2">
              Classic Color-Word Interference Test
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Instructions:</h3>
              <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
                <li>• Identify the <strong>COLOR</strong> of the word (ignore the text itself)</li>
                <li>• Keys: <strong>R</strong>=Red, <strong>G</strong>=Green, <strong>B</strong>=Blue, <strong>Y</strong>=Yellow</li>
                <li>• Respond as quickly and accurately as possible</li>
                <li>• 10 practice trials followed by 40 test trials</li>
                <li>• Takes approximately 5-8 minutes</li>
              </ul>
            </div>

            <Button onClick={startExperiment} className="w-full h-14 text-lg font-bold shadow-lg">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Start Experiment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Experiment running screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Stroop Task</CardTitle>
            <CardDescription>
              {isTraining ? `Training Trial ${currentTrial + 1}/10` : `Test Trial ${currentTrial + 1}/40`}
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
                  className="text-white h-12 text-lg font-bold hover:opacity-90 transition-opacity"
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

export default StroopTaskTemplate;