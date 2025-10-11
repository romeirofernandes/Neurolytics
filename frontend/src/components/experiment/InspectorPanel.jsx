import React from 'react';
import { useExperiment } from '../../context/ExperimentContext';
import { blockTypes, BlockPreview } from './BlockTypes';
import { X, Info } from 'lucide-react';

const InspectorPanel = () => {
  const { blocks, selectedBlockId, updateBlockProps, clearSelection } = useExperiment();
  
  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
  const blockType = blockTypes.find((bt) => bt.id === selectedBlock?.type);

  if (!selectedBlock) {
    return (
      <div className="w-80 border-l border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Inspector</h2>
        <div className="text-center text-muted-foreground mt-12">
          <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select a block to edit its properties</p>
        </div>
      </div>
    );
  }

  const handlePropChange = (key, value) => {
    updateBlockProps(selectedBlock.id, { [key]: value });
  };

  return (
    <div className="w-80 border-l border-border bg-card overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border p-4 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Inspector</h2>
          <button
            onClick={clearSelection}
            className="p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Block Info */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase mb-3">Block Type</h3>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className={`${blockType?.color} p-2 rounded-md text-white`}>
              {blockType && <blockType.icon className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-semibold text-foreground">{blockType?.name}</p>
              <p className="text-xs text-muted-foreground">{blockType?.description}</p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase mb-3">Live Preview</h3>
          <BlockPreview block={selectedBlock} />
        </div>

        {/* Block Properties */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase mb-3">Properties</h3>
          <div className="space-y-4">
            {selectedBlock.type === 'text' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Content
                  </label>
                  <textarea
                    value={selectedBlock.props.content}
                    onChange={(e) => handlePropChange('content', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={4}
                    placeholder="Enter your text content..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Font Size
                    </label>
                    <select
                      value={selectedBlock.props.fontSize}
                      onChange={(e) => handlePropChange('fontSize', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="12px">12px</option>
                      <option value="14px">14px</option>
                      <option value="16px">16px</option>
                      <option value="18px">18px</option>
                      <option value="20px">20px</option>
                      <option value="24px">24px</option>
                      <option value="32px">32px</option>
                      <option value="48px">48px</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Alignment
                    </label>
                    <select
                      value={selectedBlock.props.alignment}
                      onChange={(e) => handlePropChange('alignment', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                      <option value="justify">Justify</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {selectedBlock.type === 'image' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={selectedBlock.props.url}
                    onChange={(e) => handlePropChange('url', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a valid image URL
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={selectedBlock.props.alt}
                    onChange={(e) => handlePropChange('alt', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Describe the image"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Width
                  </label>
                  <select
                    value={selectedBlock.props.width}
                    onChange={(e) => handlePropChange('width', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="100%">Full Width (100%)</option>
                    <option value="75%">Large (75%)</option>
                    <option value="50%">Medium (50%)</option>
                    <option value="25%">Small (25%)</option>
                    <option value="400px">Fixed (400px)</option>
                    <option value="600px">Fixed (600px)</option>
                    <option value="800px">Fixed (800px)</option>
                  </select>
                </div>
              </>
            )}

            {selectedBlock.type === 'reaction' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Stimulus Text
                  </label>
                  <input
                    type="text"
                    value={selectedBlock.props.stimulus}
                    onChange={(e) => handlePropChange('stimulus', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Press SPACE when you see this"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Time Limit (milliseconds)
                  </label>
                  <input
                    type="number"
                    value={selectedBlock.props.timeLimit}
                    onChange={(e) => handlePropChange('timeLimit', parseInt(e.target.value) || 5000)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="100"
                    max="30000"
                    step="100"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(selectedBlock.props.timeLimit / 1000).toFixed(1)} seconds
                  </p>
                </div>
              </>
            )}

            {selectedBlock.type === 'survey' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Question
                  </label>
                  <textarea
                    value={selectedBlock.props.question}
                    onChange={(e) => handlePropChange('question', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                    placeholder="Enter your question..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Question Type
                  </label>
                  <select
                    value={selectedBlock.props.type}
                    onChange={(e) => handlePropChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="text">Text Response</option>
                    <option value="rating">Rating Scale</option>
                  </select>
                </div>

                {(selectedBlock.props.type === 'multiple-choice' || selectedBlock.props.type === 'rating') && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Options (one per line)
                    </label>
                    <textarea
                      value={selectedBlock.props.options?.join('\n') || ''}
                      onChange={(e) => handlePropChange('options', e.target.value.split('\n').filter(Boolean))}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={4}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Block ID */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Block ID: <code className="bg-muted px-1 py-0.5 rounded">{selectedBlock.id}</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InspectorPanel;