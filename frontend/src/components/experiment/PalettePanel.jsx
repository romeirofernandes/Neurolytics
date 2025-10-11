import React from 'react';
import { blockTypes } from './BlockTypes';
import { useExperiment } from '../../context/ExperimentContext';
import { Plus } from 'lucide-react';

const PalettePanel = () => {
  const { addBlock } = useExperiment();

  return (
    <div className="w-64 border-r border-border bg-card p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Block Palette</h2>
      <div className="space-y-2">
        {blockTypes.map((blockType) => {
          const Icon = blockType.icon;
          return (
            <button
              key={blockType.id}
              onClick={() => addBlock(blockType.id)}
              className="w-full p-3 border border-border rounded-lg hover:bg-accent hover:border-primary transition-all group text-left"
            >
              <div className="flex items-start gap-3">
                <div className={`${blockType.color} p-2 rounded-md text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-foreground group-hover:text-primary">
                    {blockType.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {blockType.description}
                  </p>
                </div>
                <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PalettePanel;