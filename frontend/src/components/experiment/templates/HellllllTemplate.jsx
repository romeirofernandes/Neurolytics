import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const NBackTemplate = ({ onComplete }) => {
  const [currentTrial, setCurrentTrial] = useState(0);
  const [letter, setLetter] = useState('');
  const [sequence, setSequence] = useState([]);
  const [phase, setPhase] = useState('ready');
  const [startTime, setStartTime] = useState(0);
  const [results, setResults] = useState([]);
  const [responded, setResponded] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [stats, setStats] = useState({ hits: 0, misses: 0, falseAlarms: 0, correctRejections: 0 }); // Consolidated stats

  const letters = ['A', 'B', 'C', 'D', 'E', 'H', 'I', 'K', 'L', 'M', 'O', 'P', 'R', 'S', 'T'];
  const totalTrials = 20; // Modified number of trials
  const nBack = 2;

  useEffect(() => {
    const handleKeyPress = (e) => { if (phase === 'letter' && e.key === 'm' && !responded) { setResponded(true); handleResponse(true); } };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, responded, sequence]);

  const startGame = () => { setCurrentTrial(0); setSequence([]); setStats({ hits: 0, misses: 0, falseAlarms: 0, correctRejections: 0 }); setPhase('letter'); startTrial(); }; // renamed startBlock to startGame and removed block stats

  const startTrial = () => {
    if (currentTrial >= totalTrials) { // Modified condition to end the game
      endGame();
      return;
    }
    setResponded(false);
    setFeedback('');
    let newLetter;
    const isMatch = currentTrial >= nBack && Math.random() < 0.3;
    if (isMatch) { newLetter = sequence[sequence.length - nBack]; } else { do { newLetter = letters[Math.floor(Math.random() * letters.length)]; } while (currentTrial >= nBack && newLetter === sequence[sequence.length - nBack]); }
    setLetter(newLetter);
    const newSequence = [...sequence, newLetter];
    setSequence(newSequence);
    setPhase('letter');
    setStartTime(Date.now());
    setTimeout(() => { setPhase('blank'); setTimeout(() => { if (!responded) { handleResponse(false); } }, 2500); }, 500);
  };

  const handleResponse = (didRespond) => {
    const rt = Date.now() - startTime;
    const isMatchTrial = currentTrial >= nBack && sequence[sequence.length - 1] === sequence[sequence.length - 1 - nBack];
    let isCorrect, resultType;
    if (isMatchTrial && didRespond) { isCorrect = true; resultType = 'hit'; setStats(prev => ({ ...prev, hits: prev.hits + 1 })); } else if (isMatchTrial && !didRespond) { isCorrect = false; resultType = 'miss'; setStats(prev => ({ ...prev, misses: prev.misses + 1 })); } else if (!isMatchTrial && didRespond) { isCorrect = false; resultType = 'falseAlarm'; setStats(prev => ({ ...prev, falseAlarms: prev.falseAlarms + 1 })); } else { isCorrect = true; resultType = 'correctRejection'; setStats(prev => ({ ...prev, correctRejections: prev.correctRejections + 1 })); }
    const result = { trial: currentTrial + 1, letter: letter, isMatch: isMatchTrial ? 1 : 0, responded: didRespond ? 1 : 0, correct: isCorrect ? 1 : 0, resultType, rt: didRespond ? rt : 3000 };
    setResults([...results, result]);
    if (didRespond) { setFeedback(isCorrect ? '✓' : '✗'); }
    setTimeout(() => { setCurrentTrial(currentTrial + 1); startTrial(); }, 200);
  };

  const endGame = () => { setPhase('end'); }; // renamed endBlock to endGame

  if (phase === 'ready') {
    return (
      <Card className="w-full max-w-2xl mx-auto"><CardHeader><CardTitle>N-Back Task (2-Back)</CardTitle><CardDescription>Prepare for the Task</CardDescription></CardHeader><CardContent className="space-y-6"><div className="bg-blue-100 dark:bg-blue-900 p-4 rounded space-y-3"><p className="font-semibold text-lg">Instructions:</p><p>You will see a sequence of letters, one at a time.</p><p>Press <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border font-bold">M</kbd> if the current letter is the SAME as the letter shown <strong>2 positions back</strong>.</p><p>Otherwise, do NOT press anything.</p><div className="text-sm text-muted-foreground mt-4"><p>Example: If you see: H → K → <strong>H</strong></p><p>Press M on the second H because it matches 2 back!</p></div></div><Button onClick={startGame} size="lg" className="w-full">Start Game</Button></CardContent></Card>
    );
  }

  if (phase === 'end') {
    const accuracy = stats.hits + stats.correctRejections;
    const total = totalTrials;
    const percentage = ((accuracy / total) * 100).toFixed(1);
    return (
      <Card className="w-full max-w-2xl mx-auto"><CardHeader><CardTitle>Task Complete!</CardTitle><CardDescription>Your Performance</CardDescription></CardHeader><CardContent className="space-y-6"><div className="grid grid-cols-2 gap-4"><div className="bg-green-100 dark:bg-green-900 p-4 rounded text-center"><div className="text-3xl font-bold text-green-600">{stats.hits}</div><div className="text-sm">Hits</div></div><div className="bg-blue-100 dark:bg-blue-900 p-4 rounded text-center"><div className="text-3xl font-bold text-blue-600">{stats.correctRejections}</div><div className="text-sm">Correct Rejections</div></div><div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded text-center"><div className="text-3xl font-bold text-yellow-600">{stats.misses}</div><div className="text-sm">Misses</div></div><div className="bg-red-100 dark:bg-red-900 p-4 rounded text-center"><div className="text-3xl font-bold text-red-600">{stats.falseAlarms}</div><div className="text-sm">False Alarms</div></div></div><div className="text-center p-4 bg-muted rounded"><div className="text-4xl font-bold">{percentage}%</div><div className="text-sm text-muted-foreground">Accuracy</div></div><Button onClick={() => onComplete?.(results)} size="lg" className="w-full">View Results</Button></CardContent></Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto"><CardHeader><CardTitle>N-Back Task (2-Back)</CardTitle><CardDescription>Trial {currentTrial + 1} of {totalTrials}</CardDescription></CardHeader><CardContent className="space-y-6"><div className="text-center text-sm text-muted-foreground">Press <kbd className="px-2 py-1 bg-muted rounded border">M</kbd> if the letter matches 2 back</div><div className="flex flex-col items-center justify-center h-80 relative">{phase === 'letter' && <div className="text-9xl font-bold">{letter}</div>}{phase === 'blank' && feedback && <div className={`text-6xl font-bold ${feedback === '✓' ? 'text-green-600' : 'text-red-600'}`}>{feedback}</div>}{phase === 'blank' && !feedback && <div className="text-6xl font-bold text-muted-foreground opacity-20">•</div>}</div><div className="grid grid-cols-4 gap-2 text-center text-xs"><div><div className="font-bold text-green-600">{stats.hits}</div><div className="text-muted-foreground">Hits</div></div><div><div className="font-bold text-blue-600">{stats.correctRejections}</div><div className="text-muted-foreground">Correct</div></div><div><div className="font-bold text-yellow-600">{stats.misses}</div><div className="text-muted-foreground">Misses</div></div><div><div className="font-bold text-red-600">{stats.falseAlarms}</div><div className="text-muted-foreground">False Alarms</div></div></div></CardContent></Card>
  );
};