import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const HanoiTemplate = ({ onComplete }) => {
  const [moves, setMoves] = useState(0);
  const [trial, setTrial] = useState(0); // Track the current trial
  const [isTraining, setIsTraining] = useState(true);

  // Simple "puzzle" representation - just incrementing the moves
  const handleMove = () => {
    setMoves(moves + 1);
  };

  const handleNextTrial = () => {
    const nextTrial = trial + 1;

    if (isTraining && nextTrial >= 3) { // Reduced training trials
      setIsTraining(false);
      setTrial(0);
      setMoves(0); // Reset moves for the real trials
    } else if (!isTraining && nextTrial >= 10) { // Reduced number of trials
      // In a real Hanoi task, you'd record more data than just moves.
      onComplete?.([{ trial: trial, moves: moves }]); // Pass some result
    } else {
      setTrial(nextTrial);
      setMoves(0); // Reset moves for the next trial
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Simplified Tower of Hanoi</CardTitle>
        <CardDescription>{isTraining ? 'Training Mode' : `Trial ${trial + 1} of 10`}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center text-sm text-muted-foreground">Make moves to 'solve' the puzzle (just increment moves in this version).</div>
        <div className="flex justify-center items-center h-64">
          <div className="text-4xl font-bold">Moves: {moves}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleMove}>Make Move</Button>
          <Button onClick={handleNextTrial}>Next Trial</Button>
        </div>
      </CardContent>
    </Card>
  );
};