import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Image, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  MousePointer,
  FileQuestion,
  GitBranch,
  Layers
} from 'lucide-react';

const blockTypes = [
  {
    type: 'stimulus',
    name: 'Stimulus',
    icon: Image,
    defaultConfig: {
      stimulusType: 'image',
      content: '',
      duration: 1000,
      position: 'center'
    }
  },
  {
    type: 'instruction',
    name: 'Instruction',
    icon: MessageSquare,
    defaultConfig: {
      text: 'Click to edit instructions',
      buttonText: 'Continue',
    }
  },
  {
    type: 'fixation',
    name: 'Fixation',
    icon: Clock,
    defaultConfig: {
      symbol: '+',
      duration: 500,
      size: 40
    }
  },
  {
    type: 'response',
    name: 'Response',
    icon: MousePointer,
    defaultConfig: {
      responseType: 'keyboard',
      choices: ['f', 'j'],
      timeout: 2000,
      correctResponse: null
    }
  },
  {
    type: 'feedback',
    name: 'Feedback',
    icon: CheckCircle,
    defaultConfig: {
      correctText: 'Correct!',
      incorrectText: 'Incorrect',
      duration: 1000,
      showAccuracy: true
    }
  },
  {
    type: 'survey',
    name: 'Survey',
    icon: FileQuestion,
    defaultConfig: {
      question: 'Your question here',
      questionType: 'likert',
      options: ['1', '2', '3', '4', '5']
    }
  },
  {
    type: 'conditional',
    name: 'Conditional',
    icon: GitBranch,
    defaultConfig: {
      condition: 'accuracy > 0.7',
    }
  },
];

const NodePalette = ({ onAddNode }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="h-4 w-4" />
          Add Nodes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {blockTypes.map((block) => {
          const Icon = block.icon;
          return (
            <Button
              key={block.type}
              variant="outline"
              size="sm"
              className="w-full justify-start h-auto py-2"
              onClick={() => onAddNode(block)}
            >
              <Icon className="h-4 w-4 mr-2" />
              <span className="text-xs">{block.name}</span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default NodePalette;