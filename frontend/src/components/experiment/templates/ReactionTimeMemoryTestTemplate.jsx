import React, { useState, useEffect } from 'react';

const ReactionTimeMemoryExperiment = () => {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [repetition, setRepetition] = useState(0);
  const [trialData, setTrialData] = useState([]);
  const [experimentCompleted, setExperimentCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [blockOrder, setBlockOrder] = useState([]);
  const [currentResponse, setCurrentResponse] = useState(null);


  const numBlocks = 8;
  const repetitionsPerBlock = 5;
  const totalTrials = numBlocks * repetitionsPerBlock;

  // Define the blocks of the experiment
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
      next: null, // final block
    },
  ];

  useEffect(() => {
    // Initialize block order with randomization
    const initialBlockOrder = [];
    for (let i = 0; i < numBlocks; i++) {
      for (let j = 0; j < repetitionsPerBlock; j++) {
        initialBlockOrder.push(i);
      }
    }

    // Shuffle the block order using Fisher-Yates shuffle
    const shuffledBlockOrder = [...initialBlockOrder];
    for (let i = shuffledBlockOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledBlockOrder[i], shuffledBlockOrder[j]] = [
        shuffledBlockOrder[j],
        shuffledBlockOrder[i],
      ];
    }
    setBlockOrder(shuffledBlockOrder);
  }, []);

  useEffect(() => {
    if (blockOrder.length > 0 && currentBlockIndex < totalTrials) {
      const currentBlockType = blocks[blockOrder[currentBlockIndex]].type;

      if (currentBlockType === 'response') {
        // Start timing for response
        setStartTime(performance.now());
        setResponseTime(null); // Reset response time
        setAccuracy(null);      // Reset accuracy
        setCurrentResponse(null);
        window.addEventListener('keydown', handleKeyPress);
      } else {
        // No action needed for other block types
      }
    }
    return () => {
        window.removeEventListener('keydown', handleKeyPress); // Clean up the event listener on unmount
    }
  }, [currentBlockIndex, blockOrder]);

  const handleKeyPress = (event) => {
    if (blocks[blockOrder[currentBlockIndex]].type === 'response') {
      const { choices, correctResponse } = blocks[blockOrder[currentBlockIndex]].configuration;

      if (choices.includes(event.code.toLowerCase())) {
        const endTime = performance.now();
        const reactionTime = endTime - startTime;
        const isCorrect = event.code.toLowerCase() === correctResponse;

        setResponseTime(reactionTime);
        setAccuracy(isCorrect);
        setCurrentResponse(event.code.toLowerCase());
        window.removeEventListener('keydown', handleKeyPress); // Remove listener after first response.

      }
    }
  };


  const nextTrial = () => {
    const currentBlock = blocks[blockOrder[currentBlockIndex]];

    // Collect data for the current trial
    const trialDataEntry = {
      blockIndex: blockOrder[currentBlockIndex],
      blockType: currentBlock.type,
      configuration: currentBlock.configuration,
      repetition: repetition,
      reactionTime: responseTime,
      accuracy: accuracy,
      response: currentResponse,
    };

    setTrialData((prevData) => [...prevData, trialDataEntry]);

    // Move to the next block or repetition
    if (currentBlockIndex < totalTrials - 1) {
        setCurrentBlockIndex((prevIndex) => prevIndex + 1);
    }
    else {
        setExperimentCompleted(true);
    }
    setStartTime(null);
    setResponseTime(null);
    setAccuracy(null);
    setCurrentResponse(null);

  };

  const renderBlockContent = () => {
    if (blockOrder.length === 0) {
      return <p>Loading Experiment...</p>;
    }
    if (experimentCompleted) {
      return (
        <div>
          <h2>Experiment Completed!</h2>
          <h3>Summary Statistics:</h3>
          {/* Example: Calculate average reaction time */}
          {trialData.length > 0 && (
            <p>
              Average Reaction Time:{' '}
              {trialData
                .filter((trial) => trial.reactionTime !== null)
                .reduce((sum, trial) => sum + trial.reactionTime, 0) /
                trialData.filter((trial) => trial.reactionTime !== null).length}{' '}
              ms
            </p>
          )}
          {/* Add more summary stats as needed */}
          <pre>{JSON.stringify(trialData, null, 2)}</pre>
        </div>
      );
    }

    const currentBlock = blocks[blockOrder[currentBlockIndex]];

    switch (currentBlock.type) {
      case 'instruction':
        return (
          <div>
            <p>{currentBlock.configuration.text}</p>
            <button onClick={nextTrial}>
              {currentBlock.configuration.buttonText}
            </button>
          </div>
        );
      case 'fixation':
        return (
          <div>
            <p style={{ fontSize: currentBlock.configuration.size }}>
              {currentBlock.configuration.symbol}
            </p>
            {setTimeout(nextTrial, currentBlock.configuration.duration)}
          </div>
        );
      case 'stimulus':
        return (
          <div>
            {currentBlock.configuration.stimulusType === 'text' && (
              <p
                style={{
                  fontSize: 40,
                  textAlign: currentBlock.configuration.position,
                }}
              >
                {currentBlock.configuration.content}
              </p>
            )}
            {setTimeout(nextTrial, currentBlock.configuration.duration)}
          </div>
        );
      case 'response':
        return (
          <div>
            <p>Press SPACE when you see the target!</p>
          </div>
        );
      case 'feedback':
        let feedbackText = accuracy ? currentBlock.configuration.correctText : currentBlock.configuration.incorrectText;
        return (
          <div>
            <p>{feedbackText}</p>
            {setTimeout(nextTrial, currentBlock.configuration.duration)}
          </div>
        );
      case 'survey':
        return (
          <div>
            <p>{currentBlock.configuration.question}</p>
            <form>
              {currentBlock.configuration.options.map((option, index) => (
                <div key={index}>
                  <label>
                    <input type="radio" name="memoryChoice" value={option} />
                    {option}
                  </label>
                </div>
              ))}
              <button onClick={nextTrial}>Submit</button>
            </form>
          </div>
        );
      default:
        return <p>Unknown block type</p>;
    }
  };

  return (
    <div>
      <h2>Reaction Time & Memory Test</h2>
      <p>Progress: {currentBlockIndex + 1} / {totalTrials}</p>
      {renderBlockContent()}
    </div>
  );
};

export default ReactionTimeMemoryExperiment;