import React, { useState, useEffect, useRef } from 'react';
import './Experiment.css'; // Create a CSS file for styling

const Experiment = () => {
  const [blockIndex, setBlockIndex] = useState(0);
  const [repetitionIndex, setRepetitionIndex] = useState(0);
  const [currentTrial, setCurrentTrial] = useState(null);
  const [results, setResults] = useState([]);
  const [experimentCompleted, setExperimentCompleted] = useState(false);
  const [reactionTime, setReactionTime] = useState(null);
  const startTimeRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [currentBlockRepetitions, setCurrentBlockRepetitions] = useState(0);


  const blocks = [
    {
      type: 'instruction',
      configuration: {
        text:
          'Welcome! You will see a series of images. Press SPACE as quickly as possible when you see a GREEN circle. Remember the images shown, as you\'ll be tested later. Press Continue to start.',
        buttonText: 'Start Experiment',
      },
      next: 'Get Ready',
    },
    {
      type: 'fixation',
      configuration: {
        symbol: '+',
        duration: 1000,
        size: 40,
      },
      next: 'Memory Item - Cat',
    },
    {
      type: 'stimulus',
      configuration: {
        stimulusType: 'text',
        content: '🐱 CAT',
        duration: 2000,
        position: 'center',
      },
      next: 'Brief Pause',
    },
    {
      type: 'fixation',
      configuration: {
        symbol: '+',
        duration: 500,
        size: 40,
      },
      next: 'Green Circle Target',
    },
    {
      type: 'stimulus',
      configuration: {
        stimulusType: 'text',
        content: '🟢',
        duration: 2000,
        position: 'center',
      },
      next: 'Quick Response',
    },
    {
      type: 'response',
      configuration: {
        responseType: 'keyboard',
        choices: ['space'],
        timeout: 2000,
        correctResponse: 'space',
      },
      next: 'Performance Feedback',
    },
    {
      type: 'feedback',
      configuration: {
        correctText: 'Great! Fast response ✓',
        incorrectText: 'Too slow or missed ✗',
        duration: 1000,
        showAccuracy: true,
      },
      next: 'Memory Check',
    },
    {
      type: 'survey',
      configuration: {
        question: 'Which image did you see earlier?',
        questionType: 'multiple-choice',
        options: ['Cat', 'Dog', 'Bird', 'Tree'],
      },
      next: null,
    },
  ];

  const NUM_BLOCKS = 8;
  const REPETITIONS_PER_BLOCK = 5;

  const getRandomizedTrialOrder = () => {
      const trialOrder = [];
      for (let i = 0; i < NUM_BLOCKS; i++) {
          for (let j = 0; j < REPETITIONS_PER_BLOCK; j++) {
              trialOrder.push({ blockIndex: i, repetitionIndex: j });
          }
      }
      // Fisher-Yates Shuffle
      for (let i = trialOrder.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [trialOrder[i], trialOrder[j]] = [trialOrder[j], trialOrder[i]];
      }
      return trialOrder;
  };

  const [trialOrder, setTrialOrder] = useState(getRandomizedTrialOrder());
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);

  useEffect(() => {
      if (trialOrder.length > 0) {
          loadTrial(trialOrder[currentTrialIndex]);
      }
  }, [currentTrialIndex, trialOrder]);

  const loadTrial = (trial) => {
      setBlockIndex(trial.blockIndex);
      setRepetitionIndex(trial.repetitionIndex);
      setCurrentTrial(blocks[trial.blockIndex]);
  };

  useEffect(() => {
    if (currentTrial && currentTrial.type === 'response') {
      startTimeRef.current = Date.now();
      window.addEventListener('keydown', handleKeyPress);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentTrial]);

  const handleKeyPress = (event) => {
    if (currentTrial && currentTrial.type === 'response') {
      const key = event.code.toLowerCase();
      const correctResponse = currentTrial.configuration.correctResponse.toLowerCase();

      if (currentTrial.configuration.choices.map(c => c.toLowerCase()).includes(key)) {
        const endTime = Date.now();
        const reactionTime = endTime - startTimeRef.current;
        setReactionTime(reactionTime);

        const isCorrect = key === correctResponse;
        handleTrialEnd(isCorrect, reactionTime);

        window.removeEventListener('keydown', handleKeyPress); // Remove listener after the response
      }
    }
  };


  const handleTrialEnd = (isCorrect, reactionTime) => {
    const data = {
      blockType: currentTrial.type,
      blockConfig: currentTrial.configuration,
      isCorrect: isCorrect,
      reactionTime: reactionTime,
      memoryAnswer: null, // To be populated in survey
    };

    setResults([...results, data]);
    goToNextTrial();
  };

  const handleSurveySubmit = (answer) => {
    const updatedResults = [...results];
    updatedResults[results.length - 1].memoryAnswer = answer;
    setResults(updatedResults);
    goToNextTrial();
  };

  const goToNextTrial = () => {
      const nextTrialIndex = currentTrialIndex + 1;
      if (nextTrialIndex < trialOrder.length) {
          setCurrentTrialIndex(nextTrialIndex);
          setProgress(Math.round((nextTrialIndex / trialOrder.length) * 100));
      } else {
          setExperimentCompleted(true);
          setProgress(100);
      }
  };

  const renderBlock = () => {
    if (!currentTrial) {
      return <div>Loading...</div>;
    }

    switch (currentTrial.type) {
      case 'instruction':
        return (
          <div className="instruction-block">
            <h2>{currentTrial.configuration.text}</h2>
            <button onClick={goToNextTrial}>{currentTrial.configuration.buttonText}</button>
          </div>
        );
      case 'fixation':
        return (
          <div className="fixation-block">
            <span style={{ fontSize: currentTrial.configuration.size }}>
              {currentTrial.configuration.symbol}
            </span>
            {setTimeout(goToNextTrial, currentTrial.configuration.duration)}
          </div>
        );
      case 'stimulus':
        return (
          <div className="stimulus-block">
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '4em',
              }}
            >
              {currentTrial.configuration.content}
            </div>
            {setTimeout(goToNextTrial, currentTrial.configuration.duration)}
          </div>
        );
      case 'response':
        return (
          <div className="response-block">
            <h2>Wait for the green circle and press Spacebar as fast as you can!</h2>
            {/* Waiting for key press handled in useEffect */}
          </div>
        );
      case 'feedback':
        return (
          <div className="feedback-block">
            <h2>
              {reactionTime !== null
                ? reactionTime < currentTrial.configuration.duration
                  ? currentTrial.configuration.correctText
                  : currentTrial.configuration.incorrectText
                : currentTrial.configuration.incorrectText}
            </h2>
            {setTimeout(goToNextTrial, currentTrial.configuration.duration)}
          </div>
        );
      case 'survey':
        return (
          <div className="survey-block">
            <h2>{currentTrial.configuration.question}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const selectedAnswer = e.target.answer.value;
                handleSurveySubmit(selectedAnswer);
              }}
            >
              {currentTrial.configuration.options.map((option) => (
                <div key={option}>
                  <label>
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      required
                    />
                    {option}
                  </label>
                </div>
              ))}
              <button type="submit">Submit</button>
            </form>
          </div>
        );
      default:
        return <div>Unknown block type</div>;
    }
  };

  const calculateSummaryStatistics = () => {
    const correctResponses = results.filter((result) => result.isCorrect).length;
    const accuracy = (correctResponses / results.length) * 100;

    const reactionTimes = results
      .filter((result) => result.reactionTime !== null)
      .map((result) => result.reactionTime);
    const averageReactionTime =
      reactionTimes.reduce((sum, rt) => sum + rt, 0) / reactionTimes.length;

    const catRecognitionCount = results.filter(r => r.memoryAnswer === "Cat").length;
    const recognitionAccuracy = (catRecognitionCount / NUM_BLOCKS) * 100;

    return {
      accuracy: accuracy.toFixed(2),
      averageReactionTime: averageReactionTime.toFixed(2),
      recognitionAccuracy: recognitionAccuracy.toFixed(2),
    };
  };

  const renderSummary = () => {
    const summary = calculateSummaryStatistics();
    return (
      <div className="summary-block">
        <h1>Experiment Complete!</h1>
        <h2>Summary:</h2>
        <p>Accuracy: {summary.accuracy}%</p>
        <p>Average Reaction Time: {summary.averageReactionTime} ms</p>
        <p>Cat Recognition Accuracy: {summary.recognitionAccuracy}%</p>
        <h2>Raw Data:</h2>
        <pre>{JSON.stringify(results, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="experiment-container">
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        ></div>
        <div className="progress-bar-label">{progress}%</div>
      </div>
      {!experimentCompleted ? renderBlock() : renderSummary()}
    </div>
  );
};

export default Experiment;