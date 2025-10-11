import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const SimonTemplate = ({ onComplete }) => {
  const [currentTrial, setCurrentTrial] = useState(0);
  const [word, setWord] = useState('');
  const [position, setPosition] = useState('left'); // 'left' or 'right'
  const [phase, setPhase] = useState('fixation'); // fixation, stimulus, feedback
  const [startTime, setStartTime] = useState(0);
  const [results, setResults] = useState([]);
  const [isTraining, setIsTraining] = useState(true);
  const [feedback, setFeedback] = useState('');

  const words = ['LEFT', 'RIGHT'];

  useEffect(() => {
    startTrial();
  }, [currentTrial]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (phase === 'stimulus' && (e.key === 'a' || e.key === 'l')) {
        handleResponse(e.key === 'a' ? 'left' : 'right');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, startTime]);

  const startTrial = () => {
    const totalTrials = isTraining ? 10 : 60;
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
    const wordChoice = words[Math.floor(Math.random() * words.length)];
    const posChoice = Math.random() < 0.5 ? 'left' : 'right';
    
    setWord(wordChoice);
    setPosition(posChoice);

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
    }, 500 + Math.random() * 500);
  };

  const handleResponse = (response) => {
    if (phase !== 'stimulus') return;
    
    const rt = Date.now() - startTime;
    const correctResponse = word.toLowerCase();
    const correct = response === correctResponse;
    const compatible = (word.toLowerCase() === position) ? 1 : 0;
    const status = !response ? 3 : (correct ? 1 : 2); // 1=correct, 2=error, 3=timeout

    const result = {
      word,
      position,
      compatible,
      correctResponse,
      response: response || 'timeout',
      correct: correct ? 1 : 0,
      status,
      rt: response ? rt : 2000
    };

    setResults([...results, result]);
    setPhase('feedback');

    // Show feedback
    if (status === 1) {
      setFeedback('✓');
    } else if (status === 2) {
      setFeedback('✗ Wrong!');
    } else {
      setFeedback('Too slow!');
    }

    // Next trial
    setTimeout(() => {
      setCurrentTrial(currentTrial + 1);
    }, status === 2 ? 1000 : 400);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Simon Task</CardTitle>
        <CardDescription>
          {isTraining 
            ? `Training Trial ${currentTrial + 1} of 10` 
            : `Trial ${currentTrial + 1} of 60`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded text-sm space-y-2">
          <p className="font-semibold text-center">Respond to the WORD, ignore its position!</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white dark:bg-gray-800 p-2 rounded text-center">
              <kbd className="px-2 py-1 bg-muted rounded border font-bold">A</kbd> for LEFT
            </div>
            <div className="bg-white dark:bg-gray-800 p-2 rounded text-center">
              <kbd className="px-2 py-1 bg-muted rounded border font-bold">L</kbd> for RIGHT
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center h-64 relative border-2 border-dashed border-muted rounded">
          {phase === 'fixation' && (
            <div className="text-6xl font-bold">+</div>
          )}
          
          {phase === 'stimulus' && (
            <div className={`absolute ${
              position === 'left' ? 'left-8' : 'right-8'
            } top-1/2 -translate-y-1/2`}>
              <div className="text-5xl font-bold px-4 py-2 bg-yellow-400 text-black rounded">
                {word}
              </div>
            </div>
          )}

          {phase === 'feedback' && feedback && (
            <div className={`text-3xl font-bold ${
              feedback.includes('✓') ? 'text-green-600' : 'text-red-600'
            }`}>
              {feedback}
            </div>
          )}

          {/* Visual markers for left/right areas */}
          {phase === 'stimulus' && (
            <>
              <div className="absolute left-4 top-4 text-xs text-muted-foreground">LEFT SIDE</div>
              <div className="absolute right-4 top-4 text-xs text-muted-foreground">RIGHT SIDE</div>
            </>
          )}
        </div>

        {!isTraining && (
          <div className="grid grid-cols-2 gap-4 text-center text-sm">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {results.filter(r => r.compatible === 1 && r.correct === 1).length}
              </div>
              <div className="text-xs text-muted-foreground">Compatible Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {results.filter(r => r.compatible === 0 && r.correct === 1).length}
              </div>
              <div className="text-xs text-muted-foreground">Incompatible Correct</div>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground">
          {isTraining ? '🎓 Training Mode' : '📊 Main Experiment'}
        </div>
      </CardContent>
    </Card>
  );
};
