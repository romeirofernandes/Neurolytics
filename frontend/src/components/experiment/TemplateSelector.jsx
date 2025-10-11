import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BARTTemplate } from './templates/BARTTemplate';
import { StroopTemplate } from './templates/StroopTemplate';
import { PosnerTemplate } from './templates/PosnerTemplate';
import { ABBATemplate } from './templates/ABBATemplate';
import { TowerHanoiTemplate } from './templates/TowerHanoiTemplate';
import { FlankerTemplate } from './templates/FlankerTemplate';
import { GoNoGoTemplate } from './templates/GoNoGoTemplate';
import { NBackTemplate } from './templates/NBackTemplate';
import { SimonTemplate } from './templates/SimonTemplate';
import { DigitSpanTemplate } from './templates/DigitSpanTemplate';
import { VisualSearchTemplate } from './templates/VisualSearchTemplate';
import { Loader2, ArrowLeft, Brain, Target, Zap, Layers, Puzzle, Filter, Hand, RefreshCw, Move, Hash, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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
    id: 'flanker',
    name: 'Flanker Task',
    fullName: 'Eriksen Flanker Task',
    description: 'Measures selective attention and response inhibition',
    details: 'Participants respond to a central target letter while ignoring flanking distractors. Compatible and incompatible trials reveal cognitive control mechanisms.',
    duration: '~10 minutes',
    trials: '50 trials (10 training)',
    measures: ['Selective attention', 'Cognitive control', 'Interference suppression', 'Flanker effect'],
    component: FlankerTemplate,
    icon: Filter,
    color: 'from-orange-500 to-red-500'
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
    id: 'simon',
    name: 'Simon Task',
    fullName: 'Simon Stimulus-Response Compatibility',
    description: 'Measures stimulus-response compatibility and spatial attention',
    details: 'Respond to word meaning while ignoring spatial position. Compatible vs incompatible spatial mapping reveals automatic processing of irrelevant location information.',
    duration: '~8 minutes',
    trials: '60 trials (10 training)',
    measures: ['S-R compatibility', 'Spatial interference', 'Automatic processing', 'Simon effect'],
    component: SimonTemplate,
    icon: Move,
    color: 'from-teal-500 to-cyan-500'
  },
  {
    id: 'gonogo',
    name: 'Go/No-Go',
    fullName: 'Go/No-Go Inhibition Task',
    description: 'Measures response inhibition and impulse control',
    details: 'Respond quickly to frequent Go signals but withhold responses to rare No-Go signals. Assesses inhibitory control critical for self-regulation.',
    duration: '~7 minutes',
    trials: '60 trials',
    measures: ['Response inhibition', 'Impulse control', 'Commission errors', 'Reaction time'],
    component: GoNoGoTemplate,
    icon: Hand,
    color: 'from-rose-500 to-pink-500'
  },
  {
    id: 'nback',
    name: 'N-Back (2-Back)',
    fullName: '2-Back Working Memory Task',
    description: 'Measures working memory capacity and updating',
    details: 'Monitor a sequence of letters and respond when the current letter matches one shown 2 positions back. Classic working memory paradigm used in cognitive training.',
    duration: '~12 minutes',
    trials: '75 trials (3 blocks)',
    measures: ['Working memory', 'Updating ability', 'Sustained attention', 'Executive function'],
    component: NBackTemplate,
    icon: RefreshCw,
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 'digitspan',
    name: 'Digit Span',
    fullName: 'Digit Span Memory Test',
    description: 'Measures short-term memory capacity',
    details: 'Remember and recall increasingly long sequences of digits. Classic measure of memory span, typically 7±2 digits for adults.',
    duration: '~5 minutes',
    trials: 'Adaptive (until 2 errors)',
    measures: ['Short-term memory', 'Memory span', 'Recall accuracy', 'Sequential processing'],
    component: DigitSpanTemplate,
    icon: Hash,
    color: 'from-emerald-500 to-green-500'
  },
  {
    id: 'visualsearch',
    name: 'Visual Search',
    fullName: 'Conjunction Visual Search',
    description: 'Measures visual attention and search efficiency',
    details: 'Find an orange upright T among rotated Ts and colored Ts. Search time increases with set size, revealing serial vs parallel processing.',
    duration: '~10 minutes',
    trials: '50 trials (5 training)',
    measures: ['Visual attention', 'Search slopes', 'Feature integration', 'Processing efficiency'],
    component: VisualSearchTemplate,
    icon: Search,
    color: 'from-indigo-500 to-blue-500'
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
              <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:pb-2 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-base prose-p:leading-7 prose-li:text-base prose-table:text-sm prose-th:bg-muted prose-th:p-3 prose-td:p-3 prose-strong:text-foreground prose-strong:font-semibold">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-border text-foreground" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground" {...props} />,
                    p: ({node, ...props}) => <p className="text-base leading-7 mb-4 text-foreground/90" {...props} />,
                    ul: ({node, ...props}) => <ul className="my-4 ml-6 list-disc space-y-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="my-4 ml-6 list-decimal space-y-2" {...props} />,
                    li: ({node, ...props}) => <li className="text-base text-foreground/90" {...props} />,
                    table: ({node, ...props}) => (
                      <div className="my-6 overflow-x-auto">
                        <table className="w-full border-collapse border border-border rounded-lg overflow-hidden" {...props} />
                      </div>
                    ),
                    thead: ({node, ...props}) => <thead className="bg-muted" {...props} />,
                    th: ({node, ...props}) => <th className="border border-border p-3 text-left font-semibold text-foreground" {...props} />,
                    td: ({node, ...props}) => <td className="border border-border p-3 text-foreground/90" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                    em: ({node, ...props}) => <em className="italic text-foreground/80" {...props} />,
                    code: ({node, inline, ...props}) => 
                      inline 
                        ? <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                        : <code className="block bg-muted p-4 rounded-lg my-4 overflow-x-auto text-sm font-mono" {...props} />,
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-foreground/80" {...props} />
                    ),
                  }}
                >
                  {results.analysis}
                </ReactMarkdown>
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