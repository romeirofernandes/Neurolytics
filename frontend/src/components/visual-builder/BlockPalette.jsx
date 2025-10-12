import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Image, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  MousePointer,
  FileQuestion,
  GitBranch,
  Play
} from 'lucide-react';

const blockTypes = [
  {
    type: 'stimulus',
    name: 'Stimulus',
    icon: Image,
    description: 'Display image, text, or video',
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
    description: 'Show instructions to participant',
    defaultConfig: {
      text: 'Click to edit instructions',
      buttonText: 'Continue',
      duration: null
    }
  },
  {
    type: 'fixation',
    name: 'Fixation Cross',
    icon: Clock,
    description: 'Display fixation point',
    defaultConfig: {
      symbol: '+',
      duration: 500,
      size: 40
    }
  },
  {
    type: 'response',
    name: 'Response Collector',
    icon: MousePointer,
    description: 'Collect participant response',
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
    description: 'Show performance feedback',
    defaultConfig: {
      correctText: 'Correct!',
      incorrectText: 'Incorrect',
      duration: 1000,
      showAccuracy: true
    }
  },
  {
    type: 'survey',
    name: 'Survey Question',
    icon: FileQuestion,
    description: 'Ask survey question',
    defaultConfig: {
      question: 'Your question here',
      questionType: 'likert',
      options: ['1', '2', '3', '4', '5']
    }
  },
  {
    type: 'conditional',
    name: 'Conditional Branch',
    icon: GitBranch,
    description: 'Branch based on condition',
    defaultConfig: {
      condition: 'accuracy > 0.7',
      truePath: [],
      falsePath: []
    }
  },
];

export const BlockPalette = ({ onAddBlock }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Trial Blocks
        </CardTitle>
        <CardDescription>
          Drag blocks to build your experiment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {blockTypes.map((block) => {
          const Icon = block.icon;
          return (
            <Button
              key={block.type}
              variant="outline"
              className="w-full justify-start h-auto py-3"
              onClick={() => onAddBlock(block)}
            >
              <Icon className="h-5 w-5 mr-3" />
              <div className="text-left flex-1">
                <div className="font-medium">{block.name}</div>
                <div className="text-xs text-muted-foreground">
                  {block.description}
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};