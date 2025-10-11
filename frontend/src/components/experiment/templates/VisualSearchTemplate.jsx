import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const VisualSearchTemplate = ({ onComplete }) => {
  const [currentTrial, setCurrentTrial] = useState(0);
  const [items, setItems] = useState([]);
  const [targetPresent, setTargetPresent] = useState(true);
  const [setSize, setSetSize] = useState(5);
  const [phase, setPhase] = useState('fixation'); // fixation, search, feedback
  const [startTime, setStartTime] = useState(0);
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isTraining, setIsTraining] = useState(true);

  const totalTrials = 50;
  const setSizes = [5, 10, 15, 20];
  
  // Target: Upright orange T
  // Distractors: Rotated Ts (various colors) and upright Ts (various non-orange colors)
  const colors = ['#FF6B35', '#4ECDC4', '#45B7D1', '#F7DC6F', '#E74C3C'];
  const targetColor = '#FF6B35'; // orange
  const rotations = [0, 90, 180, 270];

  useEffect(() => {
    startTrial();
  }, [currentTrial]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (phase === 'search' && e.key === ' ') {
        handleResponse(true); // Present
      } else if (phase === 'search' && e.key === 'n') {
        handleResponse(false); // Absent
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, startTime]);

  const startTrial = () => {
    if (currentTrial >= (isTraining ? 5 : totalTrials)) {
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
    
    // Randomly select set size
    const currentSetSize = setSizes[Math.floor(Math.random() * setSizes.length)];
    setSetSize(currentSetSize);
    
    // 50% target present
    const isTargetPresent = Math.random() < 0.5;
    setTargetPresent(isTargetPresent);

    // Generate items
    const searchItems = [];
    const usedPositions = new Set();

    // Add target if present
    if (isTargetPresent) {
      const pos = getRandomPosition(usedPositions);
      searchItems.push({
        type: 'target',
        color: targetColor,
        rotation: 0,
        x: pos.x,
        y: pos.y
      });
    }

    // Add distractors
    const distractorCount = isTargetPresent ? currentSetSize - 1 : currentSetSize;
    for (let i = 0; i < distractorCount; i++) {
      const pos = getRandomPosition(usedPositions);
      const isRotated = Math.random() < 0.5;
      
      searchItems.push({
        type: 'distractor',
        color: isRotated ? colors[Math.floor(Math.random() * colors.length)] : 
                          colors.filter(c => c !== targetColor)[Math.floor(Math.random() * (colors.length - 1))],
        rotation: isRotated ? rotations[1 + Math.floor(Math.random() * 3)] : 0, // Avoid 0 rotation for non-target
        x: pos.x,
        y: pos.y
      });
    }

    setItems(searchItems);

    // Show fixation then search display
    setTimeout(() => {
      setPhase('search');
      setStartTime(Date.now());
    }, 500);
  };

  const getRandomPosition = (usedPositions) => {
    let pos;
    let attempts = 0;
    do {
      pos = {
        x: 10 + Math.random() * 80, // percentage
        y: 10 + Math.random() * 80
      };
      const key = `${Math.floor(pos.x/10)}-${Math.floor(pos.y/10)}`;
      if (!usedPositions.has(key)) {
        usedPositions.add(key);
        return pos;
      }
      attempts++;
    } while (attempts < 100);
    return pos;
  };

  const handleResponse = (respondedPresent) => {
    if (phase !== 'search') return;
    
    const rt = Date.now() - startTime;
    const correct = respondedPresent === targetPresent;
    const status = correct ? 1 : 2; // 1=correct, 2=error

    const result = {
      setSize,
      targetPresent: targetPresent ? 1 : 0,
      response: respondedPresent ? 'present' : 'absent',
      correct: correct ? 1 : 0,
      status,
      rt
    };

    setResults([...results, result]);
    setPhase('feedback');

    if (status === 1) {
      setFeedback('✓ Correct');
    } else {
      setFeedback('✗ Error');
    }

    setTimeout(() => {
      setCurrentTrial(currentTrial + 1);
    }, 600);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Visual Search Task</CardTitle>
        <CardDescription>
          {isTraining 
            ? `Training Trial ${currentTrial + 1} of 5` 
            : `Trial ${currentTrial + 1} of ${totalTrials}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded text-sm space-y-1">
          <p className="font-semibold text-center">Find the UPRIGHT ORANGE T</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white dark:bg-gray-800 p-2 rounded text-center">
              Press <kbd className="px-2 py-1 bg-muted rounded border">SPACE</kbd> if present
            </div>
            <div className="bg-white dark:bg-gray-800 p-2 rounded text-center">
              Press <kbd className="px-2 py-1 bg-muted rounded border">N</kbd> if absent
            </div>
          </div>
        </div>

        <div className="relative h-96 border-2 border-muted rounded bg-gray-50 dark:bg-gray-900">
          {phase === 'fixation' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="text-6xl font-bold">+</div>
            </div>
          )}
          
          {phase === 'search' && items.map((item, idx) => (
            <div
              key={idx}
              className="absolute text-4xl font-bold"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                color: item.color,
                transform: `rotate(${item.rotation}deg)`,
                fontFamily: 'monospace'
              }}
            >
              T
            </div>
          ))}

          {phase === 'feedback' && feedback && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className={`text-3xl font-bold ${
                feedback.includes('✓') ? 'text-green-600' : 'text-red-600'
              }`}>
                {feedback}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: targetColor }}></div>
            <span>Target (upright)</span>
          </div>
          <span>•</span>
          <span>Set Size: {setSize} items</span>
        </div>

        {!isTraining && (
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {results.filter(r => r.correct === 1).length}
              </div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {results.filter(r => r.correct === 0).length}
              </div>
              <div className="text-xs text-muted-foreground">Errors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.rt, 0) / results.length) : 0}
              </div>
              <div className="text-xs text-muted-foreground">Avg RT (ms)</div>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground">
          {isTraining ? '🎓 Training Mode - Get familiar with the task!' : '📊 Main Experiment'}
        </div>
      </CardContent>
    </Card>
  );
};
