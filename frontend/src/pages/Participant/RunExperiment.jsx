import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useParticipant } from '../../context/ParticipantContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Loader2 } from 'lucide-react';
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaSpinner, FaChartLine, FaDownload, FaBrain, FaCamera } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import templatesData from '../../../public/templates.json';
import ConsentDisplay from '../../components/experiment/ConsentDisplay';
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
  
  // Consent form states
  const [consentForm, setConsentForm] = useState(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [loadingConsent, setLoadingConsent] = useState(true);
  const [consentError, setConsentError] = useState(null);

  useEffect(() => {
    const loadTemplate = async () => {
      setLoading(true);
      setLoadError(null);

      // Find template in templates.json
      const foundTemplate = templatesData.find(t => t.id === templateId);
      
      // Only proceed if template exists AND has a researcher (actual experiment, not base template)
      if (!foundTemplate) {
        setLoadError('Template not found');
        setLoading(false);
        return;
      }
      
      if (!foundTemplate.researcher) {
        setLoadError('This is a base template and cannot be run directly. Please contact a researcher to create an experiment based on this template.');
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

  // Fetch consent form for this experiment
  useEffect(() => {
    const fetchConsentForm = async () => {
      setLoadingConsent(true);
      setConsentError(null);
      
      try {
        // Convert template ID to lowercase as the experiment ID
        const experimentId = templateId.toLowerCase();
        
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/consent-forms/experiment/${experimentId}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.consentForm) {
            setConsentForm(data.consentForm);
          } else {
            setConsentError('No consent form found for this experiment');
          }
        } else if (response.status === 404) {
          setConsentError('No consent form has been created for this experiment yet');
        } else {
          setConsentError('Failed to load consent form');
        }
      } catch (error) {
        console.error('Error fetching consent form:', error);
        setConsentError('Error loading consent form');
      } finally {
        setLoadingConsent(false);
      }
    };

    if (templateId) {
      fetchConsentForm();
    }
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

  // Handle participant consent
  const handleConsent = async () => {
    try {
      // Record consent in the database
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/consent-forms/${consentForm._id}/consent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId: participant?.mongoId || 'anonymous',
            experimentId: templateId.toLowerCase(),
            ipAddress: 'client-ip', // Would be captured on backend
            userAgent: navigator.userAgent,
            consentGiven: true,
            consentTimestamp: new Date().toISOString()
          })
        }
      );

      // Mark consent as given and allow experiment to proceed
      setHasConsented(true);
    } catch (error) {
      console.error('Error recording consent:', error);
      alert('Failed to record consent. Please try again.');
    }
  };

  // Handle participant declining consent
  const handleDecline = () => {
    if (window.confirm('Are you sure you do not want to participate? You will be returned to the explore page.')) {
      navigate('/participant/explore');
    }
  };

  const downloadResults = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 26, 26);
      doc.text(`${template.name}`, margin, yPosition);
      yPosition += 10;
      
      doc.setFontSize(16);
      doc.text('Experiment Results', margin, yPosition);
      yPosition += 15;

      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(102, 102, 102);
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 15;

      // Add a line separator
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      if (aiAnalysis) {
        // Helper function to parse inline markdown formatting
        const parseInlineMarkdown = (text) => {
          const segments = [];
          let remaining = text;
          
          const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
          let match;
          let lastIndex = 0;
          
          while ((match = pattern.exec(remaining)) !== null) {
            if (match.index > lastIndex) {
              segments.push({
                text: remaining.substring(lastIndex, match.index),
                style: 'normal'
              });
            }
            
            const matched = match[0];
            if (matched.startsWith('**') && matched.endsWith('**')) {
              segments.push({
                text: matched.slice(2, -2),
                style: 'bold'
              });
            } else if (matched.startsWith('*') && matched.endsWith('*') && !matched.startsWith('**')) {
              segments.push({
                text: matched.slice(1, -1),
                style: 'italic'
              });
            } else if (matched.startsWith('`') && matched.endsWith('`')) {
              segments.push({
                text: matched.slice(1, -1),
                style: 'code'
              });
            }
            
            lastIndex = pattern.lastIndex;
          }
          
          if (lastIndex < remaining.length) {
            segments.push({
              text: remaining.substring(lastIndex),
              style: 'normal'
            });
          }
          
          return segments;
        };
        
        // Helper function to render text with formatting
        const renderFormattedText = (text, x, y, maxW) => {
          const segments = parseInlineMarkdown(text);
          let currentX = x;
          const lineHeight = 6;
          let currentY = y;
          
          for (const segment of segments) {
            if (segment.style === 'bold') {
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(26, 26, 26);
            } else if (segment.style === 'italic') {
              doc.setFont('helvetica', 'italic');
              doc.setTextColor(55, 65, 81);
            } else if (segment.style === 'code') {
              doc.setFont('courier', 'normal');
              doc.setFontSize(10);
              doc.setTextColor(79, 70, 229);
            } else {
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(11);
              doc.setTextColor(55, 65, 81);
            }
            
            const words = segment.text.split(' ');
            for (let w = 0; w < words.length; w++) {
              const word = words[w] + (w < words.length - 1 ? ' ' : '');
              const wordWidth = doc.getTextWidth(word);
              
              if (currentX + wordWidth > x + maxW) {
                currentY += lineHeight;
                currentX = x;
                
                if (currentY > pageHeight - 30) {
                  doc.addPage();
                  currentY = margin;
                }
              }
              
              doc.text(word, currentX, currentY);
              currentX += wordWidth;
            }
          }
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(55, 65, 81);
          
          return currentY + lineHeight + 2;
        };
        
        const lines = aiAnalysis.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = margin;
          }

          if (line.startsWith('## ')) {
            yPosition += 5;
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 64, 175);
            const text = line.substring(3);
            doc.text(text, margin, yPosition);
            yPosition += 8;
            
            doc.setDrawColor(219, 234, 254);
            doc.setLineWidth(0.5);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 8;
          } else if (line.startsWith('### ')) {
            yPosition += 4;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 64, 175);
            const text = line.substring(4);
            doc.text(text, margin, yPosition);
            yPosition += 7;
          } else if (line.startsWith('- ') || line.startsWith('* ')) {
            const text = line.substring(2);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(55, 65, 81);
            doc.text('•', margin + 2, yPosition);
            yPosition = renderFormattedText(text, margin + 7, yPosition, maxWidth - 7);
          } else if (line.startsWith('> ')) {
            yPosition += 2;
            doc.setDrawColor(59, 130, 246);
            doc.setLineWidth(2);
            doc.line(margin, yPosition - 3, margin, yPosition + 8);
            
            const text = line.substring(2);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(75, 85, 99);
            yPosition = renderFormattedText(text, margin + 6, yPosition, maxWidth - 6);
            yPosition += 2;
          } else if (line.includes('|') && line.trim().length > 0) {
            const tableLines = [line];
            let j = i + 1;
            while (j < lines.length && lines[j].includes('|')) {
              tableLines.push(lines[j].trim());
              j++;
            }
            
            if (tableLines.length > 2) {
              const headers = tableLines[0].split('|').filter(c => c.trim()).map(c => c.trim());
              const data = tableLines.slice(2).map(row => 
                row.split('|').filter(c => c.trim()).map(c => c.trim())
              );
              
              autoTable(doc, {
                startY: yPosition,
                head: [headers],
                body: data,
                theme: 'grid',
                headStyles: { 
                  fillColor: [249, 250, 251],
                  textColor: [26, 26, 26],
                  fontStyle: 'bold',
                  lineWidth: 0.1,
                  lineColor: [209, 213, 219]
                },
                bodyStyles: {
                  textColor: [55, 65, 81],
                  lineWidth: 0.1,
                  lineColor: [209, 213, 219]
                },
                margin: { left: margin, right: margin },
                styles: { fontSize: 10 }
              });
              
              yPosition = doc.lastAutoTable.finalY + 10;
              i = j - 1;
            }
          } else if (line.length > 0) {
            yPosition = renderFormattedText(line, margin, yPosition, maxWidth);
          }
        }
      } else {
        doc.setFontSize(11);
        doc.setTextColor(102, 102, 102);
        doc.text('No analysis available.', margin, yPosition);
      }

      doc.save(`${templateId}-results-${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Loading state
  if (loading || loadingConsent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <FaSpinner className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">
                {loading ? 'Loading experiment...' : 'Loading consent form...'}
              </p>
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
          <FaExclamationCircle className="h-4 w-4" />
          <AlertDescription>
            {loadError || 'Experiment template not found.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Consent form error state
  if (consentError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 space-y-4">
            <Alert variant="destructive">
              <FaExclamationCircle className="h-4 w-4" />
              <AlertDescription>
                {consentError}
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground text-center">
              This experiment cannot proceed without a consent form. Please contact the researcher.
            </p>
            <div className="flex justify-center">
              <Button onClick={() => navigate('/participant/explore')}>
                <FaArrowLeft className="mr-2 h-4 w-4" />
                Back to Explore
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show consent form if participant hasn't consented yet
  if (consentForm && !hasConsented) {
    return (
      <ConsentDisplay
        consentForm={consentForm}
        onConsent={handleConsent}
        onDecline={handleDecline}
      />
    );
  }

  // Show completion screen with AI analysis
  if (experimentComplete) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-4xl space-y-6">
          {/* Success Header */}
          <Card className="border-2 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/10">
                  <FaCheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">
                    Experiment Complete!
                  </h2>
                  <p className="text-muted-foreground mt-1">
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
                  <FaSpinner className="h-12 w-12 animate-spin text-primary mb-4" />
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
                  <FaChartLine className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold">AI Performance Analysis</h3>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3 text-foreground border-b pb-2 border-border" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground" {...props} />,
                      h4: ({ node, ...props }) => <h4 className="text-base font-semibold mt-3 mb-2 text-foreground" {...props} />,
                      p: ({ node, ...props }) => <p className="my-3 text-muted-foreground leading-relaxed" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-3 space-y-1 text-muted-foreground" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-3 space-y-1 text-muted-foreground" {...props} />,
                      li: ({ node, ...props }) => <li className="text-muted-foreground" {...props} />,
                      table: ({ node, ...props }) => (
                        <div className="my-4 overflow-x-auto">
                          <table className="min-w-full border-collapse border border-border rounded-lg" {...props} />
                        </div>
                      ),
                      thead: ({ node, ...props }) => <thead className="bg-muted" {...props} />,
                      tbody: ({ node, ...props }) => <tbody className="divide-y divide-border" {...props} />,
                      tr: ({ node, ...props }) => <tr className="hover:bg-muted/50 transition-colors" {...props} />,
                      th: ({ node, ...props }) => <th className="border border-border px-4 py-2 text-left font-semibold text-foreground" {...props} />,
                      td: ({ node, ...props }) => <td className="border border-border px-4 py-2 text-muted-foreground" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-foreground" {...props} />,
                      em: ({ node, ...props }) => <em className="italic text-foreground" {...props} />,
                      code: ({ node, inline, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-lg my-4"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props}>
                            {children}
                          </code>
                        );
                      },
                      pre: ({ node, children, ...props }) => (
                        <pre className="bg-muted p-4 rounded-lg my-4 overflow-x-auto text-sm font-mono" {...props}>
                          {children}
                        </pre>
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 italic bg-muted/30 rounded-r-lg text-foreground/80" {...props} />
                      ),
                      a: ({ node, ...props }) => (
                        <a className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />
                      ),
                      hr: ({ node, ...props }) => <hr className="my-6 border-border" {...props} />,
                      img: ({ node, ...props }) => <img className="rounded-lg my-4 max-w-full h-auto" {...props} />,
                    }}
                  >
                    {aiAnalysis}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ) : analysisError ? (
            <Alert variant="destructive">
              <FaExclamationCircle className="h-4 w-4" />
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
                  <FaArrowLeft className="mr-2 h-4 w-4" />
                  Back to Explore
                </Button>
                <Button onClick={handleRetry} variant="outline">
                  <FaCheckCircle className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={downloadResults} variant="outline">
                  <FaDownload className="mr-2 h-4 w-4" />
                  Download Results
                </Button>
                {aiAnalysis && !analyzingResults && !analysisError && (
                  <Button 
                    onClick={() => analyzeResults(experimentResults)} 
                    variant="outline"
                  >
                    <FaChartLine className="mr-2 h-4 w-4" />
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
            <FaExclamationCircle className="h-4 w-4" />
            <AlertDescription>
              This experiment template is not yet available.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <TemplateComponent onComplete={handleExperimentComplete} />
      </div>
    );
  }

  // Show start screen
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <FaBrain className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">{template.name}</h2>
            <p className="text-muted-foreground">{template.fullName}</p>
          </div>

          {template.requiresCamera && (
            <Alert>
              <FaCamera className="h-4 w-4" />
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
                <FaCheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                <span>Ensure you're in a quiet environment without distractions</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                <span>The experiment will take approximately {template.duration}</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                <span>You will complete {template.trials}</span>
              </li>
              {template.requiresCamera && (
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Position yourself clearly in front of the camera</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <FaCheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
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
              <FaArrowLeft className="mr-2 h-4 w-4" />
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
