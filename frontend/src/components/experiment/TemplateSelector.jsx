import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BARTTemplate } from './templates/BARTTemplate';
import { StroopTemplate } from './templates/StroopTemplate';
import { PosnerTemplate } from './templates/PosnerTemplate';
import { ABBATemplate } from './templates/ABBATemplate';
import { TowerHanoiTemplate } from './templates/TowerHanoiTemplate';
import { Loader2, ArrowLeft, Brain, Target, Zap, Layers, Puzzle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const templates = [
  {
    id: 'bart',
    name: 'BART',
    fullName: 'Balloon Analogue Risk Task',
    description: 'Measures risk-taking behavior and decision-making under uncertainty',
    details: 'Participants pump up virtual balloons to earn money. Each pump increases earnings but also explosion risk. Used to assess risk propensity in clinical and behavioral research.',
    duration: '~15 minutes',
    trials: '90 trials (3 training)',
    measures: ['Risk-taking propensity', 'Reward sensitivity', 'Decision-making strategy'],
    component: BARTTemplate,
    icon: Brain,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'stroop',
    name: 'Stroop Task',
    fullName: 'Stroop Color-Word Task',
    description: 'Measures selective attention, processing speed, and cognitive control',
    details: 'Classic cognitive interference task where participants identify the color of words while ignoring their meaning. Demonstrates automatic processing and executive function.',
    duration: '~8 minutes',
    trials: '40 trials (10 training)',
    measures: ['Selective attention', 'Response inhibition', 'Processing speed', 'Stroop effect magnitude'],
    component: StroopTemplate,
    icon: Target,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'posner',
    name: 'Posner Cueing',
    fullName: 'Posner Spatial Cueing Task',
    description: 'Assesses spatial attention orienting and visual processing',
    details: 'Participants respond to targets appearing in cued or uncued locations. Measures the cost and benefit of spatial attention shifting, fundamental to understanding attentional mechanisms.',
    duration: '~12 minutes',
    trials: '100 trials',
    measures: ['Spatial attention', 'Cueing effects', 'Attentional orienting', 'Response time benefits'],
    component: PosnerTemplate,
    icon: Zap,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'abba',
    name: 'ABBA Task',
    fullName: 'Action-Based Backward Activation',
    description: 'Examines action planning and response compatibility effects',
    details: 'Tests the reversed-compatibility effect where participants plan one response and execute another. Critical for understanding motor planning and cognitive control interactions.',
    duration: '~10 minutes',
    trials: '100 trials',
    measures: ['Action planning', 'Response compatibility', 'Motor control', 'Cognitive flexibility'],
    component: ABBATemplate,
    icon: Layers,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'hanoi',
    name: 'Tower of Hanoi',
    fullName: 'Tower of Hanoi Puzzle',
    description: 'Evaluates planning, problem-solving, and executive function',
    details: 'Classic problem-solving task requiring participants to move discs between pegs following specific rules. Assesses planning ability, working memory, and strategic thinking.',
    duration: '~5 minutes',
    trials: '1 puzzle (3 discs)',
    measures: ['Planning ability', 'Problem-solving efficiency', 'Working memory', 'Strategic thinking'],
    component: TowerHanoiTemplate,
    icon: Puzzle,
    color: 'from-red-500 to-rose-500'
  }
];

export const TemplateSelector = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleComplete = async (data) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analysis/analyze`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplate,
          results: data
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const analysisData = await response.json();
      
      if (analysisData.success) {
        setResults({ rawData: data, analysis: analysisData.analysis });
        setShowResults(true);
      } else {
        throw new Error(analysisData.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message);
      setResults({ rawData: data, analysis: null });
      setShowResults(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBack = () => {
    setSelectedTemplate(null);
    setShowResults(false);
    setResults(null);
    setError(null);
  };

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h3 className="text-lg font-semibold">Analyzing Results...</h3>
              <p className="text-sm text-muted-foreground text-center">
                Our AI is processing your experiment data and generating insights.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const template = templates.find(t => t.id === selectedTemplate);
    
    return (
      <div className="space-y-6">
        <Button onClick={handleBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Templates
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <template.icon className="h-6 w-6" />
              {template.fullName} - Results
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of your performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  Error during analysis: {error}. Showing raw data only.
                </AlertDescription>
              </Alert>
            )}

            {results?.analysis ? (
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: results.analysis }} />
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold">Raw Data</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs">
                  {JSON.stringify(results?.rawData, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex gap-4">
              <Button onClick={handleBack} className="flex-1">
                Try Another Experiment
              </Button>
              <Button 
                onClick={() => {
                  const dataStr = JSON.stringify(results, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${template.id}-results-${Date.now()}.json`;
                  link.click();
                }}
                variant="outline"
              >
                Download Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedTemplate) {
    const Template = templates.find(t => t.id === selectedTemplate)?.component;
    return (
      <div className="space-y-6">
        <Button onClick={handleBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Templates
        </Button>
        {Template && <Template onComplete={handleComplete} />}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => {
        const Icon = template.icon;
        return (
          <Card 
            key={template.id} 
            className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer overflow-hidden"
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className={`h-2 bg-gradient-to-r ${template.color}`} />
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${template.color} text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>{template.duration}</div>
                  <div>{template.trials}</div>
                </div>
              </div>
              <div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {template.fullName}
                </CardTitle>
                <CardDescription className="mt-2 line-clamp-2">
                  {template.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {template.details}
              </p>
              
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                  Measures
                </h4>
                <div className="flex flex-wrap gap-1">
                  {template.measures.map((measure, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full"
                    >
                      {measure}
                    </span>
                  ))}
                </div>
              </div>

              <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                Start Experiment
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};