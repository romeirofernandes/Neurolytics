import React from 'react';
import { SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar';
import ParticipantSidebar from '../../components/participant/ParticipantSidebar';
import { useParticipant } from '../../context/ParticipantContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

const ParticipantDashboard = () => {
  const { participant } = useParticipant();

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
                  <h1 className="text-3xl font-bold text-foreground">
                    Welcome to Your Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage your research participation and view your experiments
                  </p>
                </div>
              </div>
            </div>

            {/* Participant Info Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Participant ID
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold font-mono break-all">
                    {participant?.id || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your unique identifier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Age
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {participant?.age || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Years old
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Experiments Participated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {participant?.experimentsParticipated?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total experiments
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>
                  Your participant information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gender</p>
                    <p className="text-base font-semibold capitalize">
                      {participant?.gender || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Education</p>
                    <p className="text-base font-semibold">
                      {participant?.education || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">City</p>
                    <p className="text-base font-semibold">
                      {participant?.city || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                    <p className="text-base font-semibold">
                      {participant?.createdAt 
                        ? new Date(participant.createdAt).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Experiments Section */}
            <Card>
              <CardHeader>
                <CardTitle>My Experiments</CardTitle>
                <CardDescription>
                  Experiments you have participated in
                </CardDescription>
              </CardHeader>
              <CardContent>
                {participant?.experimentsParticipated && participant.experimentsParticipated.length > 0 ? (
                  <div className="space-y-2">
                    {participant.experimentsParticipated.map((experiment, index) => (
                      <div 
                        key={index} 
                        className="p-4 border rounded-lg bg-muted/50"
                      >
                        <p className="font-medium">Experiment ID: {experiment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>You haven't participated in any experiments yet.</p>
                    <p className="text-sm mt-2">Check back later for available experiments.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ParticipantDashboard;
