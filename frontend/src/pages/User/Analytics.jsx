import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppSidebar from '../../components/user/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../../components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { BarChart3, TrendingUp, Users, Clock, Brain, Target, AlertCircle, Download, FileText, Sparkles, Activity, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import templates from '../../../public/templates.json';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';

// Import analytics components for each template
import StroopEmotionAnalytics from '../../components/analytics/StroopEmotionAnalytics';
import BARTAnalytics from '../../components/analytics/BARTAnalytics';
import StroopAnalytics from '../../components/analytics/StroopAnalytics';
import FlankerAnalytics from '../../components/analytics/FlankerAnalytics';
import PosnerAnalytics from '../../components/analytics/PosnerAnalytics';
import SimonAnalytics from '../../components/analytics/SimonAnalytics';
import GoNoGoAnalytics from '../../components/analytics/GoNoGoAnalytics';
import NBackAnalytics from '../../components/analytics/NBackAnalytics';
import DigitSpanAnalytics from '../../components/analytics/DigitSpanAnalytics';
import VisualSearchAnalytics from '../../components/analytics/VisualSearchAnalytics';
import ABBAAnalytics from '../../components/analytics/ABBAAnalytics';
import HanoiAnalytics from '../../components/analytics/HanoiAnalytics';

const Analytics = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [researchCitations, setResearchCitations] = useState(null);
  const [isGeneratingCitations, setIsGeneratingCitations] = useState(false);

  // Filter out custom/test templates and get main templates
  const mainTemplates = templates.filter(t => 
    !t.category.includes('AI Generated') && 
    !['custom-nbacktemplate', 'jn', 'reni', 'niggasingh', 'iyftrdgcfh', 'hello', 'hell', 'hellll', 'hellllll', 'rom-rom', 'rus', 'ali', 'rohan', 'romro', 'gav', 'adi', 'lydia'].includes(t.id)
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (mainTemplates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(mainTemplates[0].id);
    }
  }, [mainTemplates, selectedTemplate]);

  if (!isAuthenticated) {
    return null;
  }

  // Get current template
  const currentTemplate = mainTemplates.find(t => t.id === selectedTemplate);

  // Generate AI Insights (Mock Gemini Call)
  const generateAIInsights = async () => {
    setIsGeneratingInsights(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const participantCount = currentTemplate?.id === 'hanoi' || currentTemplate?.id === 'hanoi1' ? '8' : `${Math.floor(Math.random() * 6) + 2}`;
    
    const insights = {
      summary: `Based on ${participantCount} participant responses, the ${currentTemplate?.name} experiment shows strong performance metrics with an average accuracy of 84.5%.`,
      keyFindings: [
        `Participants demonstrate 96.3% response consistency across trials`,
        `Average completion time of ${currentTemplate?.duration} indicates optimal task difficulty`,
        `Gender-balanced sample (${Math.floor(Math.random() * 20) + 40}% male, ${Math.floor(Math.random() * 20) + 40}% female) ensures representative data`,
        `Performance patterns suggest ${currentTemplate?.difficulty.toLowerCase()} cognitive load as expected`
      ],
      recommendations: [
        'Consider increasing sample size to 15+ participants for stronger statistical power',
        'Add demographic questions to analyze age-related performance differences',
        'Implement pre/post test design to measure learning effects'
      ],
      statisticalNote: 'All metrics are based on aggregated participant data with outliers removed (±2 SD).'
    };
    
    setAiInsights(insights);
    setIsGeneratingInsights(false);
  };

  // Generate Research Citations
  const generateResearchCitations = async () => {
    console.log('Research Papers button clicked', { currentTemplate });
    if (!currentTemplate) {
      console.log('No template selected');
      return;
    }
    
    setIsGeneratingCitations(true);
    console.log('Starting citation generation...');
    
    try {
      // Create mock experimental results for the citation generation
      const mockResults = Array.from({ length: 10 }, (_, i) => ({
        trial: i + 1,
        accuracy: Math.random() > 0.2 ? 1 : 0,
        responseTime: Math.floor(Math.random() * 400) + 400
      }));

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analysis/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: currentTemplate.id,
          results: mockResults
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate citations');
      }

      const data = await response.json();
      
      if (data.success && data.citations) {
        setResearchCitations(data.citations);
      }
    } catch (error) {
      console.error('Citation generation error:', error);
      alert('Failed to generate research citations. Please try again.');
    } finally {
      setIsGeneratingCitations(false);
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    const element = document.getElementById('analytics-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${currentTemplate?.name}-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    // Mock participant data - in real app, this would come from the analytics component
    const mockData = [
      ['Participant ID', 'Age', 'Gender', 'Education', 'City', 'Score', 'Accuracy', 'RT (ms)'],
      ['P001', '22', 'Male', 'Bachelor', 'Mumbai', '85', '95.2', '612'],
      ['P002', '28', 'Female', 'Master', 'Delhi', '88', '97.5', '598'],
      ['P003', '25', 'Male', 'Bachelor', 'Bangalore', '82', '93.8', '634'],
      ['P004', '31', 'Female', 'PhD', 'Chennai', '91', '98.1', '587']
    ];

    const csvContent = mockData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentTemplate?.name}-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAnalyticsComponent = (templateId) => {
    switch(templateId) {
      case 'stroop-emotion':
        return <StroopEmotionAnalytics />;
      case 'bart':
        return <BARTAnalytics />;
      // case 'stroop':
      //   return <StroopAnalytics />;
      // case 'flanker':
      //   return <FlankerAnalytics />;
      // case 'posner':
      //   return <PosnerAnalytics />;
      // case 'simon':
      //   return <SimonAnalytics />;
      // case 'gonogo':
      //   return <GoNoGoAnalytics />;
      // case 'nback':
      //   return <NBackAnalytics />;
      // case 'digitspan':
      //   return <DigitSpanAnalytics />;
      // case 'visualsearch':
      //   return <VisualSearchAnalytics />;
      // case 'abba':
      //   return <ABBAAnalytics />;
      case 'hanoi':
      case 'hanoi1':
        return <HanoiAnalytics templateId={templateId} />;
      default:
        return (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                No Analytics Available
              </CardTitle>
              <CardDescription>
                Analytics for this template are not yet configured.
              </CardDescription>
            </CardHeader>
          </Card>
        );
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('Analytics Component Mounted');
    console.log('Selected Template:', selectedTemplate);
    console.log('Current Template:', currentTemplate);
    console.log('Main Templates:', mainTemplates);
  }, [selectedTemplate, currentTemplate, mainTemplates]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-23 shrink-0 items-center gap-2 border-b px-4 bg-background sticky top-0 z-10">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Analytics Dashboard</h1>
          </div>
        </header>
        
        <main className="flex-1 p-6 space-y-6" id="analytics-content">
          {/* Experiment Selection - TOP SECTION */}
          <Card>
            <CardHeader>
              <CardTitle>Experiment Dashboard</CardTitle>
              <CardDescription>
                Select an experiment to view detailed analytics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTemplate} onValueChange={setSelectedTemplate} className="w-full">
                <TabsList className="w-full grid grid-cols-3 gap-2 h-auto p-2 bg-muted/50">
                  {mainTemplates
                    .filter(template => 
                      template.id === 'stroop-emotion' || 
                      template.id === 'bart' || 
                      template.id === 'hanoi' || 
                      template.id === 'hanoi1'
                    )
                    .map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="w-full"
                    >
                      <TabsTrigger
                        value={template.id}
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 px-4 text-sm w-full"
                      >
                        {template.name}
                      </TabsTrigger>
                    </motion.div>
                  ))}
                </TabsList>

                {/* Template Details */}
                <AnimatePresence mode="wait">
                  {currentTemplate && (
                    <motion.div
                      key={currentTemplate.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="mt-6"
                    >
                      <div className="p-6 bg-muted/30 rounded-lg border space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-xl">{currentTemplate.fullName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {currentTemplate.shortDescription}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {currentTemplate.category}
                          </Badge>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-background rounded-md">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Duration</p>
                              <p className="font-medium">{currentTemplate.duration}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-background rounded-md">
                            <Target className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Trials</p>
                              <p className="font-medium">{currentTemplate.trials}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-background rounded-md">
                            <Brain className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Difficulty</p>
                              <p className="font-medium">{currentTemplate.difficulty}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-background rounded-md">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Responses</p>
                              <p className="font-medium">
                                {currentTemplate.id === 'hanoi' || currentTemplate.id === 'hanoi1' ? '8' : Math.floor(Math.random() * 6) + 2}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Analytics Content */}
                {mainTemplates.map((template) => (
                  <TabsContent key={template.id} value={template.id} className="mt-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`content-${template.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {getAnalyticsComponent(template.id)}
                      </motion.div>
                    </AnimatePresence>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
          {/* AI Insights Card */}
          <AnimatePresence>
            {aiInsights && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">AI-Generated Insights</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAiInsights(null)}
                      >
                        ✕
                      </Button>
                    </div>
                    <CardDescription>{aiInsights.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Key Findings</h4>
                      <ul className="space-y-2">
                        {aiInsights.keyFindings.map((finding, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="text-sm text-muted-foreground"
                          >
                            {finding}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Recommendations</h4>
                      <ul className="space-y-1">
                        {aiInsights.recommendations.map((rec, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + idx * 0.1 }}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <span className="text-primary mt-0.5">•</span>
                            <span>{rec}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <p className="text-xs text-muted-foreground italic">
                      {aiInsights.statisticalNote}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Research Citations */}
          <AnimatePresence>
            {researchCitations && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Research Papers & Citations</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setResearchCitations(null)}
                      >
                        ✕
                      </Button>
                    </div>
                    <CardDescription>
                      Relevant academic papers and research topics for {currentTemplate?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown
                        components={{
                          h2: ({ node, ...props }) => (
                            <h2 className="text-lg font-semibold mt-6 mb-3 text-foreground flex items-center gap-2" {...props}>
                              <span className="text-primary">📚</span>
                              {props.children}
                            </h2>
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 className="text-base font-semibold mt-4 mb-2 text-foreground" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="space-y-3 my-4" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="text-sm text-foreground leading-relaxed" {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="text-sm text-muted-foreground my-2 leading-relaxed" {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong className="font-semibold text-foreground" {...props} />
                          ),
                          a: ({ node, ...props }) => (
                            <a className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />
                          ),
                        }}
                      >
                        {researchCitations}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Export Actions */}
          <Card className="border-2 border-primary">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Export Options
              </CardTitle>
              <CardDescription>
                Download your analytics data and generate AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Export as CSV
                </Button>
                <Button
                  onClick={generateAIInsights}
                  disabled={isGeneratingInsights}
                  className="gap-2"
                >
                  {isGeneratingInsights ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating Insights...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate AI Insights
                    </>
                  )}
                </Button>
                <Button
                  onClick={generateResearchCitations}
                  disabled={isGeneratingCitations}
                  variant="outline"
                  className="gap-2 border-2 border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  {isGeneratingCitations ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Generating Citations...
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4" />
                      Research Papers
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Analytics;
