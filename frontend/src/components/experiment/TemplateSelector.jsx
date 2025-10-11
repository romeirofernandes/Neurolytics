import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BARTTemplate } from './templates/BARTTemplate';
import { StroopTemplate } from './templates/StroopTemplate';
import { PosnerTemplate } from './templates/PosnerTemplate';
import { ABBATemplate } from './templates/ABBATemplate';
import { TowerHanoiTemplate } from './templates/TowerHanoiTemplate';
import { Loader2, ArrowLeft, Brain, Target, Zap, Layers, Puzzle, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
                    doc.text(`${template.fullName}`, margin, yPosition);
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

                    if (results?.analysis) {
                      // Helper function to parse inline markdown formatting
                      const parseInlineMarkdown = (text) => {
                        const segments = [];
                        let remaining = text;
                        
                        // Parse bold (**text**), italic (*text*), and code (`text`)
                        const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
                        let match;
                        let lastIndex = 0;
                        
                        while ((match = pattern.exec(remaining)) !== null) {
                          // Add text before match
                          if (match.index > lastIndex) {
                            segments.push({
                              text: remaining.substring(lastIndex, match.index),
                              style: 'normal'
                            });
                          }
                          
                          const matched = match[0];
                          if (matched.startsWith('**') && matched.endsWith('**')) {
                            // Bold
                            segments.push({
                              text: matched.slice(2, -2),
                              style: 'bold'
                            });
                          } else if (matched.startsWith('*') && matched.endsWith('*') && !matched.startsWith('**')) {
                            // Italic
                            segments.push({
                              text: matched.slice(1, -1),
                              style: 'italic'
                            });
                          } else if (matched.startsWith('`') && matched.endsWith('`')) {
                            // Code
                            segments.push({
                              text: matched.slice(1, -1),
                              style: 'code'
                            });
                          }
                          
                          lastIndex = pattern.lastIndex;
                        }
                        
                        // Add remaining text
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
                              
                              // Check for new page
                              if (currentY > pageHeight - 30) {
                                doc.addPage();
                                currentY = margin;
                              }
                            }
                            
                            doc.text(word, currentX, currentY);
                            currentX += wordWidth;
                          }
                        }
                        
                        // Reset to normal
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(11);
                        doc.setTextColor(55, 65, 81);
                        
                        return currentY + lineHeight + 2;
                      };
                      
                      // Parse and add markdown content
                      const lines = results.analysis.split('\n');
                      
                      for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].trim();
                        
                        // Check if we need a new page
                        if (yPosition > pageHeight - 30) {
                          doc.addPage();
                          yPosition = margin;
                        }

                        // H2 Headers (##)
                        if (line.startsWith('## ')) {
                          yPosition += 5;
                          doc.setFontSize(16);
                          doc.setFont('helvetica', 'bold');
                          doc.setTextColor(30, 64, 175);
                          const text = line.substring(3);
                          doc.text(text, margin, yPosition);
                          yPosition += 8;
                          
                          // Underline
                          doc.setDrawColor(219, 234, 254);
                          doc.setLineWidth(0.5);
                          doc.line(margin, yPosition, pageWidth - margin, yPosition);
                          yPosition += 8;
                        }
                        // H3 Headers (###)
                        else if (line.startsWith('### ')) {
                          yPosition += 4;
                          doc.setFontSize(14);
                          doc.setFont('helvetica', 'bold');
                          doc.setTextColor(30, 64, 175);
                          const text = line.substring(4);
                          doc.text(text, margin, yPosition);
                          yPosition += 7;
                        }
                        // List items
                        else if (line.startsWith('- ') || line.startsWith('* ')) {
                          const text = line.substring(2);
                          doc.setFontSize(11);
                          doc.setFont('helvetica', 'normal');
                          doc.setTextColor(55, 65, 81);
                          doc.text('•', margin + 2, yPosition);
                          yPosition = renderFormattedText(text, margin + 7, yPosition, maxWidth - 7);
                        }
                        // Blockquote
                        else if (line.startsWith('> ')) {
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
                        }
                        // Table detection
                        else if (line.includes('|') && line.trim().length > 0) {
                          // Collect table rows
                          const tableLines = [line];
                          let j = i + 1;
                          while (j < lines.length && lines[j].includes('|')) {
                            tableLines.push(lines[j].trim());
                            j++;
                          }
                          
                          if (tableLines.length > 2) { // Has header, separator, and data
                            // Parse table
                            const headers = tableLines[0].split('|').filter(c => c.trim()).map(c => c.trim());
                            const data = tableLines.slice(2).map(row => 
                              row.split('|').filter(c => c.trim()).map(c => c.trim())
                            );
                            
                            // Draw table using autoTable
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
                            i = j - 1; // Skip processed table lines
                          }
                        }
                        // Regular paragraphs
                        else if (line.length > 0) {
                          yPosition = renderFormattedText(line, margin, yPosition, maxWidth);
                        }
                      }
                    } else {
                      doc.setFontSize(11);
                      doc.setTextColor(102, 102, 102);
                      doc.text('No analysis available.', margin, yPosition);
                    }

                    // Save the PDF
                    doc.save(`${template.id}-results-${Date.now()}.pdf`);
                  } catch (error) {
                    console.error('PDF generation error:', error);
                    alert('Failed to generate PDF. Please try again.');
                  }
                }}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF Report
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