import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const TowerHanoiTemplate = ({ onComplete }) => {
  // Initialize with 3 discs on left peg (3=largest, 2=medium, 1=smallest)
  const [pegs, setPegs] = useState([[3, 2, 1], [], []]);
  const [selectedPeg, setSelectedPeg] = useState(null);
  const [moves, setMoves] = useState(0);
  const [errors, setErrors] = useState({ biggerOnSmaller: 0, invalidMove: 0 });
  const [startTime] = useState(Date.now());
  const [results, setResults] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  const handlePegClick = (pegIndex) => {
    if (isComplete) return;

    if (selectedPeg === null) {
      // Select a disc from a peg
      if (pegs[pegIndex].length > 0) {
        setSelectedPeg(pegIndex);
      } else {
        // Trying to select from empty peg - invalid move
        setErrors(prev => ({ ...prev, invalidMove: prev.invalidMove + 1 }));
      }
    } else {
      // Try to move disc to target peg
      if (selectedPeg === pegIndex) {
        // Clicked same peg - deselect
        setSelectedPeg(null);
        return;
      }

      const sourcePeg = pegs[selectedPeg];
      const targetPeg = pegs[pegIndex];
      const disc = sourcePeg[sourcePeg.length - 1]; // Top disc from source
      const targetTopDisc = targetPeg[targetPeg.length - 1]; // Top disc on target

      // Check if move is valid: bigger disc cannot go on smaller disc
      if (targetTopDisc !== undefined && disc > targetTopDisc) {
        // Invalid: trying to place bigger on smaller
        setErrors(prev => ({ ...prev, biggerOnSmaller: prev.biggerOnSmaller + 1 }));
        setSelectedPeg(null);
        return;
      }

      // Valid move - execute it
      const newPegs = pegs.map((peg, i) => {
        if (i === selectedPeg) return peg.slice(0, -1); // Remove top disc from source
        if (i === pegIndex) return [...peg, disc]; // Add disc to target
        return peg;
      });

      setPegs(newPegs);
      const newMoves = moves + 1;
      setMoves(newMoves);
      setSelectedPeg(null);

      // Record this step
      const result = {
        timeMs: Date.now() - startTime,
        stepNumber: newMoves,
        errorsBigOnSmall: errors.biggerOnSmaller,
        errorsInvalid: errors.invalidMove,
        pegStates: newPegs.map(p => [...p]) // Save state after this move
      };

      const newResults = [...results, result];
      setResults(newResults);

      // Check if puzzle is solved (all discs on rightmost peg)
      if (newPegs[2].length === 3 && newPegs[2][0] === 3 && newPegs[2][1] === 2 && newPegs[2][2] === 1) {
        setIsComplete(true);
        // Wait a moment to show completion before calling onComplete
        setTimeout(() => {
          onComplete?.({
            totalMoves: newMoves,
            totalTime: Date.now() - startTime,
            errorsBigOnSmall: errors.biggerOnSmaller,
            errorsInvalid: errors.invalidMove,
            minimumMoves: 7,
            efficiency: (7 / newMoves) * 100, // Percentage of optimal
            allSteps: newResults
          });
        }, 500);
      }
    }
  };

  const resetPuzzle = () => {
    setPegs([[3, 2, 1], [], []]);
    setSelectedPeg(null);
    setMoves(0);
    setErrors({ biggerOnSmaller: 0, invalidMove: 0 });
    setResults([]);
    setIsComplete(false);
  };

  const getDiscColor = (size) => {
    const colors = {
      1: 'bg-blue-500',    // Smallest - Blue
      2: 'bg-green-500',   // Medium - Green
      3: 'bg-red-500'      // Largest - Red
    };
    return colors[size];
  };

  const getDiscWidth = (size) => {
    const widths = {
      1: 60,   // Smallest
      2: 90,   // Medium
      3: 120   // Largest
    };
    return widths[size];
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Tower of Hanoi</span>
          {isComplete && (
            <span className="text-green-600 dark:text-green-400 text-lg">
              ✓ Completed!
            </span>
          )}
        </CardTitle>
        <CardDescription className="space-y-1">
          <div className="flex gap-6">
            <span>Moves: {moves}</span>
            <span>Time: {Math.floor((Date.now() - startTime) / 1000)}s</span>
            <span className="text-red-600 dark:text-red-400">
              Errors: {errors.biggerOnSmaller + errors.invalidMove}
              {errors.biggerOnSmaller > 0 && ` (${errors.biggerOnSmaller} big-on-small)`}
              {errors.invalidMove > 0 && ` (${errors.invalidMove} invalid)`}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instructions */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h3 className="font-semibold">Instructions:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Move all discs from the <strong>left peg</strong> to the <strong>right peg</strong></li>
            <li>Only one disc can be moved at a time</li>
            <li>A larger disc <strong>cannot</strong> be placed on a smaller disc</li>
            <li>Minimum moves to solve: <strong>7 moves</strong></li>
          </ul>
        </div>

        {/* Tower of Hanoi Pegs */}
        <div className="flex justify-around items-end py-8 px-4" style={{ height: '300px' }}>
          {pegs.map((peg, pegIndex) => (
            <div
              key={pegIndex}
              className={`relative flex flex-col items-center cursor-pointer transition-all ${
                selectedPeg === pegIndex 
                  ? 'scale-105' 
                  : 'hover:scale-102'
              }`}
              onClick={() => handlePegClick(pegIndex)}
            >
              {/* Peg Label */}
              <div className="absolute -top-8 text-sm font-semibold text-muted-foreground">
                {pegIndex === 0 && 'Start'}
                {pegIndex === 1 && 'Aux'}
                {pegIndex === 2 && 'Goal'}
              </div>

              {/* Discs Container */}
              <div className="flex flex-col-reverse items-center gap-1 relative" style={{ minHeight: '200px' }}>
                {/* Vertical Peg */}
                <div 
                  className={`absolute bottom-0 w-3 bg-gray-400 dark:bg-gray-600 rounded-t-full transition-all ${
                    selectedPeg === pegIndex ? 'ring-4 ring-blue-500' : ''
                  }`}
                  style={{ height: '200px', zIndex: 0 }}
                ></div>

                {/* Discs */}
                <div className="flex flex-col-reverse items-center gap-1 relative" style={{ zIndex: 1, paddingBottom: '4px' }}>
                  {peg.map((disc, discIndex) => (
                    <div
                      key={discIndex}
                      className={`${getDiscColor(disc)} h-10 rounded shadow-lg transition-all ${
                        selectedPeg === pegIndex && discIndex === peg.length - 1
                          ? 'ring-4 ring-yellow-400 scale-110'
                          : ''
                      }`}
                      style={{ 
                        width: `${getDiscWidth(disc)}px`,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div className="h-full flex items-center justify-center text-white font-bold text-sm">
                        {disc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Base */}
              <div className="w-40 h-3 bg-gray-600 dark:bg-gray-700 rounded mt-1"></div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={resetPuzzle}
            disabled={moves === 0 && !isComplete}
          >
            Reset Puzzle
          </Button>
          {isComplete && (
            <Button 
              onClick={() => onComplete?.({
                totalMoves: moves,
                totalTime: Date.now() - startTime,
                errorsBigOnSmall: errors.biggerOnSmaller,
                errorsInvalid: errors.invalidMove,
                minimumMoves: 7,
                efficiency: (7 / moves) * 100,
                allSteps: results
              })}
            >
              Continue
            </Button>
          )}
        </div>

        {/* Performance Stats */}
        {moves > 0 && (
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Performance:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Current Moves</div>
                <div className="text-lg font-bold">{moves}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Optimal Moves</div>
                <div className="text-lg font-bold">7</div>
              </div>
              <div>
                <div className="text-muted-foreground">Efficiency</div>
                <div className="text-lg font-bold">
                  {moves > 0 ? Math.round((7 / moves) * 100) : 0}%
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Errors</div>
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {errors.biggerOnSmaller + errors.invalidMove}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};