import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useParticipant } from '../../context/ParticipantContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { MarkdownRenderer } from '../../components/ui/MarkdownRenderer';
import { 
  ArrowLeft, CheckCircle, AlertCircle, Loader2, 
  TrendingUp, Download, Share2 
} from 'lucide-react';
import templatesData from '../../../templates.json';
import { BARTTemplate } from '../../components/experiment/templates/BARTTemplate';
import { StroopTemplate } from '../../components/experiment/templates/StroopTemplate';
import { PosnerTemplate } from '../../components/experiment/templates/PosnerTemplate';
import { ABBATemplate } from '../../components/experiment/templates/ABBATemplate';
import { TowerHanoiTemplate } from '../../components/experiment/templates/TowerHanoiTemplate';
import { HanoiTowerTemplate } from '../../components/experiment/templates/Tile5HanoiTemplate';
import { FlankerTemplate } from '../../components/experiment/templates/FlankerTemplate';
import { GoNoGoTemplate } from '../../components/experiment/templates/GoNoGoTemplate';
import { NBackTemplate } from '../../components/experiment/templates/NBackTemplate';
import { SimonTemplate } from '../../components/experiment/templates/SimonTemplate';
import { DigitSpanTemplate } from '../../components/experiment/templates/DigitSpanTemplate';
import { VisualSearchTemplate } from '../../components/experiment/templates/VisualSearchTemplate';
import EmotionTracker from '../../components/experiment/templates/EmotionTracker';

// Base template component mapping
const baseTemplateComponents = {
  'bart': BARTTemplate,
  'stroop': StroopTemplate,
  'posner': PosnerTemplate,
  'abba': ABBATemplate,
  'hanoi': HanoiTowerTemplate,  // Maps to Tile5HanoiTemplate (5 disks)
  'hanoi1': TowerHanoiTemplate,  // Original 3-disk version
  'flanker': FlankerTemplate,
  'gonogo': GoNoGoTemplate,
  'nback': NBackTemplate,
  'simon': SimonTemplate,
  'digitspan': DigitSpanTemplate,
  'visualsearch': VisualSearchTemplate,
  'stroop-emotion': EmotionTracker
};

/**
 * Dynamically load component for AI-generated templates
 */
const loadDynamicComponent = async (templateId) => {
  try {
    // Try to find the template in templates.json
    const template = templatesData.find(t => t.id === templateId);
    if (!template) {
      console.error('Template not found in templates.json:', templateId);
      return null;
    }

    // Generate component name from template ID
    const componentName = templateId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Template';

    console.log('Attempting to load component:', componentName);

    // Try to dynamically import the component
    const module = await import(`../../components/experiment/templates/${componentName}.jsx`);
    
    // Try to find the component in multiple ways:
    // 1. Named export matching the expected name
    // 2. Default export
    // 3. Any named export (for incorrectly named components)
    if (module[componentName]) {
      return module[componentName];
    } else if (module.default) {
      return module.default;
    } else {
      // Get first named export if exists
      const exports = Object.keys(module).filter(key => key !== 'default' && key !== '__esModule');
      if (exports.length > 0) {
        console.warn(`Component ${componentName} not found, using ${exports[0]} instead`);
        return module[exports[0]];
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to load dynamic component:', error);
    return null;
  }
};

const RunExperiment = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { participant } = useParticipant();
  const [template, setTemplate] = useState(null);
  const [experimentStarted, setExperimentStarted] = useState(false);
  const [experimentComplete, setExperimentComplete] = useState(false);
  const [experimentResults, setExperimentResults] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzingResults, setAnalyzingResults] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [TemplateComponent, setTemplateComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const loadTemplate = async () => {
      setLoading(true);
      setLoadError(null);

      // Find template in templates.json
      const foundTemplate = templatesData.find(t => t.id === templateId);
      if (!foundTemplate) {
        setLoadError('Template not found');
        setLoading(false);
        return;
      }
      setTemplate(foundTemplate);

      // Try to load from base components first
      if (baseTemplateComponents[templateId]) {
        setTemplateComponent(() => baseTemplateComponents[templateId]);
        setLoading(false);
        return;
      }

      // Try to dynamically load AI-generated component
      const dynamicComponent = await loadDynamicComponent(templateId);
      if (dynamicComponent) {
        setTemplateComponent(() => dynamicComponent);
        setLoading(false);
        return;
      }

      setLoadError('Component not found');
      setLoading(false);
    };

    loadTemplate();
  }, [templateId]);

  const handleExperimentComplete = async (results) => {
    console.log('Experiment completed with results:', results);
    setExperimentResults(results);
    setExperimentComplete(true);
    
    // Automatically start AI analysis
    await analyzeResults(results);
  };

  const analyzeResults = async (results) => {
    setAnalyzingResults(true);
    setAnalysisError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analysis/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: templateId,
          results: results
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze results');
      }

      const data = await response.json();
      setAiAnalysis(data.analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisError(error.message);
    } finally {
      setAnalyzingResults(false);
    }
  };

  const handleRetry = () => {
    setExperimentStarted(false);
    setExperimentComplete(false);
    setExperimentResults(null);
    setAiAnalysis(null);
    setAnalysisError(null);
  };

  const downloadResults = () => {
    const dataStr = JSON.stringify(experimentResults, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${templateId}_results_${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading experiment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (loadError || !template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {loadError || 'Experiment template not found.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show completion screen with AI analysis
  if (experimentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto p-6 max-w-4xl space-y-6">
          {/* Success Header */}
          <Card className="border-2 border-green-500/20 bg-green-50/50 dark:bg-green-900/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/10">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">
                    Experiment Complete!
                  </h2>
                  <p className="text-green-700 dark:text-green-300 mt-1">
                    Thank you for participating in the {template.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Section */}
          {analyzingResults ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analyzing Your Results</h3>
                  <p className="text-muted-foreground text-sm text-center">
                    Our AI is processing your performance data...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : aiAnalysis ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold">AI Performance Analysis</h3>
                </div>
                <MarkdownRenderer content={aiAnalysis} />
              </CardContent>
            </Card>
          ) : analysisError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to generate AI analysis: {analysisError}
              </AlertDescription>
            </Alert>
          ) : null}

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => navigate('/participant/explore')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Explore
                </Button>
                <Button onClick={handleRetry} variant="outline">
                  Try Again
                </Button>
                <Button onClick={downloadResults} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Results
                </Button>
                {aiAnalysis && !analyzingResults && !analysisError && (
                  <Button 
                    onClick={() => analyzeResults(experimentResults)} 
                    variant="outline"
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Re-analyze
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show experiment runner
  if (experimentStarted) {
    if (!TemplateComponent) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This experiment template is not yet available.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <TemplateComponent onComplete={handleExperimentComplete} />
      </div>
    );
  }

  // Show start screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">{template.name}</h2>
            <p className="text-muted-foreground">{template.fullName}</p>
          </div>

          {template.requiresCamera && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This experiment requires camera access for facial emotion tracking. 
                Please allow camera access when prompted.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold">Before you begin:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                <span>Ensure you're in a quiet environment without distractions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                <span>The experiment will take approximately {template.duration}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                <span>You will complete {template.trials}</span>
              </li>
              {template.requiresCamera && (
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Position yourself clearly in front of the camera</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                <span>Your results will be analyzed by AI upon completion</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={() => navigate('/participant/explore')}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={() => setExperimentStarted(true)}
              className="flex-1"
              size="lg"
            >
              Start Experiment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RunExperiment;
