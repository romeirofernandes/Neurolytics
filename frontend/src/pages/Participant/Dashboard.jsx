import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar';
import ParticipantSidebar from '../../components/participant/ParticipantSidebar';
import { useParticipant } from '../../context/ParticipantContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  FlaskConical, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  Shield, 
  Lock, 
  Eye, 
  FileCheck,
  ArrowRight,
  TrendingUp,
  Award,
  User,
  Calendar,
  GraduationCap,
  MapPin,
  Activity
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import CryptoWallet from '../../components/participant/CryptoWallet';

const ParticipantDashboard = () => {
  const { participant, updateParticipant } = useParticipant();
  const [activeExperiments, setActiveExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch participant details from API to ensure fresh data
  useEffect(() => {
    const fetchParticipantDetails = async () => {
      if (!participant?.id) return;
      
      try {
        setRefreshing(true);
        console.log('Fetching participant details for ID:', participant.id);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/participants/${participant.id}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Participant data refreshed:', data.participant);
          // Update context with fresh data
          updateParticipant(data.participant);
        }
      } catch (error) {
        console.error('Error fetching participant details:', error);
      } finally {
        setRefreshing(false);
      }
    };

    fetchParticipantDetails();
  }, [participant?.id]); // Only run when participant ID changes

  // Fetch active experiments
  useEffect(() => {
    const fetchActiveExperiments = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/public-experiments`);
        if (response.ok) {
          const data = await response.json();
          // Filter to get only published experiments
          const published = data.filter(exp => exp.status === 'published');
          setActiveExperiments(published);
        }
      } catch (error) {
        console.error('Error fetching experiments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveExperiments();
  }, []);

  const participatedCount = participant?.experimentsParticipated?.length || 0;

  // Debug logging
  useEffect(() => {
    console.log('=== DASHBOARD DEBUG ===');
    console.log('Participant:', participant);
    console.log('Participant ID:', participant?.id);
    console.log('Participant Age:', participant?.age);
    console.log('Participant Gender:', participant?.gender);
    console.log('Participant Education:', participant?.education);
    console.log('Participant City:', participant?.city);
    console.log('Experiments Participated:', participant?.experimentsParticipated);
    console.log('Participated Count:', participatedCount);
    console.log('======================');
  }, [participant, participatedCount]);

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
                    Welcome Back! 👋
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Your research participation dashboard
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <Alert className="border-primary/50 bg-primary/5">
              <Shield className="h-5 w-5 text-primary" />
              <AlertDescription className="ml-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground mb-1">Your Privacy is Our Priority</p>
                    <p className="text-sm text-muted-foreground">
                      All data is collected anonymously and handled in compliance with <strong>GDPR</strong>, <strong>CCPA</strong>, and <strong>IRB</strong> ethical guidelines. 
                      Your responses are encrypted and never shared without your consent.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link to="/privacy-policy">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Privacy Policy
                      </Button>
                    </Link>
                    <Link to="/terms-and-conditions">
                      <Button variant="outline" size="sm" className="gap-2">
                        <FileCheck className="h-4 w-4" />
                        Terms
                      </Button>
                    </Link>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Experiments
                  </CardTitle>
                  <FlaskConical className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {loading ? '...' : activeExperiments.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Available for participation
                  </p>
                  <Link to="/participant/experiments">
                    <Button variant="link" className="px-0 mt-2 h-auto text-xs">
                      View all experiments <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-500/20 hover:border-blue-500/40 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Participated Experiments
                  </CardTitle>
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {participatedCount}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {participatedCount > 0 
                      ? 'Great contribution to research!' 
                      : 'Start your first experiment'}
                  </p>
                  <Link to="/participant/participated">
                    <Button variant="link" className="px-0 mt-2 h-auto text-xs">
                      View my participated experiments <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* NEW: Time Invested Card (to keep 3 columns balanced) */}
              <Card className="border-2 border-purple-500/20 hover:border-purple-500/40 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Time Invested
                  </CardTitle>
                  <Clock className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {participatedCount * 15}m
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Estimated total time
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* MAIN GRID: Profile + Crypto Wallet */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* LEFT SIDE - 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Details Card - MOVE HERE */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Profile Details
                        </CardTitle>
                        <CardDescription>
                          Your participant information (kept anonymous)
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Private
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <p className="text-sm font-medium">Participant ID</p>
                        </div>
                        <p className="text-sm font-mono bg-muted px-3 py-2 rounded border break-all">
                          {refreshing ? 'Loading...' : participant?.id || 'N/A'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <p className="text-sm font-medium">Age</p>
                        </div>
                        <p className="text-lg font-semibold">
                          {refreshing ? 'Loading...' : `${participant?.age || 'N/A'} years`}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <p className="text-sm font-medium">Gender</p>
                        </div>
                        <p className="text-lg font-semibold capitalize">
                          {refreshing ? 'Loading...' : participant?.gender || 'N/A'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <GraduationCap className="h-4 w-4" />
                          <p className="text-sm font-medium">Education</p>
                        </div>
                        <p className="text-lg font-semibold">
                          {refreshing ? 'Loading...' : participant?.education || 'N/A'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <p className="text-sm font-medium">City</p>
                        </div>
                        <p className="text-lg font-semibold">
                          {refreshing ? 'Loading...' : participant?.city || 'Not specified'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <p className="text-sm font-medium">Member Since</p>
                        </div>
                        <p className="text-lg font-semibold">
                          {refreshing ? 'Loading...' : (participant?.createdAt 
                            ? new Date(participant.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              }) 
                            : 'N/A')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Protection Card - KEEP */}
                <Card className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200/50 dark:border-purple-800/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      Data Protection & Your Rights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex gap-3">
                        <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Encrypted & Secure</p>
                          <p className="text-xs text-muted-foreground">
                            All data is encrypted in transit (HTTPS/TLS) and at rest using industry-standard protocols
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Anonymous Data Collection</p>
                          <p className="text-xs text-muted-foreground">
                            No personally identifiable information (PII) is collected without explicit consent
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <FileCheck className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">GDPR & CCPA Compliant</p>
                          <p className="text-xs text-muted-foreground">
                            Full compliance with data protection regulations and ethical research guidelines
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Your Data, Your Control</p>
                          <p className="text-xs text-muted-foreground">
                            Right to access, delete, or export your data at any time
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-purple-200/50 dark:border-purple-800/50">
                      <p className="text-xs text-muted-foreground mb-3">
                        <strong>Your Rights:</strong> Access, Deletion, Rectification, Data Portability, Withdraw Consent, Object to Processing
                      </p>
                      <div className="flex gap-2">
                        <Link to="/privacy-policy">
                          <Button variant="outline" size="sm" className="gap-2">
                            <Shield className="h-4 w-4" />
                            Learn More
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Insights - Research Impact + Achievements */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Research Impact - KEEP */}
                  <Card className="bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200/50 dark:border-orange-800/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        Research Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Contribution Score</span>
                        <span className="font-bold text-orange-600 dark:text-orange-400">
                          {participatedCount * 10} pts
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Experiments Available</span>
                        <span className="font-bold">{activeExperiments.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Completion Rate</span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {participatedCount > 0 ? '100%' : '0%'}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-orange-200/50 dark:border-orange-800/50">
                        <p className="text-xs text-muted-foreground italic">
                          Your participation helps advance scientific research! 🎓
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Achievements - KEEP */}
                  <Card className="bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-950/20 dark:to-blue-950/20 border-cyan-200/50 dark:border-cyan-800/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Award className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                        Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        {participatedCount >= 1 ? (
                          <>
                            <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                              <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">First Participation 🎉</p>
                              <p className="text-xs text-muted-foreground">Completed your first experiment</p>
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Complete experiments to unlock achievements
                          </div>
                        )}
                      </div>
                      {participatedCount >= 5 && (
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">Research Enthusiast 🌟</p>
                            <p className="text-xs text-muted-foreground">Completed 5+ experiments</p>
                          </div>
                        </div>
                      )}
                      {participatedCount >= 10 && (
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">Science Champion 🏆</p>
                            <p className="text-xs text-muted-foreground">Completed 10+ experiments</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* RIGHT SIDE - 1 column - CRYPTO WALLET */}
              <div className="space-y-6">
                {/* 🎯 CRYPTO WALLET COMPONENT */}
                <CryptoWallet participantId={participant?.id} />
              </div>
            </div>

            {/* Participated Experiments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  My Completed Experiments
                </CardTitle>
                <CardDescription>
                  Research studies you have participated in
                </CardDescription>
              </CardHeader>
              <CardContent>
                {participant?.experimentsParticipated && participant.experimentsParticipated.length > 0 ? (
                  <div className="space-y-3">
                    {participant.experimentsParticipated.map((experiment, index) => (
                      <div 
                        key={index} 
                        className="p-4 border rounded-lg bg-muted/50 hover:bg-muted transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Experiment #{index + 1}</p>
                            <p className="font-mono text-xs text-muted-foreground">ID: {experiment}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                          Completed
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <FlaskConical className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">No experiments participated yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-2 mb-4">
                      Start contributing to research by participating in available experiments
                    </p>
                    <Link to="/participant/experiments">
                      <Button className="gap-2">
                        <FlaskConical className="h-4 w-4" />
                        Browse Experiments
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-semibold text-sm mb-1">Data Privacy</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Learn how we protect your data
                    </p>
                    <Link to="/privacy-policy">
                      <Button variant="outline" size="sm" className="w-full">
                        View Policy
                      </Button>
                    </Link>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <FileCheck className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-semibold text-sm mb-1">Terms of Use</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Understand your rights
                    </p>
                    <Link to="/terms-and-conditions">
                      <Button variant="outline" size="sm" className="w-full">
                        Read Terms
                      </Button>
                    </Link>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <FlaskConical className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-semibold text-sm mb-1">How It Works</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Learn about participation
                    </p>
                    <Link to="/participant/experiments">
                      <Button variant="outline" size="sm" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ParticipantDashboard;
