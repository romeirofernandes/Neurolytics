import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppSidebar from '../../components/user/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../../components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
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
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;
