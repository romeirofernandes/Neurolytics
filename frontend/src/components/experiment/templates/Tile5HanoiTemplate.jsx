import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const NUM_DISKS = 5; // Number of disks in the Hanoi tower

const Tower = ({ disks, onMove }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="h-40 flex flex-col-reverse justify-end">
        {disks.map((diskSize, index) => (
          <div
            key={index}
            className="h-4 rounded"
            style={{
              width: `${diskSize * 20 + 20}px`, // Adjust width based on disk size
              backgroundColor: `hsl(${diskSize * 36}, 100%, 50%)`, // Different color for each disk
              margin: '2px 0',
            }}
          />
        ))}
      </div>
      <div className="w-2 h-20 bg-gray-500"></div> {/* Pole */}
      <Button onClick={onMove} disabled={disks.length === 0}>Move Top Disk</Button>
    </div>
  );
};

export const HanoiTowerTemplate = ({ onComplete }) => {
  const [towers, setTowers] = useState({
    A: [5, 4, 3, 2, 1], // Initial state: all disks on tower A
    B: [],
    C: [],
  });
  const [moves, setMoves] = useState(0);
  const [fromTower, setFromTower] = useState(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  // Check if the game is won (all disks on tower C)
  useEffect(() => {
    if (towers.C.length === NUM_DISKS) {
      setEndTime(Date.now());
      setCompleted(true);
      onComplete?.({ moves, time: endTime - startTime });
    }
  }, [towers, onComplete, startTime, moves, endTime]);

  const handleTowerClick = (towerName) => {
    if (fromTower === null) {
      // Pick up disk
      if (towers[towerName].length > 0) {
        setFromTower(towerName);
      }
    } else {
      // Put down disk
      if (towers[towerName].length === 0 || towers[towerName][towers[towerName].length - 1] > towers[fromTower][towers[fromTower].length - 1]) {
        // Valid move
        const diskToMove = towers[fromTower].pop();
        setTowers({
          ...towers,
          [towerName]: [...towers[towerName], diskToMove],
        });
        setMoves(moves + 1);
        setFromTower(null);
      } else {
        // Invalid move
        alert("Invalid move!");
        setFromTower(null);
      }
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Tower of Hanoi</CardTitle>
        <CardDescription>Move all disks from tower A to tower C.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-around">
          <Tower
            disks={towers.A}
            onMove={() => handleTowerClick('A')}
          />
          <Tower
            disks={towers.B}
            onMove={() => handleTowerClick('B')}
          />
          <Tower
            disks={towers.C}
            onMove={() => handleTowerClick('C')}
          />
        </div>
        <div>Moves: {moves}</div>
        {completed && <div>Completed in {moves} moves and {((endTime - startTime) / 1000).toFixed(2)} seconds!</div>}
      </CardContent>
    </Card>
  );
};