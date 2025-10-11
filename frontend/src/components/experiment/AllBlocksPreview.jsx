import React from 'react';
import { X, Download, Eye } from 'lucide-react';
import { BlockIcon, blockTypes } from './BlockTypes';

const AllBlocksPreview = ({ blocks, onClose }) => {
  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(blocks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `experiment-blocks-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderBlockPreview = (block, index) => {
    const blockType = blockTypes.find((bt) => bt.id === block.type);

    switch (block.type) {
      case 'text':
        return (
          <div className="bg-white rounded-lg p-8 shadow-md min-h-[300px] flex flex-col justify-center">
            <div className="mb-4 text-sm text-muted-foreground flex items-center gap-2">
              <div className={`${blockType?.color} p-1.5 rounded text-white`}>
                <BlockIcon type={block.type} className="w-3 h-3" />
              </div>
              <span>Block {index + 1}: {blockType?.name}</span>
            </div>
            <div
              style={{
                textAlign: block.props.alignment,
                fontSize: block.props.fontSize,
              }}
              className="text-foreground"
            >
              {block.props.content}
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="bg-white rounded-lg p-8 shadow-md min-h-[300px] flex flex-col">
            <div className="mb-4 text-sm text-muted-foreground flex items-center gap-2">
              <div className={`${blockType?.color} p-1.5 rounded text-white`}>
                <BlockIcon type={block.type} className="w-3 h-3" />
              </div>
              <span>Block {index + 1}: {blockType?.name}</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {block.props.url ? (
                <img
                  src={block.props.url}
                  alt={block.props.alt}
                  style={{
                    width: block.props.width,
                    maxWidth: '100%',
                    maxHeight: '400px',
                  }}
                  className="object-contain rounded"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="hidden items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No image URL provided</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reaction':
        return (
          <div className="bg-white rounded-lg p-8 shadow-md min-h-[300px] flex flex-col justify-center">
            <div className="mb-4 text-sm text-muted-foreground flex items-center gap-2">
              <div className={`${blockType?.color} p-1.5 rounded text-white`}>
                <BlockIcon type={block.type} className="w-3 h-3" />
              </div>
              <span>Block {index + 1}: {blockType?.name}</span>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-4">
                {block.props.stimulus || 'Press SPACE when you see this!'}
              </div>
              <div className="text-sm text-muted-foreground">
                <p>⏱️ Time Limit: {(block.props.timeLimit / 1000).toFixed(1)} seconds</p>
                <p className="mt-2">Participants will press SPACE to respond</p>
              </div>
            </div>
          </div>
        );

      case 'survey':
        return (
          <div className="bg-white rounded-lg p-8 shadow-md min-h-[300px] flex flex-col">
            <div className="mb-4 text-sm text-muted-foreground flex items-center gap-2">
              <div className={`${blockType?.color} p-1.5 rounded text-white`}>
                <BlockIcon type={block.type} className="w-3 h-3" />
              </div>
              <span>Block {index + 1}: {blockType?.name}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {block.props.question}
              </h3>
              
              {block.props.type === 'text' && (
                <div>
                  <textarea
                    className="w-full p-3 border-2 border-border rounded-md resize-none"
                    rows={4}
                    placeholder="Participant's text response will appear here..."
                    disabled
                  />
                </div>
              )}

              {block.props.type === 'multiple-choice' && (
                <div className="space-y-3">
                  {block.props.options?.map((option, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-md">
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/50"></div>
                      <span className="text-foreground">{option}</span>
                    </div>
                  ))}
                </div>
              )}

              {block.props.type === 'rating' && (
                <div className="space-y-3">
                  <div className="flex justify-between gap-2">
                    {['1', '2', '3', '4', '5'].map((rating, i) => (
                      <div key={i} className="flex flex-col items-center flex-1 p-3 border border-border rounded-md">
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/50 mb-2"></div>
                        <span className="text-sm text-foreground">{rating}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground px-2">
                    <span>Very Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg p-8 shadow-md min-h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Unknown block type</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-6 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="text-white">
          <h2 className="text-2xl font-bold">Experiment Preview</h2>
          <p className="text-sm text-white/70 mt-1">
            Viewing all {blocks.length} block{blocks.length !== 1 ? 's' : ''} at once
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors border border-white/20"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            title="Close preview"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content - Scrollable blocks */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-8 border border-primary/20 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to the Experiment</h1>
            <p className="text-white/80">
              This preview shows all blocks in sequence. The actual experiment will display them one at a time.
            </p>
          </div>

          {/* All Blocks */}
          {blocks.map((block, index) => (
            <div key={block.id} className="relative">
              {/* Block separator with number */}
              {index > 0 && (
                <div className="flex items-center justify-center mb-6">
                  <div className="flex-1 h-px bg-white/20"></div>
                  <div className="px-4 py-1 bg-white/10 rounded-full text-white/70 text-xs font-medium">
                    Next Block
                  </div>
                  <div className="flex-1 h-px bg-white/20"></div>
                </div>
              )}
              
              {renderBlockPreview(block, index)}
            </div>
          ))}

          {/* Thank You Section */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/10 rounded-lg p-8 border border-green-500/20 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Experiment Complete!</h1>
            <p className="text-white/80">Thank you for participating in this experiment.</p>
          </div>
        </div>
      </div>

      {/* Footer with stats */}
      <div className="flex-shrink-0 p-4 bg-black/40 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-white/70 text-sm">
          <div className="flex gap-6">
            <div>
              <span className="text-white/50">Total Blocks:</span>{' '}
              <span className="font-semibold text-white">{blocks.length}</span>
            </div>
            <div>
              <span className="text-white/50">Types:</span>{' '}
              <span className="font-semibold text-white">
                {[...new Set(blocks.map(b => b.type))].length} unique
              </span>
            </div>
          </div>
          <div className="text-white/50">
            Scroll to view all blocks
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllBlocksPreview;