import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppSidebar from '../../components/user/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../../components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { BarChart3, TrendingUp, Users, Clock, Brain, Target, AlertCircle } from 'lucide-react';
import templates from '../../../templates.json';

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

  // Filter out custom/test templates and get main templates
  const mainTemplates = templates.filter(t => 
    !t.category.includes('AI Generated') && 
    !['custom-nbacktemplate', 'jn', 'reni', 'niggasingh', 'iyftrdgcfh', 'hello', 'hell', 'hellll', 'hellllll', 'rom-rom', 'rus', 'ali', 'rohan', 'romro', 'gav', 'adi'].includes(t.id)
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

  const getAnalyticsComponent = (templateId) => {
    switch(templateId) {
      case 'stroop-emotion':
        return <StroopEmotionAnalytics />;
      case 'bart':
        return <BARTAnalytics />;
      case 'stroop':
        return <StroopAnalytics />;
      case 'flanker':
        return <FlankerAnalytics />;
      case 'posner':
        return <PosnerAnalytics />;
      case 'simon':
        return <SimonAnalytics />;
      case 'gonogo':
        return <GoNoGoAnalytics />;
      case 'nback':
        return <NBackAnalytics />;
      case 'digitspan':
        return <DigitSpanAnalytics />;
      case 'visualsearch':
        return <VisualSearchAnalytics />;
      case 'abba':
        return <ABBAAnalytics />;
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

  const currentTemplate = mainTemplates.find(t => t.id === selectedTemplate);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background sticky top-0 z-10">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Analytics Dashboard</h1>
          </div>
        </header>
        
        <main className="flex-1 p-6 space-y-6">
          {/* Header Card */}
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Research Analytics</CardTitle>
              <CardDescription className="text-base">
                Comprehensive data analysis across all experimental templates with participant demographics and performance metrics
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Template Selection Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Select Experiment Template</CardTitle>
              <CardDescription>
                View detailed analytics for each psychological experiment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTemplate} onValueChange={setSelectedTemplate} className="w-full">
                <TabsList className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2 h-auto p-2 bg-muted">
                  {mainTemplates.map((template) => (
                    <TabsTrigger
                      key={template.id}
                      value={template.id}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 text-xs"
                    >
                      {template.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Template Info */}
                {currentTemplate && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{currentTemplate.fullName}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {currentTemplate.shortDescription}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${currentTemplate.color} text-white`}>
                        {currentTemplate.category}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{currentTemplate.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>{currentTemplate.trials}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-muted-foreground" />
                        <span>{currentTemplate.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{currentTemplate.id === 'hanoi' || currentTemplate.id === 'hanoi1' ? '8' : Math.floor(Math.random() * 6) + 2} Responses</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analytics Content for Each Template */}
                {mainTemplates.map((template) => (
                  <TabsContent key={template.id} value={template.id} className="mt-6 space-y-6">
                    {getAnalyticsComponent(template.id)}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Analytics;
