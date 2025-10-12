import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const StroopTemplate = ({ onComplete }) => {
  const [currentTrial, setCurrentTrial] = useState(0);
  const [word, setWord] = useState('');
  const [color, setColor] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [results, setResults] = useState([]);
  const [isTraining, setIsTraining] = useState(true);

  const words = ['RED', 'GREEN', 'BLUE', 'YELLOW'];
  const colors = { RED: 'red', GREEN: 'green', BLUE: 'blue', YELLOW: 'yellow' };
  // Define keys for keyboard responses
  const keys = { r: 'RED', g: 'GREEN', b: 'BLUE', y: 'YELLOW' };

  useEffect(() => {
    generateTrial();
  }, []);

  useEffect(() => {
    // Handle keyboard input for responses
    const handleKeyPress = (e) => {
      if (keys[e.key.toLowerCase()]) {
        handleResponse(keys[e.key.toLowerCase()]);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [word, color, startTime]);

  const generateTrial = () => {
    const newWord = words[Math.floor(Math.random() * words.length)];
    const newColor = words[Math.floor(Math.random() * words.length)];
    setWord(newWord);
    setColor(newColor);
    setStartTime(Date.now());
  };

  const handleResponse = (response) => {
    const rt = Date.now() - startTime;
    const correct = response === color;
    const compatible = word === color ? 1 : 0;
    const result = { word, color, compatible, response, correct: correct ? 1 : 0, rt };
    setResults([...results, result]);

    const nextTrial = currentTrial + 1;
    if (isTraining && nextTrial >= 5) {
      // After 5 training trials, switch to test mode
      setIsTraining(false);
      setCurrentTrial(0);
      generateTrial();
    } else if (!isTraining && nextTrial >= 15) {
      // After 15 test trials (total 20 trials), complete the task
      onComplete?.(results);
    } else {
      setCurrentTrial(nextTrial);
      generateTrial();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Stroop Task</CardTitle>
        <CardDescription>{isTraining ? 'Training Mode' : `Trial ${currentTrial + 1} of 15`}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center text-sm text-muted-foreground">Press the key corresponding to the COLOR of the word (not what it says)</div>
        <div className="flex justify-center items-center h-64">
          <div className="text-6xl font-bold" style={{ color: colors[color] }}>{word}</div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(colors).map(([name, colorValue]) => (
            <Button key={name} onClick={() => handleResponse(name)} style={{ backgroundColor: colorValue }} className="text-white">{name[0].toUpperCase()}</Button>
          ))}
        </div>
        <div className="text-center text-xs text-muted-foreground">Keyboard shortcuts: R, G, B, Y</div>
      </CardContent>
    </Card>
  );
};