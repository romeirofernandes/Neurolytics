import React from 'react';
import { Type, Image, Zap, ClipboardList } from 'lucide-react';

export const blockTypes = [
  {
    id: 'text',
    name: 'Text Block',
    icon: Type,
    description: 'Display text content',
    color: 'bg-blue-500',
  },
  {
    id: 'image',
    name: 'Image Block',
    icon: Image,
    description: 'Show an image',
    color: 'bg-green-500',
  },
  {
    id: 'reaction',
    name: 'Reaction Time',
    icon: Zap,
    description: 'Measure reaction time',
    color: 'bg-yellow-500',
  },
  {
    id: 'survey',
    name: 'Survey Question',
    icon: ClipboardList,
    description: 'Ask a question',
    color: 'bg-purple-500',
  },
];

export const BlockIcon = ({ type, className = '' }) => {
  const blockType = blockTypes.find((bt) => bt.id === type);
  if (!blockType) return null;
  
  const Icon = blockType.icon;
  return <Icon className={className} />;
};

// Preview component for each block type
export const BlockPreview = ({ block }) => {
  const renderPreview = () => {
    switch (block.type) {
      case 'text':
        return (
          <div 
            className="w-full h-32 bg-muted/30 rounded-md p-3 overflow-hidden"
            style={{ 
              textAlign: block.props.alignment,
              fontSize: block.props.fontSize,
            }}
          >
            <p className="truncate text-foreground/70">
              {block.props.content || 'Enter your text...'}
            </p>
          </div>
        );

      case 'image':
        return (
          <div className="w-full h-32 bg-muted/30 rounded-md overflow-hidden flex items-center justify-center">
            {block.props.url ? (
              <img 
                src={block.props.url} 
                alt={block.props.alt}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              <Image className="w-8 h-8 mr-2" />
              No image
            </div>
          </div>
        );

      case 'reaction':
        return (
          <div className="w-full h-32 bg-muted/30 rounded-md p-3 flex flex-col items-center justify-center">
            <Zap className="w-8 h-8 text-yellow-500 mb-2" />
            <p className="text-sm text-foreground/70 text-center">
              {block.props.stimulus || 'Reaction test'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Limit: {block.props.timeLimit}ms
            </p>
          </div>
        );

      case 'survey':
        return (
          <div className="w-full h-32 bg-muted/30 rounded-md p-3 overflow-hidden">
            <p className="text-sm font-medium text-foreground/70 mb-2 truncate">
              {block.props.question || 'Your question?'}
            </p>
            <div className="space-y-1">
              {block.props.options?.slice(0, 3).map((opt, i) => (
                <div key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/50" />
                  <span className="truncate">{opt}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-32 bg-muted/30 rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Unknown block</p>
          </div>
        );
    }
  };

  return <div className="mt-3">{renderPreview()}</div>;
};