import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppSidebar from '../../components/user/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../../components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Users, 
  FileText, 
  Rocket, 
  Loader2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Bell,
  Activity,
  BarChart3,
  Zap
} from 'lucide-react';
import templatesData from '../../../public/templates.json';
import CryptoSponsor from '../../components/user/CryptoSponsor';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    totalParticipants: 4
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      loadDashboardData();
    }
  }, [isAuthenticated, navigate]);

  const loadDashboardData = () => {
    setLoading(true);
    
    // Calculate stats from templates
    const publishedCount = Math.floor(templatesData.length * 0.4);
    const draftCount = templatesData.length - publishedCount;
    const totalParticipants = 4;
    
    setStats({
      total: templatesData.length,
      published: publishedCount,
      draft: draftCount,
      totalParticipants: totalParticipants
    });

    // Generate recent activity
    setRecentActivity([
      {
        id: 1,
        type: 'publish',
        title: 'Stroop Task published',
        description: '12 participants completed',
        time: '2 hours ago',
        icon: Rocket,
        color: 'text-success'
      },
      {
        id: 2,
        type: 'consent',
        title: 'Consent form created',
        description: 'BART experiment',
        time: '5 hours ago',
        icon: FileText,
        color: 'text-info'
      },
      {
        id: 3,
        type: 'participant',
        title: 'New participants',
        description: '8 new completions today',
        time: '1 day ago',
        icon: Users,
        color: 'text-chart-4'
      },
      
    ]);

    // Generate notifications
    setNotifications([
      {
        id: 1,
        type: 'warning',
        message: '3 draft experiments need consent forms',
        action: 'Create consent forms',
        actionLink: '/consent-form/create'
      },
      {
        id: 2,
        type: 'info',
        message: 'Tower of Hanoi has 15 new participants',
        action: 'View results',
        actionLink: '/results/hanoi'
      },
      {
        id: 3,
        type: 'success',
        message: 'Your experiments have reached 200+ participants!',
        action: null
      }
    ]);
    
    setLoading(false);
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
              <p className="text-muted-foreground">Loading dashboard...</p>
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
              <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            </div>
          </div>

          <Button onClick={() => navigate('/ai-experiment-builder')} className="gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">New AI Experiment</span>
            <span className="sm:hidden">New</span>
          </Button>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="text-foreground rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Hello, {user?.name}! 👋
              </h2>
              <p className="opacity-90 text-sm sm:text-base">
                Here's what's happening with your research today
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs">Total Templates</CardDescription>
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl">{stats.total}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    <span>Available</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs">Research Areas</CardDescription>
                    <Sparkles className="w-4 h-4 text-chart-4" />
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl text-chart-4">8</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="w-3 h-3" />
                    <span>Active studies</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs">Total Participants</CardDescription>
                    <Users className="w-4 h-4 text-info" />
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl text-info">{stats.totalParticipants}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Activity className="w-3 h-3" />
                    <span>Engaged</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notifications and Blockchain Sponsorship */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Notifications */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notifications
                    </CardTitle>
                    <Badge variant="secondary">{notifications.length}</Badge>
                  </div>
                  <CardDescription>Important updates and alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`p-3 rounded-lg border ${
                        notif.type === 'warning' 
                          ? 'bg-warning/10 border-warning/20'
                          : notif.type === 'success'
                          ? 'bg-success/10 border-success/20'
                          : 'bg-info/10 border-info/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium break-words">{notif.message}</p>
                          {notif.action && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-auto p-0 mt-1"
                              onClick={() => navigate(notif.actionLink)}
                            >
                              {notif.action} →
                            </Button>
                          )}
                        </div>
                        {notif.type === 'warning' && <AlertCircle className="w-4 h-4 text-warning shrink-0" />}
                        {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-success shrink-0" />}
                        {notif.type === 'info' && <Zap className="w-4 h-4 text-info shrink-0" />}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Blockchain Sponsorship */}
              <Card>
                
                <CardContent>
                  {stats.total > 0 ? (
                    <CryptoSponsor 
                      experimentId="stroop-task-001" 
                      experimentTitle="Stroop Color Task"
                    />
                    
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Create experiments to enable blockchain sponsorship</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks to get you started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Button 
                    onClick={() => navigate('/ai-experiment-builder')}
                    className="h-auto py-4 flex flex-col gap-2"
                    variant="outline"
                  >
                    <Sparkles className="w-6 h-6" />
                    <span className="text-sm">Create Experiment</span>
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/templates')}
                    className="h-auto py-4 flex flex-col gap-2"
                    variant="outline"
                  >
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-sm">Browse Templates</span>
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/consent-form/create')}
                    className="h-auto py-4 flex flex-col gap-2"
                    variant="outline"
                  >
                    <FileText className="w-6 h-6" />
                    <span className="text-sm">Create Consent</span>
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/profile')}
                    className="h-auto py-4 flex flex-col gap-2"
                    variant="outline"
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-sm">View Profile</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;