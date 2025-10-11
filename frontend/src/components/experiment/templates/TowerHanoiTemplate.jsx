import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const TowerHanoiTemplate = ({ onComplete }) => {
  const [pegs, setPegs] = useState([[3, 2, 1], [], []]);
  const [selectedPeg, setSelectedPeg] = useState(null);
  const [moves, setMoves] = useState(0);
  const [errors, setErrors] = useState({ biggerOnSmaller: 0, invalidMove: 0 });
  const [startTime] = useState(Date.now());
  const [results, setResults] = useState([]);

  const handlePegClick = (pegIndex) => {
    if (selectedPeg === null) {
      // Select a disc
      if (pegs[pegIndex].length > 0) {
        setSelectedPeg(pegIndex);
      }
    } else {
      // Try to move disc
      if (selectedPeg === pegIndex) {
        setSelectedPeg(null);
        return;
      }

      const disc = pegs[selectedPeg][pegs[selectedPeg].length - 1];
      const targetDisc = pegs[pegIndex][pegs[pegIndex].length - 1];

      if (targetDisc !== undefined && disc > targetDisc) {
        // Trying to place bigger on smaller
        setErrors({ ...errors, biggerOnSmaller: errors.biggerOnSmaller + 1 });
        setSelectedPeg(null);
        return;
      }

      // Valid move
      const newPegs = pegs.map((peg, i) => {
        if (i === selectedPeg) return peg.slice(0, -1);
        if (i === pegIndex) return [...peg, disc];
        return peg;
      });

      setPegs(newPegs);
      setMoves(moves + 1);
      setSelectedPeg(null);

      const result = {
        timeMs: Date.now() - startTime,
        moveNumber: moves + 1,
        errorsBigOnSmall: errors.biggerOnSmaller,
        errorsInvalid: errors.invalidMove
      };

      setResults([...results, result]);

      // Check if solved
      if (newPegs[2].length === 3) {
        onComplete?.([...results, result]);
      }
    }
  };

  const getDiscColor = (size) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500'];
    return colors[size - 1];
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Tower of Hanoi</CardTitle>
        <CardDescription>
          Moves: {moves} | Errors: {errors.biggerOnSmaller + errors.invalidMove}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-sm text-muted-foreground mb-6">
          Move all discs to the right peg. Larger discs cannot go on smaller ones.
        </div>

        <div className="flex justify-around items-end h-64">
          {pegs.map((peg, pegIndex) => (
            <div
              key={pegIndex}
              className={`w-32 cursor-pointer ${selectedPeg === pegIndex ? 'ring-4 ring-blue-500' : ''}`}
              onClick={() => handlePegClick(pegIndex)}
            >
              <div className="flex flex-col-reverse items-center gap-1 h-full">
                <div className="w-2 h-full bg-gray-400"></div>
                {peg.map((disc, discIndex) => (
                  <div
                    key={discIndex}
                    className={`${getDiscColor(disc)} h-8 rounded`}
                    style={{ width: `${disc * 30}px` }}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Minimum moves required: 7
        </div>
      </CardContent>
    </Card>
  );
};