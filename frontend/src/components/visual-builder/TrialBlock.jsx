import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { GripVertical, Trash2, Copy, Settings } from 'lucide-react';

export const TrialBlock = ({ trial, onEdit, onDelete, onDuplicate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: trial.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getTypeColor = (type) => {
    const colors = {
      stimulus: 'bg-chart-1',
      response: 'bg-chart-2',
      instruction: 'bg-chart-3',
      fixation: 'bg-chart-4',
      feedback: 'bg-chart-5',
      survey: 'bg-info',
      conditional: 'bg-warning',
    };
    return colors[type] || 'bg-muted';
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="mb-2 hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`${getTypeColor(trial.type)} text-primary-foreground`}>
                  {trial.type}
                </Badge>
                <span className="text-sm font-medium truncate">{trial.name}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                Duration: {trial.duration || 'Auto'} | Response: {trial.responseType || 'None'}
              </p>
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(trial)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDuplicate(trial)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(trial.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};