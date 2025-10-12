import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const PosnerTemplate = ({ onComplete }) => {
  const [currentTrial, setCurrentTrial] = useState(0);
  const [phase, setPhase] = useState('fixation');
  const [cuePosition, setCuePosition] = useState('left');
  const [targetPosition, setTargetPosition] = useState('left');
  const [startTime, setStartTime] = useState(0);
  const [results, setResults] = useState([]);

  useEffect(() => { startTrial(); }, [currentTrial]);
  useEffect(() => {
    const handleKeyPress = (e) => { if (phase === 'target' && (e.key === 'a' || e.key === 'l')) { handleResponse(e.key === 'a' ? 'left' : 'right'); } };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, startTime]);

  const startTrial = () => {
    if (currentTrial >= 40) { onComplete?.(results); return; }
    const isValidCue = Math.random() < 0.75;
    const cue = Math.random() < 0.5 ? 'left' : 'right';
    const target = isValidCue ? cue : (cue === 'left' ? 'right' : 'left');
    setCuePosition(cue);
    setTargetPosition(target);
    setPhase('fixation');
    // Modified fixation duration to 750ms
    setTimeout(() => { setPhase('cue'); 
      // Modified target duration (stimulus presentation) to 2000ms
      setTimeout(() => { setPhase('target'); setStartTime(Date.now()); setTimeout(() => {
        // After 2000ms, move back to the intertrial interval, and start the next trial if available
        handleResponse(null); // No response recorded if time runs out
      }, 2000); }, 150); }, 750);
  };

  const handleResponse = (response) => {
    if (response === null && phase === 'target'){
        const rt = 2000; // Setting RT to 2000 if participant fails to response in 2000ms duration
        const correct = 0;  // Setting correctness to 0, if participant fails to response
        const valid = cuePosition === targetPosition ? 1 : 0;
        setResults([...results, { cuePosition, targetPosition, valid, response:"none", correct: correct ? 1 : 0, rt }]);
        setCurrentTrial(currentTrial + 1);
        return;
    }
    if (phase !== 'target') return; // Prevent responses during other phases
    const rt = Date.now() - startTime;
    const correct = response === targetPosition;
    const valid = cuePosition === targetPosition ? 1 : 0;
    setResults([...results, { cuePosition, targetPosition, valid, response, correct: correct ? 1 : 0, rt }]);
    setCurrentTrial(currentTrial + 1);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader><CardTitle>Posner Cueing Task</CardTitle><CardDescription>Trial {currentTrial + 1} of 40</CardDescription></CardHeader>
      <CardContent>
        <div className="text-center text-sm text-muted-foreground mb-6">Press 'A' for left box, 'L' for right box when you see GO</div>
        <div className="flex justify-center gap-8 h-64 items-center">
          <div className="w-32 h-32 border-4 border-yellow-400 relative flex items-center justify-center">{phase === 'cue' && cuePosition === 'left' && <div className="text-4xl font-bold">X</div>}{phase === 'target' && targetPosition === 'left' && <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">GO</div>}</div>
          <div className="w-32 h-32 border-4 border-yellow-400 relative flex items-center justify-center">{phase === 'cue' && cuePosition === 'right' && <div className="text-4xl font-bold">X</div>}{phase === 'target' && targetPosition === 'right' && <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">GO</div>}</div>
        </div>
      </CardContent>
    </Card>
  );
};