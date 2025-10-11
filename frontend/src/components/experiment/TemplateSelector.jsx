import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Eye, 
  Zap, 
  Users, 
  Clock, 
  Target, 
  ChevronRight,
  Mic,
  Camera,
  Filter,
  Move,
  Hand,
  RefreshCw,
  Hash,
  Search,
  Layers,
  Puzzle,
  MessageSquare,
  Image as ImageIcon,
  List,
  MousePointer,
  CheckCircle2
} from 'lucide-react';

// Import ALL working template components
import StroopTaskTemplate from './templates/StroopTaskTemplate';
import EmotionTracker from './templates/EmotionTracker';
import VoiceCRTTemplate from './templates/VoiceCRTTemplate';
import { ABBATemplate } from './templates/ABBATemplate';
import { BARTTemplate } from './templates/BARTTemplate';
import { DigitSpanTemplate } from './templates/DigitSpanTemplate';
import { FlankerTemplate } from './templates/FlankerTemplate';
import { GoNoGoTemplate } from './templates/GoNoGoTemplate';
import { NBackTemplate } from './templates/NBackTemplate';
import { PosnerTemplate } from './templates/PosnerTemplate';
import { SimonTemplate } from './templates/SimonTemplate';
import { TowerHanoiTemplate } from './templates/TowerHanoiTemplate';
import { VisualSearchTemplate } from './templates/VisualSearchTemplate';

// Placeholder component for templates not yet created
const ComingSoonTemplate = ({ templateName }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle>Coming Soon</CardTitle>
        <CardDescription>{templateName} is under development</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">This template will be available soon. Check back later!</p>
      </CardContent>
    </Card>
  </div>
);

const TemplateSelector = ({ onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates = [
    // Attention Tasks
    {
      id: 'stroop-task',
      name: 'Stroop Task',
      fullName: 'Classic Stroop Color-Word Interference Test',
      description: 'Measure selective attention and cognitive flexibility using color-word interference',
      details: 'Participants identify the ink color of words while ignoring the word meaning. Measures reaction time and accuracy in congruent vs incongruent conditions.',
      duration: '~8 minutes',
      trials: '10 practice + 40 test',
      measures: ['Selective attention', 'Inhibitory control', 'Processing speed', 'Cognitive flexibility'],
      component: StroopTaskTemplate,
      icon: Brain,
      color: 'from-blue-500 to-cyan-500',
      requiresCamera: false,
      category: 'Attention'
    },
    {
      id: 'flanker-task',
      name: 'Flanker Task',
      fullName: 'Eriksen Flanker Task',
      description: 'Assess response inhibition and selective attention with distractor stimuli',
      details: 'Participants respond to a central arrow while ignoring flanking arrows that may be congruent or incongruent.',
      duration: '~6 minutes',
      trials: '8 practice + 32 test',
      measures: ['Response inhibition', 'Selective attention', 'Conflict resolution'],
      component: FlankerTemplate,
      icon: Filter,
      color: 'from-cyan-500 to-teal-500',
      requiresCamera: false,
      category: 'Attention'
    },
    {
      id: 'posner-cueing',
      name: 'Posner Cueing',
      fullName: 'Posner Spatial Cueing Task',
      description: 'Investigate spatial attention and orienting using visual cues',
      details: 'Measures how spatial cues affect reaction time to detect targets in different locations.',
      duration: '~10 minutes',
      trials: '16 practice + 80 test',
      measures: ['Spatial attention', 'Orienting', 'Cue validity effects'],
      component: PosnerTemplate,
      icon: Target,
      color: 'from-teal-500 to-emerald-500',
      requiresCamera: false,
      category: 'Attention'
    },
    {
      id: 'simon-task',
      name: 'Simon Task',
      fullName: 'Simon Spatial Compatibility Task',
      description: 'Measure spatial compatibility effects and response conflict',
      details: 'Participants respond to stimulus color while ignoring irrelevant spatial location.',
      duration: '~7 minutes',
      trials: '10 practice + 60 test',
      measures: ['Spatial compatibility', 'Response conflict', 'Interference control'],
      component: SimonTemplate,
      icon: Move,
      color: 'from-emerald-500 to-green-500',
      requiresCamera: false,
      category: 'Attention'
    },

    // Emotion Tasks
    {
      id: 'emotion-tracker',
      name: 'Emotion Tracker',
      fullName: 'Stroop Task with Real-Time Emotion Recognition',
      description: 'Combines Stroop task with live facial emotion tracking using AI',
      details: 'Performs the classic Stroop task while simultaneously tracking facial expressions using face-api.js. Correlates emotional states with cognitive performance.',
      duration: '~8 minutes',
      trials: '10 practice + 40 test',
      measures: ['Selective attention', 'Emotional responses', 'Stress patterns', 'Performance under emotion'],
      component: EmotionTracker,
      icon: Eye,
      color: 'from-purple-500 to-pink-500',
      requiresCamera: true,
      category: 'Emotion'
    },
    {
      id: 'facial-expression-recognition',
      name: 'Facial Recognition',
      fullName: 'Facial Expression Recognition Task',
      description: 'Assess ability to identify emotional expressions in faces',
      details: 'Participants view images of faces and identify the displayed emotion.',
      duration: '~7 minutes',
      trials: '40 trials',
      measures: ['Emotion recognition', 'Social cognition', 'Face processing'],
      component: (props) => <ComingSoonTemplate templateName="Facial Recognition" {...props} />,
      icon: Camera,
      color: 'from-pink-500 to-rose-500',
      requiresCamera: false,
      category: 'Emotion'
    },
    {
      id: 'emotional-stroop',
      name: 'Emotional Stroop',
      fullName: 'Emotional Stroop Task',
      description: 'Modified Stroop task using emotionally charged words',
      details: 'Measures attentional bias and emotional interference using emotional vs neutral words.',
      duration: '~8 minutes',
      trials: '10 practice + 60 test',
      measures: ['Emotional interference', 'Attentional bias', 'Emotion regulation'],
      component: (props) => <ComingSoonTemplate templateName="Emotional Stroop" {...props} />,
      icon: Brain,
      color: 'from-rose-500 to-orange-500',
      requiresCamera: false,
      category: 'Emotion'
    },

    // Reasoning Tasks
    {
      id: 'voice-crt',
      name: 'Voice CRT',
      fullName: 'Voice-Based Cognitive Reflection Test',
      description: 'Reasoning test using voice responses to measure intuitive vs reflective thinking',
      details: 'Participants answer classic cognitive reflection questions using voice input. The Web Speech API converts speech to text, measuring both accuracy and response time to assess analytical reasoning.',
      duration: '~5 minutes',
      trials: '3 questions',
      measures: ['Analytical reasoning', 'Response inhibition', 'Voice fluency', 'Reaction time'],
      component: VoiceCRTTemplate,
      icon: Mic,
      color: 'from-rose-500 to-pink-500',
      requiresCamera: false,
      category: 'Reasoning'
    },
    {
      id: 'ravens-matrices',
      name: "Raven's Matrices",
      fullName: "Raven's Progressive Matrices",
      description: 'Non-verbal intelligence test using abstract visual patterns',
      details: 'Participants complete patterns to assess abstract reasoning and fluid intelligence.',
      duration: '~15 minutes',
      trials: '12-36 items',
      measures: ['Fluid intelligence', 'Pattern recognition', 'Abstract reasoning'],
      component: (props) => <ComingSoonTemplate templateName="Raven's Matrices" {...props} />,
      icon: Puzzle,
      color: 'from-violet-500 to-purple-500',
      requiresCamera: false,
      category: 'Reasoning'
    },
    {
      id: 'tower-of-hanoi',
      name: 'Tower of Hanoi',
      fullName: 'Tower of Hanoi Problem Solving Task',
      description: 'Classic problem-solving task measuring planning and executive function',
      details: 'Participants move disks between pegs following specific rules to reach a goal state.',
      duration: '~10 minutes',
      trials: '5-10 problems',
      measures: ['Planning', 'Problem solving', 'Executive function', 'Working memory'],
      component: TowerHanoiTemplate,
      icon: Layers,
      color: 'from-indigo-500 to-blue-500',
      requiresCamera: false,
      category: 'Reasoning'
    },

    // Memory Tasks
    {
      id: 'n-back',
      name: 'N-Back Task',
      fullName: 'N-Back Working Memory Task',
      description: 'Measure working memory capacity using continuous performance',
      details: 'Participants monitor a sequence and indicate when the current item matches one from N steps back.',
      duration: '~10 minutes',
      trials: '1-back, 2-back blocks',
      measures: ['Working memory', 'Updating', 'Sustained attention'],
      component: NBackTemplate,
      icon: RefreshCw,
      color: 'from-blue-500 to-indigo-500',
      requiresCamera: false,
      category: 'Memory'
    },
    {
      id: 'digit-span',
      name: 'Digit Span',
      fullName: 'Digit Span Task',
      description: 'Test working memory capacity with digit sequences',
      details: 'Participants recall sequences of digits in forward or backward order.',
      duration: '~5 minutes',
      trials: 'Adaptive length',
      measures: ['Working memory span', 'Short-term memory', 'Attention'],
      component: DigitSpanTemplate,
      icon: Hash,
      color: 'from-indigo-500 to-violet-500',
      requiresCamera: false,
      category: 'Memory'
    },
    {
      id: 'spatial-memory',
      name: 'Spatial Memory',
      fullName: 'Spatial Memory Grid Task',
      description: 'Assess visuospatial working memory using grid locations',
      details: 'Participants remember and reproduce sequences of highlighted grid positions.',
      duration: '~8 minutes',
      trials: 'Adaptive difficulty',
      measures: ['Spatial working memory', 'Visual memory', 'Pattern memory'],
      component: (props) => <ComingSoonTemplate templateName="Spatial Memory" {...props} />,
      icon: Move,
      color: 'from-violet-500 to-fuchsia-500',
      requiresCamera: false,
      category: 'Memory'
    },

    // Perception Tasks
    {
      id: 'visual-search',
      name: 'Visual Search',
      fullName: 'Visual Search Task',
      description: 'Measure visual attention and search efficiency',
      details: 'Participants locate target items among distractors with varying set sizes.',
      duration: '~8 minutes',
      trials: '60 trials',
      measures: ['Visual attention', 'Search efficiency', 'Feature integration'],
      component: VisualSearchTemplate,
      icon: Search,
      color: 'from-emerald-500 to-green-500',
      requiresCamera: false,
      category: 'Perception'
    },
    {
      id: 'change-detection',
      name: 'Change Detection',
      fullName: 'Change Detection Task',
      description: 'Assess visual working memory through change detection',
      details: 'Participants detect whether visual displays have changed after a brief delay.',
      duration: '~10 minutes',
      trials: '80 trials',
      measures: ['Visual working memory', 'Change detection', 'Visual attention'],
      component: (props) => <ComingSoonTemplate templateName="Change Detection" {...props} />,
      icon: Eye,
      color: 'from-green-500 to-lime-500',
      requiresCamera: false,
      category: 'Perception'
    },
    {
      id: 'mental-rotation',
      name: 'Mental Rotation',
      fullName: 'Mental Rotation Task',
      description: 'Measure spatial visualization and mental rotation ability',
      details: 'Participants determine if rotated 3D objects are the same or mirror images.',
      duration: '~12 minutes',
      trials: '20-40 trials',
      measures: ['Spatial reasoning', 'Mental rotation', 'Visual processing'],
      component: (props) => <ComingSoonTemplate templateName="Mental Rotation" {...props} />,
      icon: RefreshCw,
      color: 'from-lime-500 to-yellow-500',
      requiresCamera: false,
      category: 'Perception'
    },

    // Response Time Tasks
    {
      id: 'simple-rt',
      name: 'Simple RT',
      fullName: 'Simple Reaction Time Task',
      description: 'Measure basic reaction time to a single stimulus',
      details: 'Participants press a key as quickly as possible when a stimulus appears.',
      duration: '~3 minutes',
      trials: '30 trials',
      measures: ['Processing speed', 'Motor response', 'Alertness'],
      component: (props) => <ComingSoonTemplate templateName="Simple RT" {...props} />,
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      requiresCamera: false,
      category: 'Response Time'
    },
    {
      id: 'choice-rt',
      name: 'Choice RT',
      fullName: 'Choice Reaction Time Task',
      description: 'Measure decision-making speed with multiple response options',
      details: 'Participants make quick decisions between 2 or more response alternatives.',
      duration: '~5 minutes',
      trials: '60 trials',
      measures: ['Decision speed', 'Response selection', 'Processing speed'],
      component: (props) => <ComingSoonTemplate templateName="Choice RT" {...props} />,
      icon: Hand,
      color: 'from-orange-500 to-red-500',
      requiresCamera: false,
      category: 'Response Time'
    },
    {
      id: 'go-nogo',
      name: 'Go/No-Go',
      fullName: 'Go/No-Go Task',
      description: 'Assess response inhibition and impulse control',
      details: 'Participants respond to "go" trials but withhold responses on "no-go" trials.',
      duration: '~7 minutes',
      trials: '120 trials (80% go, 20% no-go)',
      measures: ['Response inhibition', 'Impulse control', 'Sustained attention'],
      component: GoNoGoTemplate,
      icon: Hand,
      color: 'from-red-500 to-pink-500',
      requiresCamera: false,
      category: 'Response Time'
    },

    // Decision Making Tasks
    {
      id: 'bart',
      name: 'BART',
      fullName: 'Balloon Analogue Risk Task',
      description: 'Assess risk-taking behavior and decision-making under uncertainty',
      details: 'Participants inflate virtual balloons to earn money, balancing risk and reward.',
      duration: '~10 minutes',
      trials: '30 balloons',
      measures: ['Risk taking', 'Decision making', 'Reward sensitivity', 'Impulse control'],
      component: BARTTemplate,
      icon: Target,
      color: 'from-pink-500 to-red-500',
      requiresCamera: false,
      category: 'Decision Making'
    },
    {
      id: 'abba',
      name: 'ABBA Task',
      fullName: 'Approach-Avoidance Conflict Task',
      description: 'Measure approach and avoidance tendencies in decision making',
      details: 'Participants make choices involving conflicting approach and avoidance motivations.',
      duration: '~8 minutes',
      trials: '40 trials',
      measures: ['Approach behavior', 'Avoidance behavior', 'Conflict resolution', 'Decision making'],
      component: ABBATemplate,
      icon: Move,
      color: 'from-amber-500 to-orange-500',
      requiresCamera: false,
      category: 'Decision Making'
    },

    // Questionnaires
    {
      id: 'big-five',
      name: 'Big Five',
      fullName: 'Big Five Personality Inventory',
      description: 'Assess personality traits across five major dimensions',
      details: 'Measures openness, conscientiousness, extraversion, agreeableness, and neuroticism.',
      duration: '~10 minutes',
      trials: '44 items',
      measures: ['Personality traits', 'Individual differences'],
      component: (props) => <ComingSoonTemplate templateName="Big Five" {...props} />,
      icon: Users,
      color: 'from-fuchsia-500 to-purple-500',
      requiresCamera: false,
      category: 'Questionnaires'
    },
    {
      id: 'cognitive-reflection',
      name: 'CRT',
      fullName: 'Cognitive Reflection Test',
      description: 'Measure analytical thinking vs intuitive responses',
      details: 'Classic questions designed to elicit intuitive but incorrect answers.',
      duration: '~5 minutes',
      trials: '3-7 questions',
      measures: ['Analytical thinking', 'Cognitive reflection', 'Decision making'],
      component: (props) => <ComingSoonTemplate templateName="CRT" {...props} />,
      icon: Brain,
      color: 'from-purple-500 to-indigo-500',
      requiresCamera: false,
      category: 'Questionnaires'
    },
    {
      id: 'survey-likert',
      name: 'Likert Survey',
      fullName: 'Custom Likert Scale Survey',
      description: 'Create custom surveys with Likert scale responses',
      details: 'Flexible survey builder for attitudes, opinions, and ratings.',
      duration: 'Variable',
      trials: 'Custom',
      measures: ['Attitudes', 'Opinions', 'Self-report'],
      component: (props) => <ComingSoonTemplate templateName="Likert Survey" {...props} />,
      icon: List,
      color: 'from-sky-500 to-blue-500',
      requiresCamera: false,
      category: 'Questionnaires'
    },
  ];

  const categories = [
    { id: 'all', name: 'All Templates', icon: Target },
    { id: 'Attention', name: 'Attention', icon: Filter },
    { id: 'Emotion', name: 'Emotion', icon: Eye },
    { id: 'Reasoning', name: 'Reasoning', icon: Puzzle },
    { id: 'Memory', name: 'Memory', icon: RefreshCw },
    { id: 'Perception', name: 'Perception', icon: Search },
    { id: 'Response Time', name: 'Response Time', icon: Zap },
    { id: 'Decision Making', name: 'Decision Making', icon: Target },
    { id: 'Questionnaires', name: 'Questionnaires', icon: List },
  ];

  // List of all working template IDs
  const workingTemplateIds = [
    'stroop-task',
    'emotion-tracker',
    'voice-crt',
    'flanker-task',
    'posner-cueing',
    'simon-task',
    'n-back',
    'digit-span',
    'visual-search',
    'go-nogo',
    'tower-of-hanoi',
    'bart',
    'abba'
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  // Count ready templates
  const readyCount = templates.filter(t => workingTemplateIds.includes(t.id)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Experiment Templates
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose from our comprehensive library of validated cognitive experiments
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              {readyCount} Ready to Use
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3 text-blue-600" />
              {templates.length - readyCount} Coming Soon
            </Badge>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => {
            const Icon = category.icon;
            const count = templates.filter(t => t.category === category.name).length;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {category.name}
                {category.id !== 'all' && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            const isReady = workingTemplateIds.includes(template.id);
            
            return (
              <Card 
                key={template.id} 
                className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 overflow-hidden ${!isReady ? 'opacity-75' : ''}`}
              >
                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${template.color}`} />
                
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${template.color} text-white shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2">
                      {template.requiresCamera && (
                        <Badge variant="secondary" className="gap-1">
                          <Camera className="w-3 h-3" />
                          Camera
                        </Badge>
                      )}
                      {!isReady && (
                        <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300">
                          Coming Soon
                        </Badge>
                      )}
                      {isReady && (
                        <Badge variant="outline" className="gap-1 text-green-600 border-green-300">
                          ✓ Ready
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{template.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Target className="w-4 h-4" />
                      <span>{template.trials}</span>
                    </div>
                  </div>

                  {/* Measures */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Measures
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.measures.slice(0, 3).map((measure, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {measure}
                        </Badge>
                      ))}
                      {template.measures.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.measures.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    onClick={() => onSelectTemplate(template)}
                    className="w-full group-hover:shadow-md transition-shadow gap-2"
                    disabled={!isReady}
                  >
                    {isReady ? 'Select Template' : 'Coming Soon'}
                    {isReady && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <div className="text-muted-foreground space-y-2">
              <Target className="w-16 h-16 mx-auto opacity-50" />
              <p className="text-xl font-medium">No templates found</p>
              <p className="text-sm">Try selecting a different category</p>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                Need a custom template?
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Contact our team to create a custom experiment tailored to your research needs. 
                We support various cognitive tasks, questionnaires, and interactive paradigms. More templates coming soon!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;