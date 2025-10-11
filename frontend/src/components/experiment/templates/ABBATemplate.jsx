import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const ABBATemplate = ({ onComplete }) => {
  const [currentTrial, setCurrentTrial] = useState(0);
  const [phase, setPhase] = useState('stimulusA'); // stimulusA, delay, stimulusB, responseA
  const [stimulusA, setStimulusA] = useState({ side: 'left', count: 1 });
  const [stimulusB, setStimulusB] = useState({ side: 'left', count: 1 });
  const [startTime, setStartTime] = useState(0);
  const [results, setResults] = useState([]);
  const [responseAPresses, setResponseAPresses] = useState([]);

  useEffect(() => {
    startTrial();
  }, [currentTrial]);

  const startTrial = () => {
    if (currentTrial >= 40) { // Reduced from 100 to 40
      onComplete?.(results);
      return;
    }

    const sideA = Math.random() < 0.5 ? 'left' : 'right';
    const countA = Math.random() < 0.5 ? 1 : 2;
    const sideB = Math.random() < 0.5 ? 'left' : 'right';
    const countB = Math.random() < 0.5 ? 1 : 2;

    setStimulusA({ side: sideA, count: countA });
    setStimulusB({ side: sideB, count: countB });
    setPhase('stimulusA');
    setResponseAPresses([]);

    setTimeout(() => {
      setPhase('delay');
      setTimeout(() => {
        setPhase('stimulusB');
        setStartTime(Date.now());
      }, 2000);
    }, 2000);
  };

  const handleResponseB = (side) => {
    const rt = Date.now() - startTime;
    setPhase('responseA');
    setStartTime(Date.now());
    
    // Store response B data temporarily
    window.responseBData = { side, rt };
  };

  const handleResponseA = (side) => {
    const rt = Date.now() - startTime;
    const newPresses = [...responseAPresses, { side, rt }];
    setResponseAPresses(newPresses);

    const expectedPresses = stimulusA.count;
    if (newPresses.length >= expectedPresses) {
      // Trial complete
      const result = {
        stimulusA,
        stimulusB,
        responseB: window.responseBData,
        responseA: newPresses,
        compatible: stimulusA.side === stimulusB.side ? 0 : 1
      };

      setResults([...results, result]);
      setCurrentTrial(currentTrial + 1);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>ABBA Task</CardTitle>
        <CardDescription>Trial {currentTrial + 1} of 40</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center text-sm text-muted-foreground">
          Plan response with S/K keys, respond immediately with A/L keys
        </div>

        <div className="h-64 flex items-center justify-center">
          {phase === 'stimulusA' && (
            <div className="text-4xl">
              Plan: {stimulusA.side === 'left' ? 'S' : 'K'} 
              {stimulusA.count === 2 && ` + ${stimulusA.side === 'left' ? 'S' : 'K'}`}
            </div>
          )}
          {phase === 'delay' && (
            <div className="text-2xl text-muted-foreground">Wait...</div>
          )}
          {phase === 'stimulusB' && (
            <div className="space-y-4">
              <div className="text-4xl">Respond NOW!</div>
              <div className="flex gap-4 justify-center">
                <Button size="lg" onClick={() => handleResponseB('left')}>A (Left)</Button>
                <Button size="lg" onClick={() => handleResponseB('right')}>L (Right)</Button>
              </div>
            </div>
          )}
          {phase === 'responseA' && (
            <div className="space-y-4">
              <div className="text-4xl">Execute planned response!</div>
              <div className="flex gap-4 justify-center">
                <Button size="lg" onClick={() => handleResponseA('left')}>S (Left)</Button>
                <Button size="lg" onClick={() => handleResponseA('right')}>K (Right)</Button>
              </div>
              <div className="text-sm">
                {responseAPresses.length} of {stimulusA.count} presses
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};