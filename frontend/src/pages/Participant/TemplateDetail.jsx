import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar';
import ParticipantSidebar from '../../components/participant/ParticipantSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Brain, Target, Zap, Layers, Puzzle, Filter, Hand, 
  RefreshCw, Move, Hash, Search, Camera, Clock, Award,
  ArrowLeft, Play, CheckCircle, AlertCircle, BookOpen,
  Users, TrendingUp, FileText
} from 'lucide-react';
import templatesData from '../../../templates.json';

// Icon mapping
const iconMap = {
  Brain, Target, Zap, Layers, Puzzle, Filter, Hand,
  RefreshCw, Move, Hash, Search, Camera
};

const TemplateDetail = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    const foundTemplate = templatesData.find(t => t.id === templateId);
    if (foundTemplate) {
      setTemplate(foundTemplate);
    }
  }, [templateId]);

  if (!template) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <ParticipantSidebar />
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Experiment template not found. Please return to the explore page.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => navigate('/participant/explore')} 
                className="mt-4"
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Explore
              </Button>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const Icon = iconMap[template.icon] || Brain;

  const getDifficultyColor = (difficulty) => {
    switch(difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  const handleStartExperiment = () => {
    // Navigate to experiment runner with template ID
    navigate(`/participant/run-experiment/${template.id}`);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <ParticipantSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 space-y-6 max-w-5xl">
            {/* Back Button */}
            <Button 
              onClick={() => navigate('/participant/explore')} 
              variant="ghost"
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Explore
            </Button>

            {/* Header Card */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${template.color} text-white`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <CardTitle className="text-3xl">{template.name}</CardTitle>
                      <Badge 
                        variant="outline" 
                        className={getDifficultyColor(template.difficulty)}
                      >
                        {template.difficulty}
                      </Badge>
                      {template.requiresCamera && (
                        <Badge variant="secondary">
                          <Camera className="h-3 w-3 mr-1" />
                          Camera Required
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-base">
                      {template.fullName}
                    </CardDescription>
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{template.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <span>{template.trials}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{template.category}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="lg"
                    onClick={handleStartExperiment}
                    className="whitespace-nowrap"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Start Experiment
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Camera Warning */}
            {template.requiresCamera && (
              <Alert>
                <Camera className="h-4 w-4" />
                <AlertDescription>
                  This experiment requires camera access for facial emotion tracking. 
                  You will be prompted to allow camera access when you start.
                </AlertDescription>
              </Alert>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  About This Experiment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-muted-foreground whitespace-pre-line">
                    {template.detailedDescription}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* What We Measure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  What We Measure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {template.measures.map((measure, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
                    >
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{measure}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Research Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Research Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {template.researchAreas.map((area, index) => (
                    <Badge key={index} variant="secondary">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Keywords */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {template.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Publications */}
            {template.publications && template.publications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Key Publications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {template.publications.map((pub, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {pub}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Start Button at Bottom */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Ready to participate?</h3>
                    <p className="text-sm text-muted-foreground">
                      The experiment will take approximately {template.duration}
                    </p>
                  </div>
                  <Button 
                    size="lg"
                    onClick={handleStartExperiment}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Start Experiment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default TemplateDetail;
