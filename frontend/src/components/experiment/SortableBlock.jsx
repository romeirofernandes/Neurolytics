import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, Copy, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { useExperiment } from '../../context/ExperimentContext';
import { BlockIcon, blockTypes, BlockPreview } from './BlockTypes';

const SortableBlock = ({ block, index, isSelected }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const { selectBlock, removeBlock, addBlock, updateBlockProps } = useExperiment();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const blockType = blockTypes.find((bt) => bt.id === block.type);

  const handleDuplicate = () => {
    addBlock(block.type);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    updateBlockProps(block.id, { visible: !isVisible });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border-2 rounded-lg transition-all ${
        isSelected
          ? 'border-primary shadow-lg'
          : 'border-border hover:border-primary/50'
      } ${!isVisible ? 'opacity-50' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Block Number */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
          {index + 1}
        </div>

        {/* Block Icon and Name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`${blockType?.color} p-2 rounded-md text-white flex-shrink-0`}>
            <BlockIcon type={block.type} className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate">{blockType?.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{blockType?.description}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
            title={isExpanded ? "Collapse" : "Expand preview"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <button
            onClick={toggleVisibility}
            className="p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
            title={isVisible ? "Hide block" : "Show block"}
          >
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDuplicate}
            className="p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
            title="Duplicate block"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={() => selectBlock(block.id)}
            className={`p-2 hover:bg-accent rounded-md transition-colors ${
              isSelected ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Edit properties"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => removeBlock(block.id)}
            className="p-2 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors"
            title="Delete block"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">Preview</span>
            <span className="text-xs text-muted-foreground">ID: {block.id.slice(-8)}</span>
          </div>
          <BlockPreview block={block} />
        </div>
      )}
    </div>
  );
};

export default SortableBlock;