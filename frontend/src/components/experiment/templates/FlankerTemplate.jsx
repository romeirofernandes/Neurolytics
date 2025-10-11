import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const FlankerTemplate = ({ onComplete }) => {
  const [currentTrial, setCurrentTrial] = useState(0);
  const [stimulus, setStimulus] = useState('');
  const [congruent, setCongruent] = useState(true);
  const [targetLetter, setTargetLetter] = useState('');
  const [phase, setPhase] = useState('fixation'); // fixation, stimulus, feedback
  const [startTime, setStartTime] = useState(0);
  const [results, setResults] = useState([]);
  const [isTraining, setIsTraining] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [showReminder, setShowReminder] = useState(false);

  // A/L keys for X/C vs V/B
  const leftLetters = ['X', 'C'];
  const rightLetters = ['V', 'B'];
  const allLetters = [...leftLetters, ...rightLetters];

  useEffect(() => {
    startTrial();
  }, [currentTrial]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (phase === 'stimulus' && (e.key === 'a' || e.key === 'l')) {
        handleResponse(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, stimulus, startTime]);

  const startTrial = () => {
    const totalTrials = isTraining ? 5 : 20; // Reduced from 10/50 to 5/20
    if (currentTrial >= totalTrials) {
      if (isTraining) {
        setIsTraining(false);
        setCurrentTrial(0);
        return;
      } else {
        onComplete?.(results);
        return;
      }
    }

    setPhase('fixation');
    setFeedback('');
    
    // Generate stimulus
    const isCongruent = Math.random() < 0.5;
    const target = allLetters[Math.floor(Math.random() * allLetters.length)];
    let flankers;
    
    if (isCongruent) {
      flankers = target;
    } else {
      // Pick incompatible flanker from same response group
      const targetIsLeft = leftLetters.includes(target);
      const flankerPool = targetIsLeft ? leftLetters : rightLetters;
      flankers = flankerPool.find(l => l !== target) || target;
    }

    const stimulusString = `${flankers}${flankers}${target}${flankers}${flankers}`;
    
    setStimulus(stimulusString);
    setCongruent(isCongruent);
    setTargetLetter(target);

    // Show fixation then stimulus
    setTimeout(() => {
      setPhase('stimulus');
      setStartTime(Date.now());
      
      // Auto-advance on timeout
      setTimeout(() => {
        if (phase === 'stimulus') {
          handleResponse(null); // Timeout
        }
      }, 2000);
    }, 500);
  };

  const handleResponse = (key) => {
    if (phase !== 'stimulus') return;
    
    const rt = Date.now() - startTime;
    const correctKey = leftLetters.includes(targetLetter) ? 'a' : 'l';
    const correct = key === correctKey;
    const status = !key ? 3 : (correct ? 1 : 2); // 1=correct, 2=error, 3=timeout

    const result = {
      stimulus,
      congruent: congruent ? 1 : 0,
      targetLetter,
      response: key || 'timeout',
      correct: correct ? 1 : 0,
      status,
      rt: key ? rt : 2000
    };

    setResults([...results, result]);
    setPhase('feedback');

    // Show feedback
    if (status === 1) {
      setFeedback('✓ Correct');
    } else if (status === 2) {
      setFeedback('✗ Error - Remember the rules!');
      setShowReminder(true);
      setTimeout(() => setShowReminder(false), 2000);
    } else {
      setFeedback('Too slow!');
    }

    // Next trial
    setTimeout(() => {
      setCurrentTrial(currentTrial + 1);
    }, status === 2 ? 2500 : 800);
  };

  const getInstructions = () => (
    <div className="space-y-2 text-sm">
      <p className="font-semibold">Press the key for the MIDDLE letter:</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
          <strong>A key (Left):</strong> X or C
        </div>
        <div className="bg-green-100 dark:bg-green-900 p-2 rounded">
          <strong>L key (Right):</strong> V or B
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Ignore the flanking letters!</p>
    </div>
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Flanker Task (Eriksen)</CardTitle>
        <CardDescription>
          {isTraining 
            ? `Training Trial ${currentTrial + 1} of 5` 
            : `Trial ${currentTrial + 1} of 20`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {getInstructions()}

        <div className="flex flex-col items-center justify-center h-64 relative">
          {phase === 'fixation' && (
            <div className="text-6xl font-bold">+</div>
          )}
          
          {phase === 'stimulus' && (
            <div className="space-y-4 text-center">
              <div className="text-6xl font-mono font-bold tracking-wider">
                {stimulus}
              </div>
              <div className="text-xs text-muted-foreground">
                Respond to the middle letter!
              </div>
            </div>
          )}

          {phase === 'feedback' && feedback && (
            <div className={`text-2xl font-bold ${
              feedback.includes('✓') ? 'text-green-600' : 'text-red-600'
            }`}>
              {feedback}
            </div>
          )}
        </div>

        {showReminder && (
          <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 rounded p-3">
            {getInstructions()}
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground">
          {isTraining ? '🎓 Training Mode - Practice makes perfect!' : '📊 Main Experiment'}
        </div>
      </CardContent>
    </Card>
  );
};
