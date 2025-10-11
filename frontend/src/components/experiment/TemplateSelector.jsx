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
  Mic
} from 'lucide-react';

// Import template components
import StroopTaskTemplate from './templates/StroopTaskTemplate';
import EmotionTracker from './templates/EmotionTracker';
import VoiceCRTTemplate from './templates/VoiceCRTTemplate';

const TemplateSelector = ({ onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates = [
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
  ];

  const categories = [
    { id: 'all', name: 'All Templates', icon: Target },
    { id: 'Attention', name: 'Attention', icon: Brain },
    { id: 'Emotion', name: 'Emotion', icon: Eye },
    { id: 'Reasoning', name: 'Reasoning', icon: Zap },
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Experiment Templates
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose from our pre-built validated experiments or create your own custom template
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card 
                key={template.id} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 overflow-hidden"
              >
                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${template.color}`} />
                
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${template.color} text-white shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {template.requiresCamera && (
                      <Badge variant="secondary" className="gap-1">
                        <Eye className="w-3 h-3" />
                        Camera
                      </Badge>
                    )}
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
                  >
                    Select Template
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                We support various cognitive tasks, questionnaires, and interactive paradigms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;