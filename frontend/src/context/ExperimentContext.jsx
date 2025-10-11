import React, { createContext, useContext, useState } from 'react';

const ExperimentContext = createContext();

export const useExperiment = () => {
  const context = useContext(ExperimentContext);
  if (!context) {
    throw new Error('useExperiment must be used within ExperimentProvider');
  }
  return context;
};

const getDefaultProps = (blockType) => {
  switch (blockType) {
    case 'text':
      return { content: 'Enter your text here...', fontSize: '16px', alignment: 'left' };
    case 'image':
      return { url: '', alt: 'Image description', width: '100%' };
    case 'reaction':
      return { stimulus: '', options: ['Option 1', 'Option 2'], timeLimit: 5000 };
    case 'survey':
      return { question: 'Your question here?', type: 'multiple-choice', options: ['Yes', 'No'] };
    default:
      return {};
  }
};

export const ExperimentProvider = ({ children }) => {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState(null);

  const addBlock = (blockType) => {
    const newBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: blockType,
      props: getDefaultProps(blockType),
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const removeBlock = (id) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  };

  const updateBlockProps = (id, newProps) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? { ...block, props: { ...block.props, ...newProps } } : block
      )
    );
  };

  const reorderBlocks = (newBlocks) => {
    setBlocks(newBlocks);
  };

  const selectBlock = (id) => {
    setSelectedBlockId(id);
  };

  const clearSelection = () => {
    setSelectedBlockId(null);
  };

  const value = {
    blocks,
    selectedBlockId,
    addBlock,
    removeBlock,
    updateBlockProps,
    reorderBlocks,
    selectBlock,
    clearSelection,
  };

  return (
    <ExperimentContext.Provider value={value}>
      {children}
    </ExperimentContext.Provider>
  );
};