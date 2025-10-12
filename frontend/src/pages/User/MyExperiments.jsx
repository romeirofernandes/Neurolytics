import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppSidebar from '../../components/user/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../../components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  Loader2,
  Sparkles,
  Search,
  Calendar,
  Users,
  Eye,
  Trash2,
  Edit,
  FileText,
  Clock,
  TrendingUp,
  Copy,
  ExternalLink
} from 'lucide-react';
import templatesData from '../../../templates.json';

const MyExperiments = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [myExperiments, setMyExperiments] = useState([]);
  const [filteredExperiments, setFilteredExperiments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      loadMyExperiments();
    }
  }, [isAuthenticated, navigate, user]);

  useEffect(() => {
    // Filter experiments based on search query
    if (searchQuery.trim() === '') {
      setFilteredExperiments(myExperiments);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = myExperiments.filter(exp => 
        exp.name.toLowerCase().includes(query) ||
        exp.fullName.toLowerCase().includes(query) ||
        exp.shortDescription.toLowerCase().includes(query) ||
        exp.category.toLowerCase().includes(query)
      );
      setFilteredExperiments(filtered);
    }
  }, [searchQuery, myExperiments]);

  const loadMyExperiments = () => {
    setLoading(true);
    
    // Filter templates to show only those created by the current researcher
    const userExperiments = templatesData.filter(template => {
      // Check if template has researcher info and matches current user
      if (template.researcher && template.researcher.id === user?.uid) {
        return true;
      }
      // Also check by email as fallback
      if (template.researcher && template.researcher.email === user?.email) {
        return true;
      }
      return false;
    });

    setMyExperiments(userExperiments);
    setFilteredExperiments(userExperiments);

    // Calculate stats
    // For now, we'll consider all custom experiments as published
    // You can extend this with actual status from backend
    setStats({
      total: userExperiments.length,
      published: userExperiments.length,
      draft: 0
    });
    
    setLoading(false);
  };

  const handleViewExperiment = (experimentId) => {
    // Navigate to experiment preview or detail page
    navigate(`/preview/${experimentId}`);
  };

  const handleEditExperiment = (experimentId) => {
    // Navigate to experiment builder with this experiment loaded
    navigate(`/experiment-builder?id=${experimentId}`);
  };

  const handleDuplicateExperiment = (experiment) => {
    // TODO: Implement duplication logic
    console.log('Duplicate experiment:', experiment);
    // This would typically create a copy of the experiment with a new ID
  };

  const handleDeleteExperiment = (experimentId) => {
    // TODO: Implement deletion with confirmation
    if (window.confirm('Are you sure you want to delete this experiment?')) {
      console.log('Delete experiment:', experimentId);
      // This would typically call an API to delete the experiment
      // Then reload the experiments list
    }
  };

  const handleViewResults = (experimentId) => {
    // Navigate to analytics/results page for this experiment
    navigate(`/analytics?experiment=${experimentId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
              <p className="text-muted-foreground">Loading your experiments...</p>
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
        <header className="sticky top-0 z-10 flex h-23 shrink-0 items-center justify-between gap-2 border-b px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">My Experiments</h1>
              <p className="text-xs text-muted-foreground">Manage your custom experiments</p>
            </div>
          </div>

          <Button onClick={() => navigate('/ai-experiment-builder')} className="gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Create New</span>
            <span className="sm:hidden">New</span>
          </Button>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs">Total Experiments</CardDescription>
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl">{stats.total}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    <span>Created by you</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs">Published</CardDescription>
                    <Sparkles className="w-4 h-4 text-success" />
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl text-success">{stats.published}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ExternalLink className="w-3 h-3" />
                    <span>Live experiments</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs">Drafts</CardDescription>
                    <Clock className="w-4 h-4 text-warning" />
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl text-warning">{stats.draft}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Edit className="w-3 h-3" />
                    <span>In progress</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search Bar */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search your experiments by name, category, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Experiments List */}
            {filteredExperiments.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">
                      {myExperiments.length === 0 ? 'No experiments yet' : 'No experiments found'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {myExperiments.length === 0 
                        ? 'Create your first custom experiment using our AI-powered builder'
                        : 'Try adjusting your search query'
                      }
                    </p>
                    {myExperiments.length === 0 && (
                      <Button onClick={() => navigate('/ai-experiment-builder')} className="gap-2">
                        <Sparkles className="w-4 h-4" />
                        Create Your First Experiment
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredExperiments.map((experiment) => (
                  <Card key={experiment.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">{experiment.name}</CardTitle>
                            <Badge variant="secondary" className="gap-1">
                              <Sparkles className="w-3 h-3" />
                              {experiment.category}
                            </Badge>
                          </div>
                          <CardDescription className="text-sm">
                            {experiment.fullName}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Description */}
                      <p className="text-sm text-muted-foreground">
                        {experiment.shortDescription}
                      </p>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {experiment.createdAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Created: {formatDate(experiment.createdAt)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{experiment.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>{experiment.trials}</span>
                        </div>
                      </div>

                      {/* Researcher Info */}
                      {experiment.researcher && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs font-medium mb-1">Researcher Details</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>
                              <span className="font-medium">Name:</span> {experiment.researcher.name}
                            </div>
                            <div>
                              <span className="font-medium">Institution:</span> {experiment.researcher.institution}
                            </div>
                            <div>
                              <span className="font-medium">Field:</span> {experiment.researcher.fieldOfStudy}
                            </div>
                            {experiment.researcher.orcId && (
                              <div>
                                <span className="font-medium">ORCID:</span> {experiment.researcher.orcId}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          onClick={() => handleViewExperiment(experiment.id)}
                          variant="default"
                          size="sm"
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </Button>
                        
                        <Button
                          onClick={() => handleViewResults(experiment.id)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Users className="w-4 h-4" />
                          View Results
                        </Button>
                        
                        <Button
                          onClick={() => handleEditExperiment(experiment.id)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        
                        <Button
                          onClick={() => handleDuplicateExperiment(experiment)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate
                        </Button>
                        
                        <Button
                          onClick={() => handleDeleteExperiment(experiment.id)}
                          variant="outline"
                          size="sm"
                          className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
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

export default MyExperiments;
