import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useParticipant } from '../context/ParticipantContext';
import ConsentDisplay from '../components/experiment/ConsentDisplay';
import AIExperimentRunner from '../components/experiment/AIExperimentRunner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const PublicExperiment = () => {
  const { id: experimentId } = useParams();
  const navigate = useNavigate();
  const { participant } = useParticipant();

  const [loading, setLoading] = useState(true);
  const [experiment, setExperiment] = useState(null);
  const [consentForm, setConsentForm] = useState(null);
  const [error, setError] = useState(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [experimentComplete, setExperimentComplete] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    loadExperiment();
  }, [experimentId]);

  const loadExperiment = async () => {
    try {
      setLoading(true);

      // Load experiment
      const expResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/experiments/${experimentId}`
      );

      if (!expResponse.ok) {
        throw new Error('Experiment not found');
      }

      const expData = await expResponse.json();
      
      if (expData.experiment.status !== 'published') {
        throw new Error('This experiment is not published yet');
      }

      setExperiment(expData.experiment);

      // Load consent form
      const consentResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/consent-forms/experiment/${experimentId}`
      );

      if (!consentResponse.ok) {
        throw new Error('No consent form found for this experiment');
      }

      const consentData = await consentResponse.json();
      setConsentForm(consentData.consentForm);

    } catch (err) {
      console.error('Error loading experiment:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConsent = async () => {
    try {
      // Record consent
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/consent-forms/${consentForm._id}/consent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId: participant?.mongoId || 'anonymous',
            ipAddress: 'client-ip',
            userAgent: navigator.userAgent,
            consentGiven: true
          })
        }
      );

      setHasConsented(true);
    } catch (err) {
      console.error('Error recording consent:', err);
      alert('Failed to record consent. Please try again.');
    }
  };

  const handleDecline = () => {
    navigate('/participant/dashboard');
  };

  const handleExperimentComplete = async (experimentResults) => {
    try {
      console.log('Experiment completed with results:', experimentResults);
      
      // Save results to backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/experiments/${experimentId}/results`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId: participant?.mongoId || 'anonymous',
            experimentId,
            results: experimentResults,
            completedAt: new Date().toISOString(),
            userAgent: navigator.userAgent
          })
        }
      );

      if (response.ok) {
        setResults(experimentResults);
        setExperimentComplete(true);
      } else {
        throw new Error('Failed to save results');
      }
    } catch (err) {
      console.error('Error saving results:', err);
      alert('Results saved locally but failed to upload. Please contact the researcher.');
      setResults(experimentResults);
      setExperimentComplete(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading experiment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <CardTitle>Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate('/participant/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (experimentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle2 className="w-8 h-8" />
              <CardTitle className="text-2xl">Experiment Complete!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Thank You for Participating!</h3>
              <p className="text-muted-foreground">
                Your data has been successfully recorded. Your contribution to this research is greatly appreciated.
              </p>
            </div>

            {results && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Your Results Summary:</h4>
                <pre className="text-xs overflow-auto max-h-60 bg-background p-3 rounded border">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/participant/dashboard')} 
                className="flex-1"
              >
                Back to Dashboard
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="flex-1"
              >
                Take Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasConsented && consentForm) {
    return (
      <ConsentDisplay
        consentForm={consentForm}
        onConsent={handleConsent}
        onDecline={handleDecline}
      />
    );
  }

  if (experiment && experiment.aiGenerated && experiment.componentCode) {
    return (
      <AIExperimentRunner
        experimentId={experimentId}
        componentCode={experiment.componentCode}
        onComplete={handleExperimentComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Experiment Not Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This experiment type is not yet supported.
          </p>
          <Button onClick={() => navigate('/participant/dashboard')} className="w-full">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicExperiment;