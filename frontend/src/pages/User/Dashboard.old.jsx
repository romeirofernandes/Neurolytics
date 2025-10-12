import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppSidebar from '../../components/user/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../../components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Users, 
  Calendar, 
  FileText, 
  Rocket, 
  Share2, 
  Loader2,
  AlertCircle,
  Sparkles,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    totalParticipants: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchExperiments();
    }
  }, [isAuthenticated, navigate, user]);

  const fetchExperiments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/experiments/researcher/${user.mongoId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const exps = data.experiments || [];
          setExperiments(exps);
          
          // Calculate stats
          setStats({
            total: exps.length,
            published: exps.filter(e => e.status === 'published').length,
            draft: exps.filter(e => e.status === 'draft').length,
            totalParticipants: exps.reduce((sum, e) => sum + (e.participantCount || 0), 0)
          });
        }
      }
    } catch (error) {
      console.error('Error fetching experiments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (experimentId) => {
    const experiment = experiments.find(e => e._id === experimentId);
    
    if (!experiment.hasConsentForm) {
      alert('⚠️ Cannot publish: Please create a consent form first');
      navigate(`/user/consent-form-builder/${experimentId}`);
      return;
    }

    if (!confirm('Are you sure you want to publish this experiment?')) {
      return;
    }

    setPublishing(experimentId);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/experiments/${experimentId}/publish`,
        { method: 'POST' }
      );

      const data = await response.json();

      if (data.success) {
        alert('✅ Experiment published successfully!');
        fetchExperiments(); // Refresh list
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error('Publish error:', error);
      alert('Failed to publish experiment');
    } finally {
      setPublishing(null);
    }
  };

  const handleCopyLink = (experimentId) => {
    const url = `${window.location.origin}/experiment/${experimentId}`;
    navigator.clipboard.writeText(url);
    alert('📋 Link copied to clipboard!');
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading experiments...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-23 shrink-0 items-center justify-between gap-2 border-b px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            </div>
          </div>

          <Button onClick={() => navigate('/user/ai-experiment-builder')} className="gap-2">
            <Sparkles className="w-4 h-4" />
            New AI Experiment
          </Button>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Experiments</CardDescription>
                  <CardTitle className="text-3xl">{stats.total}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    All time
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Published</CardDescription>
                  <CardTitle className="text-3xl text-green-600">{stats.published}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3" />
                    Live experiments
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Drafts</CardDescription>
                  <CardTitle className="text-3xl text-amber-600">{stats.draft}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    In progress
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Participants</CardDescription>
                  <CardTitle className="text-3xl text-blue-600">{stats.totalParticipants}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    Across all experiments
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Experiments Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Your Experiments</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage and monitor your research experiments
                </p>
              </div>
            </div>

            {/* Experiments List */}
            {experiments.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No experiments yet</h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-md">
                    Get started by creating your first experiment using our AI-powered builder
                  </p>
                  <Button onClick={() => navigate('/user/ai-experiment-builder')} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create First Experiment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {experiments.map((exp) => (
                  <Card key={exp._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            {exp.title}
                            {exp.aiGenerated && (
                              <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                AI
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-2 line-clamp-2">
                            {exp.description || 'No description provided'}
                          </CardDescription>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                          exp.status === 'published' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : exp.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {exp.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Experiment Info */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{exp.participantCount || 0} participants</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(exp.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Consent Form Status */}
                        {exp.status === 'draft' && (
                          <div className={`flex items-center gap-2 text-xs p-2 rounded-lg ${
                            exp.hasConsentForm 
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                          }`}>
                            {exp.hasConsentForm ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Consent form ready</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4" />
                                <span>Consent form required to publish</span>
                              </>
                            )}
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          {exp.status === 'draft' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/user/consent-form-builder/${exp._id}`)}
                                className="flex-1"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                {exp.hasConsentForm ? 'Edit' : 'Create'} Consent
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handlePublish(exp._id)}
                                disabled={publishing === exp._id || !exp.hasConsentForm}
                                className="flex-1"
                              >
                                {publishing === exp._id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    Publishing...
                                  </>
                                ) : (
                                  <>
                                    <Rocket className="w-4 h-4 mr-1" />
                                    Publish
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                          
                          {exp.status === 'published' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyLink(exp._id)}
                                className="flex-1"
                              >
                                <Share2 className="w-4 h-4 mr-1" />
                                Copy Link
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/user/results/${exp._id}`)}
                                className="flex-1"
                              >
                                <TrendingUp className="w-4 h-4 mr-1" />
                                View Results
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;