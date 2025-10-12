import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Image, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  MousePointer,
  FileQuestion,
  GitBranch,
} from 'lucide-react';

const iconMap = {
  stimulus: Image,
  instruction: MessageSquare,
  fixation: Clock,
  response: MousePointer,
  feedback: CheckCircle,
  survey: FileQuestion,
  conditional: GitBranch,
};

const colorMap = {
  stimulus: 'bg-chart-1',
  response: 'bg-chart-2',
  instruction: 'bg-chart-3',
  fixation: 'bg-chart-4',
  feedback: 'bg-chart-5',
  survey: 'bg-info',
  conditional: 'bg-warning',
};

const ExperimentNode = ({ data, isConnectable }) => {
  const Icon = iconMap[data.blockType] || Image;
  const colorClass = colorMap[data.blockType] || 'bg-muted';

  return (
    <div className="relative">
      <Handle 
        type="target" 
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-primary"
      />
      
      <Card className="min-w-[200px] border-2 hover:border-primary transition-colors shadow-lg">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded ${colorClass} text-primary-foreground`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{data.label}</div>
              <Badge className={`${colorClass} text-primary-foreground text-xs mt-1`}>
                {data.blockType}
              </Badge>
            </div>
          </div>
          
          {data.config?.content && (
            <div className="text-xs text-muted-foreground mt-2 truncate">
              {data.config.stimulusType === 'text' ? data.config.content : 'Media attached'}
            </div>
          )}
          
          {data.config?.duration && (
            <div className="text-xs text-muted-foreground mt-1">
              Duration: {data.config.duration}ms
            </div>
          )}
        </div>
      </Card>

      <Handle 
        type="source" 
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-primary"
      />
    </div>
  );
};

export default memo(ExperimentNode);