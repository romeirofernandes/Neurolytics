import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import templatesData from '../../../public/templates.json';

// Import all template components
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
  'hanoi': HanoiTowerTemplate,  // 5-disk version
  'hanoi1': TowerHanoiTemplate,  // 3-disk version
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

/**
 * Preview Experiment - Public route for previewing experiments
 * No authentication required - used for iframe previews
 */
const PreviewExperiment = () => {
  const { templateId } = useParams();
  const [template, setTemplate] = useState(null);
  const [experimentResults, setExperimentResults] = useState(null);
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

  const handleExperimentComplete = (results) => {
    console.log('Preview - Experiment completed:', results);
    setExperimentResults(results);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading experiment template...</p>
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
            {loadError || `Template not found: ${templateId}`}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show completion screen
  if (experimentResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-green-600">✅ Preview Complete!</h2>
              <p className="text-muted-foreground">
                This is a preview. Results are not saved.
              </p>
              <details className="text-left">
                <summary className="cursor-pointer font-medium">View Results</summary>
                <pre className="mt-4 bg-muted p-4 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(experimentResults, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Run the experiment
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
      <div className="container mx-auto p-4">
        <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Preview Mode:</strong> This is a preview. Results will not be saved.
        </div>
        <TemplateComponent onComplete={handleExperimentComplete} />
      </div>
    </div>
  );
};

export default PreviewExperiment;
