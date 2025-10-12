import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar';
import ParticipantSidebar from '../../components/participant/ParticipantSidebar';
import { useParticipant } from '../../context/ParticipantContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  CheckCircle2,
  Trash2,
  FlaskConical,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  Eye
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

const ParticipatedExperiments = () => {
  const { participant } = useParticipant();
  const [templates, setTemplates] = useState([]);
  const [participatedExperiments, setParticipatedExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [experimentToDelete, setExperimentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load templates.json and filter participated experiments
  useEffect(() => {
    const loadParticipatedExperiments = async () => {
      try {
        setLoading(true);
        
        // Fetch templates.json
        const response = await fetch('/templates.json');
        if (!response.ok) {
          throw new Error('Failed to load templates');
        }
        
        const templatesData = await response.json();
        setTemplates(templatesData);
        
        // Filter templates where participant is in contributors array
        if (participant?.id) {
          const participated = templatesData.filter(template => 
            template.contributors && 
            template.contributors.includes(participant.id)
          );
          setParticipatedExperiments(participated);
        }
      } catch (error) {
        console.error('Error loading participated experiments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (participant) {
      loadParticipatedExperiments();
    }
  }, [participant]);

  const handleDeleteClick = (experiment) => {
    setExperimentToDelete(experiment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!experimentToDelete || !participant?.id) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/visual-builder/remove-contributor`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: experimentToDelete.id,
            participantId: participant.id
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to remove participation');
      }

      const data = await response.json();
      console.log('✅ Removed from contributors:', data);

      // Update local state
      setParticipatedExperiments(prev => 
        prev.filter(exp => exp.id !== experimentToDelete.id)
      );

      setDeleteDialogOpen(false);
      setExperimentToDelete(null);
    } catch (error) {
      console.error('Error removing participation:', error);
      alert('Failed to remove participation. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <ParticipantSidebar />
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <ParticipantSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden" />
                <div>
                  <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    Participated Experiments
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Research studies you have completed
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Participated
                  </CardTitle>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {participatedExperiments.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Experiments completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Contribution Points
                  </CardTitle>
                  <FlaskConical className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {participatedExperiments.length * 10}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Research contribution score
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Time Invested
                  </CardTitle>
                  <Clock className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {participatedExperiments.length * 15}m
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Estimated total time
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Removing your participation will delete your contribution record from the experiment. 
                This action cannot be undone, but you can participate again if needed.
              </AlertDescription>
            </Alert>

            {/* Participated Experiments List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Completed Experiments</CardTitle>
                <CardDescription>
                  Experiments you have participated in and contributed data to
                </CardDescription>
              </CardHeader>
              <CardContent>
                {participatedExperiments.length > 0 ? (
                  <div className="space-y-4">
                    {participatedExperiments.map((experiment) => (
                      <Card key={experiment.id} className="border-2 hover:border-primary/50 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              {/* Title and Badge */}
                              <div className="flex items-start gap-3">
                                <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-lg font-semibold">{experiment.name}</h3>
                                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                                      Completed
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {experiment.shortDescription}
                                  </p>
                                </div>
                              </div>

                              {/* Metadata */}
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <FlaskConical className="h-4 w-4" />
                                  <span className="font-medium">{experiment.category || 'Research'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{experiment.duration || '~15 minutes'}</span>
                                </div>
                                {experiment.updatedAt && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Last updated: {new Date(experiment.updatedAt).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>

                              {/* Template ID */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground">Template ID:</span>
                                <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                  {experiment.id}
                                </code>
                              </div>

                              {/* Contributors count */}
                              {experiment.contributors && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Total Contributors:
                                  </span>
                                  <Badge variant="secondary">
                                    {experiment.contributors.length} participant{experiment.contributors.length !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => window.open(`/run-experiment/${experiment.id}`, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2"
                                onClick={() => handleDeleteClick(experiment)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <FlaskConical className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">No participated experiments yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-2 mb-4">
                      Start contributing to research by participating in available experiments
                    </p>
                    <Button 
                      className="gap-2"
                      onClick={() => window.location.href = '/participant/experiments'}
                    >
                      <FlaskConical className="h-4 w-4" />
                      Browse Experiments
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Remove Participation?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to remove your participation from <strong>{experimentToDelete?.name}</strong>?
              </p>
              <p className="text-sm">
                This will:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>Remove your participant ID from the contributors list</li>
                <li>Delete your contribution record for this experiment</li>
                <li>Cannot be undone (but you can participate again)</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Participation
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default ParticipatedExperiments;
