import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppSidebar from '../../components/user/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../../components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
// Use Lucide icons (already installed)
import { Users, Calendar, FileText, Rocket, Share2 } from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const experiments = [
    {
      _id: 'exp1',
      title: 'Experiment 1',
      description: 'This is the description of experiment 1',
      participantCount: 10,
      createdAt: '2023-01-01',
      status: 'published',
    },
    {
      _id: 'exp2',
      title: 'Experiment 2',
      description: 'This is the description of experiment 2',
      participantCount: 5,
      createdAt: '2023-01-02',
      status: 'draft',
    },
  ];

  // Dummy publish handler
  const handlePublish = (id) => {
    alert(`Publish experiment ${id} (implement logic)`);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-23 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        </header>
        
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-6">
            <h1 className="text-6xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-2xl text-muted-foreground">
              This is a dashboard
            </p>
            <div className="text-lg text-muted-foreground/80">
              Welcome, {user?.name}
            </div>
          </div>
        </main>
        {experiments.map((exp) => (
          <Card key={exp._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {exp.title}
                    {exp.aiGenerated && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full">
                        AI Generated
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {exp.description || 'No description provided'}
                  </CardDescription>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
              <div className="space-y-3">
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
                        Consent Form
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handlePublish(exp._id)}
                        className="flex-1"
                      >
                        <Rocket className="w-4 h-4 mr-1" />
                        Publish
                      </Button>
                    </>
                  )}
                  
                  {exp.status === 'published' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = `${window.location.origin}/experiment/${exp._id}`;
                        navigator.clipboard.writeText(url);
                        alert('Link copied to clipboard!');
                      }}
                      className="flex-1"
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Copy Link
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;