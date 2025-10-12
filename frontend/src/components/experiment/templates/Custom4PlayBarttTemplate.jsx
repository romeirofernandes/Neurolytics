import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const BARTTemplate = ({ onComplete }) => {
  const [balloonSize, setBalloonSize] = useState(50);
  const [pumps, setPumps] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [currentEarnings, setCurrentEarnings] = useState(0);
  const [balloonColor, setBalloonColor] = useState('blue');
  const [balloonCount, setBalloonCount] = useState(1);
  const [exploded, setExploded] = useState(false);
  const [results, setResults] = useState([]);
  const [isTraining, setIsTraining] = useState(true);
  const [maxPumps, setMaxPumps] = useState(10);

  // Define balloon colors and their associated maximum pump values (explosion probabilities).  Adjusted to influence risk-taking.
  const balloonColors = {
    blue: { color: '#3B82F6', maxAvg: 64 },
    yellow: { color: '#EAB308', maxAvg: 16 },
    orange: { color: '#F97316', maxAvg: 4 },
    green: { color: '#22C55E', maxAvg: 10 }
  };

  useEffect(() => { resetBalloon(); }, []);

  const resetBalloon = () => {
    // Use all colors during the task. Training uses Green.
    const colors = isTraining ? ['green'] : ['blue', 'yellow', 'orange', 'green'];
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    const avgMax = balloonColors[newColor].maxAvg;
    // Randomize max pumps based on the color's average max.
    const newMax = Math.floor(avgMax * (0.5 + Math.random()));
    setBalloonColor(newColor);
    setMaxPumps(newMax);
    setBalloonSize(50);
    setPumps(0);
    setCurrentEarnings(0);
    setExploded(false);
  };

  const handlePump = () => {
    if (exploded) return;
    const newPumps = pumps + 1;
    const newEarnings = currentEarnings + 0.05;
    setPumps(newPumps);
    setCurrentEarnings(newEarnings);
    setBalloonSize(50 + newPumps * 10);
    if (newPumps >= maxPumps) {
      setExploded(true);
      setResults([...results, { balloonColor, balloonCount, timesPumped: newPumps, explosion: 1, earningsThisBalloon: 0, totalEarnings: earnings }]);
      setTimeout(() => {
        if (balloonCount >= 33) { onComplete?.(results); } else { setBalloonCount(balloonCount + 1); if (isTraining && balloonCount >= 3) { setIsTraining(false); } resetBalloon(); }
      }, 1000);
    }
  };

  const handleCollect = () => {
    if (exploded) return;
    const newEarnings = earnings + currentEarnings;
    setEarnings(newEarnings);
    setResults([...results, { balloonColor, balloonCount, timesPumped: pumps, explosion: 0, earningsThisBalloon: currentEarnings, totalEarnings: newEarnings }]);
    if (balloonCount >= 33) { onComplete?.(results); } else { setBalloonCount(balloonCount + 1); if (isTraining && balloonCount >= 3) { setIsTraining(false); } resetBalloon(); }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader><CardTitle>Balloon Analogue Risk Task (BART)</CardTitle><CardDescription>{isTraining ? 'Training Mode' : `Trial ${balloonCount - 3} of 30`}</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm"><div>Current Trial: ${currentEarnings.toFixed(2)}</div><div>Total Earnings: ${earnings.toFixed(2)}</div></div>
        <div className="flex justify-center items-center h-96 relative"><div className="rounded-full transition-all duration-200" style={{ width: `${balloonSize}px`, height: `${balloonSize}px`, backgroundColor: exploded ? '#EF4444' : balloonColors[balloonColor].color, opacity: exploded ? 0.5 : 1 }}>{exploded && <div className="flex items-center justify-center h-full text-white font-bold text-2xl">💥 POP!</div>}</div></div>
        <div className="flex gap-4 justify-center"><Button onClick={handlePump} disabled={exploded} size="lg">Pump (+$0.05)</Button><Button onClick={handleCollect} disabled={exploded} variant="outline" size="lg">Collect Money</Button></div>
        <div className="text-center text-sm text-muted-foreground">Pumps: {pumps}</div>
      </CardContent>
    </Card>
  );
};