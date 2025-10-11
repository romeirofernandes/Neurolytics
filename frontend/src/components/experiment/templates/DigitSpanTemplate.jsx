import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const DigitSpanTemplate = ({ onComplete }) => {
  const [phase, setPhase] = useState('instructions'); // instructions, showing, recall, result
  const [currentSequence, setCurrentSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [spanLength, setSpanLength] = useState(3); // Start with 3 digits
  const [correctAtLength, setCorrectAtLength] = useState(0);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [maxSpan, setMaxSpan] = useState(0);
  const [results, setResults] = useState([]);
  const [showingIndex, setShowingIndex] = useState(0);

  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const startTest = () => {
    setPhase('showing');
    generateSequence();
  };

  const generateSequence = () => {
    // Generate random sequence of current length
    const sequence = [];
    const availableDigits = [...digits];
    
    for (let i = 0; i < spanLength; i++) {
      const randomIndex = Math.floor(Math.random() * availableDigits.length);
      sequence.push(availableDigits[randomIndex]);
      availableDigits.splice(randomIndex, 1); // Remove to avoid repeats
    }

    setCurrentSequence(sequence);
    setUserSequence([]);
    setShowingIndex(0);
    showSequence(sequence);
  };

  const showSequence = (sequence) => {
    let index = 0;
    
    const interval = setInterval(() => {
      setShowingIndex(index);
      index++;
      
      if (index > sequence.length) {
        clearInterval(interval);
        setTimeout(() => {
          setPhase('recall');
          setShowingIndex(-1);
        }, 500);
      }
    }, 1000); // Show each digit for 1 second
  };

  const handleDigitClick = (digit) => {
    if (phase !== 'recall') return;

    const newUserSequence = [...userSequence, digit];
    setUserSequence(newUserSequence);

    // Check if sequence is complete
    if (newUserSequence.length === currentSequence.length) {
      checkAnswer(newUserSequence);
    }
  };

  const checkAnswer = (userSeq) => {
    const correct = JSON.stringify(userSeq) === JSON.stringify(currentSequence);
    
    const result = {
      spanLength,
      sequence: currentSequence,
      userResponse: userSeq,
      correct: correct ? 1 : 0,
      timestamp: Date.now()
    };

    setResults([...results, result]);

    if (correct) {
      setMaxSpan(Math.max(maxSpan, spanLength));
      const newCorrectAtLength = correctAtLength + 1;
      setCorrectAtLength(newCorrectAtLength);
      setConsecutiveErrors(0);

      // Need 2 correct at same length to advance
      if (newCorrectAtLength >= 2) {
        if (spanLength >= 9) {
          // Max span reached
          endTest();
        } else {
          setSpanLength(spanLength + 1);
          setCorrectAtLength(0);
          setTimeout(() => {
            setPhase('showing');
            generateSequence();
          }, 1500);
        }
      } else {
        setTimeout(() => {
          setPhase('showing');
          generateSequence();
        }, 1500);
      }
    } else {
      const newErrors = consecutiveErrors + 1;
      setConsecutiveErrors(newErrors);
      setCorrectAtLength(0);

      if (newErrors >= 2) {
        // Two consecutive errors, end test
        endTest();
      } else {
        setTimeout(() => {
          setPhase('showing');
          generateSequence();
        }, 1500);
      }
    }

    setPhase('result');
    setTimeout(() => {
      if (phase === 'result') {
        setPhase('showing');
      }
    }, 1000);
  };

  const endTest = () => {
    const finalResult = {
      maxDigitSpan: maxSpan,
      totalTrials: results.length + 1,
      allResults: results
    };
    onComplete?.(finalResult);
  };

  const clearUserSequence = () => {
    setUserSequence([]);
  };

  if (phase === 'instructions') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Digit Span Task</CardTitle>
          <CardDescription>Test your short-term memory capacity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded space-y-3">
            <p className="font-semibold text-lg">Instructions:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>You will see a sequence of digits, one at a time</li>
              <li>Remember the digits in order</li>
              <li>After the sequence, click the digits in the same order</li>
              <li>The sequence gets longer as you progress</li>
              <li>The test ends after 2 consecutive errors or reaching 9 digits</li>
            </ul>
          </div>

          <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded text-sm">
            <p className="font-semibold">💡 Tip:</p>
            <p>Try to visualize or "chunk" the digits together. Most people can remember 7±2 digits!</p>
          </div>

          <Button onClick={startTest} size="lg" className="w-full">
            Start Test
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'showing') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Digit Span Task</CardTitle>
          <CardDescription>
            Sequence Length: {spanLength} - Remember the digits!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-sm text-muted-foreground">
            Watch carefully and remember the order...
          </div>

          <div className="flex items-center justify-center h-80">
            {showingIndex < currentSequence.length && (
              <div className="text-9xl font-bold animate-pulse">
                {currentSequence[showingIndex]}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-2">
            {currentSequence.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full ${
                  idx <= showingIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'recall') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Digit Span Task</CardTitle>
          <CardDescription>
            Click the digits in the correct order ({userSequence.length}/{currentSequence.length})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded min-h-20 flex items-center justify-center gap-2">
            {userSequence.length === 0 ? (
              <span className="text-muted-foreground">Click digits below...</span>
            ) : (
              userSequence.map((digit, idx) => (
                <span key={idx} className="text-4xl font-bold">
                  {digit}
                </span>
              ))
            )}
          </div>

          <div className="grid grid-cols-5 gap-3">
            {digits.map((digit) => (
              <Button
                key={digit}
                onClick={() => handleDigitClick(digit)}
                size="lg"
                variant="outline"
                className="text-2xl h-16 font-bold"
              >
                {digit}
              </Button>
            ))}
          </div>

          <Button 
            onClick={clearUserSequence} 
            variant="destructive" 
            className="w-full"
            disabled={userSequence.length === 0}
          >
            Clear
          </Button>

          <div className="text-xs text-center text-muted-foreground">
            Correct at this length: {correctAtLength}/2 needed to advance
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'result') {
    const lastResult = results[results.length - 1];
    const correct = lastResult?.correct === 1;

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Digit Span Task</CardTitle>
          <CardDescription>Trial Result</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className={`text-center p-8 rounded ${
            correct ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
          }`}>
            <div className={`text-6xl font-bold ${
              correct ? 'text-green-600' : 'text-red-600'
            }`}>
              {correct ? '✓ Correct!' : '✗ Incorrect'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-4 rounded text-center">
              <div className="text-sm text-muted-foreground">Correct Sequence</div>
              <div className="text-2xl font-bold mt-2">
                {lastResult?.sequence.join(' ')}
              </div>
            </div>
            <div className="bg-muted p-4 rounded text-center">
              <div className="text-sm text-muted-foreground">Your Response</div>
              <div className="text-2xl font-bold mt-2">
                {lastResult?.userResponse.join(' ')}
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold">{maxSpan}</div>
            <div className="text-sm text-muted-foreground">Current Best Span</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
