import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ParticipantProvider, useParticipant } from './context/ParticipantContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/User/Dashboard'
import Profile from './pages/User/Profile'
import AdminAuth from './pages/Admin/AdminAuth'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ParticipantLogin from './pages/Participant/Login'
import ParticipantRegister from './pages/Participant/Register'
import ParticipantDashboard from './pages/Participant/Dashboard'
import ParticipantExplore from './pages/Participant/Explore'
import TemplateDetail from './pages/Participant/TemplateDetail'
import RunExperiment from './pages/Participant/RunExperiment'
import NotFoundPage from './pages/404Page'
import Templates from './pages/User/Templates'
import ExperimentBuilder from './pages/User/ExperimentBuilder'
import ConsentFormBuilder from './pages/User/ConsentFormBuilder'
import ConsentDisplay from './components/experiment/ConsentDisplay'
import { AlertCircle } from 'lucide-react'
import { Button } from './components/ui/button'
import TestModels from './pages/TestModels'
import AIExperimentBuilder from './pages/User/AIExperimentBuilder'

// Inline route protection components
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Participant route protection components
const ProtectedParticipantRoute = ({ children }) => {
  const { isAuthenticated } = useParticipant();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/participant/login" state={{ from: location }} replace />;
  }
  return children;
};

const PublicParticipantRoute = ({ children }) => {
  const { isAuthenticated } = useParticipant();

  if (isAuthenticated) {
    return <Navigate to="/participant/dashboard" replace />;
  }
  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ParticipantProvider>
          <div>
            <Routes>
              {/* Public routes - accessible to everyone */}
              <Route path="/" element={<Landing />} />
              
              {/* Auth routes - only accessible when NOT logged in */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              
              {/* Protected User/Researcher routes - only accessible when logged in */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/experiment-builder" element={
                <ProtectedRoute>
                  <ExperimentBuilder />
                </ProtectedRoute>
              } />

              <Route path="/ai-experiment-builder" element={
                <ProtectedRoute>
                  <AIExperimentBuilder />
                </ProtectedRoute>
              } />

              {/* Consent Form Builder Routes */}
              {/* Create new consent form */}
              <Route path="/consent-form/create" element={
                <ProtectedRoute>
                  <ConsentFormBuilder />
                </ProtectedRoute>
              } />
              
              {/* Create consent form for specific experiment */}
              <Route path="/consent-form/create/:experimentId" element={
                <ProtectedRoute>
                  <ConsentFormBuilder />
                </ProtectedRoute>
              } />
              
              {/* Edit existing consent form */}
              <Route path="/consent-form/edit/:consentFormId" element={
                <ProtectedRoute>
                  <ConsentFormBuilder />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

              <Route path="/templates" element={
                <ProtectedRoute>
                  <Templates />
                </ProtectedRoute>
              } />
            
              {/* Admin routes */}
              <Route path="/admin/auth" element={<AdminAuth />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              
              {/* Participant routes */}
              <Route path="/participant/login" element={
                <PublicParticipantRoute>
                  <ParticipantLogin />
                </PublicParticipantRoute>
              } />
              <Route path="/participant/register" element={
                <PublicParticipantRoute>
                  <ParticipantRegister />
                </PublicParticipantRoute>
              } />
              <Route path="/participant/dashboard" element={
                <ProtectedParticipantRoute>
                  <ParticipantDashboard />
                </ProtectedParticipantRoute>
              } />
              <Route path="/participant/explore" element={
                <ProtectedParticipantRoute>
                  <ParticipantExplore />
                </ProtectedParticipantRoute>
              } />
              <Route path="/participant/experiment/:templateId" element={
                <ProtectedParticipantRoute>
                  <TemplateDetail />
                </ProtectedParticipantRoute>
              } />
              <Route path="/participant/run-experiment/:templateId" element={
                <ProtectedParticipantRoute>
                  <RunExperiment />
                </ProtectedParticipantRoute>
              } />
              
              {/* Public experiment participation route (with consent) */}
              <Route path="/experiment/:experimentId" element={
                <PublicExperimentPage />
              } />
              
              <Route path="/test-models" element={<TestModels />} />
              
              {/* 404 route - catch all unmatched routes */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </ParticipantProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

// Public Experiment Page Component (shows consent first, then experiment)
const PublicExperimentPage = () => {
  const { experimentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [experimentData, setExperimentData] = useState(null);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    loadExperiment();
  }, [experimentId]);

  const loadExperiment = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/experiments/public/${experimentId}`
      );
      
      if (!response.ok) {
        throw new Error('Experiment not found or not available');
      }

      const data = await response.json();
      setExperimentData(data.experiment);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConsent = async () => {
    try {
      // Record consent
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/consent-forms/${experimentData.consentForm._id}/consent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            experimentId: experimentData.experimentId,
            consentGiven: true,
            ipAddress: '', // Could be captured on backend
          }),
        }
      );

      setConsentGiven(true);
    } catch (error) {
      console.error('Error recording consent:', error);
      alert('Failed to record consent. Please try again.');
    }
  };

  const handleDecline = () => {
    if (window.confirm('Are you sure you do not want to participate? This will redirect you away from the study.')) {
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading experiment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6">
            <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
              Experiment Not Available
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-4">
              {error}
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show consent form first
  if (!consentGiven && experimentData?.consentForm) {
    return (
      <ConsentDisplay
        consentForm={experimentData.consentForm}
        onConsent={handleConsent}
        onDecline={handleDecline}
      />
    );
  }

  // Show experiment after consent
  if (consentGiven && experimentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Your experiment runner component here */}
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-4">{experimentData.title}</h1>
          <p className="text-muted-foreground mb-8">{experimentData.description}</p>
          {/* Render experiment blocks */}
          {/* <ExperimentRunner blocks={experimentData.configuration.blocks} /> */}
        </div>
      </div>
    );
  }

  return null;
};

export default App