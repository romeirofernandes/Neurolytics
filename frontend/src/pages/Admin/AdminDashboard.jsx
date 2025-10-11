import React from 'react';
import AdminSidebar from '../../components/admin/adminSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../../components/ui/sidebar';

const AdminDashboard = () => {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-xl font-semibold text-foreground">Admin Dashboard</h1>
        </header>
        
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-6">
            <h1 className="text-6xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-2xl text-muted-foreground">
              This is an admin dashboard
            </p>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminDashboard;
