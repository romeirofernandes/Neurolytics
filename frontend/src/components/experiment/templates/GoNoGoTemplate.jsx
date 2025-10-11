import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const GoNoGoTemplate = ({ onComplete }) => {
  const [currentTrial, setCurrentTrial] = useState(0);
  const [trialType, setTrialType] = useState('go'); // 'go' or 'nogo'
  const [phase, setPhase] = useState('fixation'); // fixation, stimulus, feedback
  const [startTime, setStartTime] = useState(0);
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [responded, setResponded] = useState(false);

  const totalTrials = 60; // 80% go trials, 20% no-go trials

  useEffect(() => {
    startTrial();
  }, [currentTrial]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (phase === 'stimulus' && e.key === ' ' && !responded) {
        setResponded(true);
        handleResponse();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, responded]);

  const startTrial = () => {
    if (currentTrial >= totalTrials) {
      onComplete?.(results);
      return;
    }

    setPhase('fixation');
    setFeedback('');
    setResponded(false);
    
    // 80% go trials, 20% no-go trials
    const isGoTrial = Math.random() < 0.8;
    setTrialType(isGoTrial ? 'go' : 'nogo');

    // Show fixation then stimulus
    setTimeout(() => {
      setPhase('stimulus');
      setStartTime(Date.now());
      
      // 2 second response window
      setTimeout(() => {
        if (!responded) {
          handleTimeout();
        }
      }, 2000);
    }, 500 + Math.random() * 500); // Variable fixation
  };

  const handleResponse = () => {
    const rt = Date.now() - startTime;
    const isError = trialType === 'nogo'; // Error if responded on no-go

    const result = {
      trialType,
      rt,
      error: isError ? 1 : 0,
      status: isError ? 2 : 1 // 1=correct, 2=error
    };

    setResults([...results, result]);
    setPhase('feedback');

    if (isError) {
      setFeedback('✗ Error - You should NOT press on No-Go!');
    } else {
      setFeedback('✓ Correct - Good reaction!');
    }

    setTimeout(() => {
      setCurrentTrial(currentTrial + 1);
    }, 600);
  };

  const handleTimeout = () => {
    const isError = trialType === 'go'; // Error if missed go trial

    const result = {
      trialType,
      rt: 2000,
      error: isError ? 1 : 0,
      status: isError ? 3 : 1 // 3=timeout (miss on go), 1=correct (on nogo)
    };

    setResults([...results, result]);
    setPhase('feedback');

    if (isError) {
      setFeedback('✗ Too Slow - Press quickly on Go!');
    } else {
      setFeedback('✓ Correct - Well done withholding!');
    }

    setTimeout(() => {
      setCurrentTrial(currentTrial + 1);
    }, 600);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Go/No-Go Task</CardTitle>
        <CardDescription>Trial {currentTrial + 1} of {totalTrials}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center text-sm bg-blue-100 dark:bg-blue-900 p-3 rounded">
          <p className="font-semibold">Instructions:</p>
          <p>Press <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border">SPACEBAR</kbd> when you see <strong className="text-green-600">GO</strong></p>
          <p>Do NOT press anything when you see <strong className="text-red-600">NO-GO</strong></p>
        </div>

        <div className="flex flex-col items-center justify-center h-72 relative">
          {phase === 'fixation' && (
            <div className="text-6xl font-bold text-muted-foreground">+</div>
          )}
          
          {phase === 'stimulus' && (
            <div className={`text-7xl font-bold px-8 py-4 rounded-lg ${
              trialType === 'go' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {trialType === 'go' ? 'GO' : 'NO-GO'}
            </div>
          )}

          {phase === 'feedback' && feedback && (
            <div className={`text-xl font-bold ${
              feedback.includes('✓') ? 'text-green-600' : 'text-red-600'
            }`}>
              {feedback}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {results.filter(r => r.trialType === 'go' && r.status === 1).length}
            </div>
            <div className="text-xs text-muted-foreground">Go Correct</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {results.filter(r => r.trialType === 'nogo' && r.status === 1).length}
            </div>
            <div className="text-xs text-muted-foreground">No-Go Correct</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {results.filter(r => r.error === 1).length}
            </div>
            <div className="text-xs text-muted-foreground">Total Errors</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
