import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Label } from '../ui/label';
import {
  ExternalLink,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
  Globe,
  Lock,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

export const ExperimentBuildPanel = ({ experimentId, templateId }) => {
  const [buildStatus, setBuildStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    if (experimentId) {
      fetchBuildStatus();
    }
  }, [experimentId]);

  const fetchBuildStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai-experiments/${experimentId}/build-status`
      );
      const data = await response.json();
      
      if (data.success) {
        setBuildStatus(data);
      } else {
        setBuildStatus(null);
      }
    } catch (error) {
      console.error('Error fetching build status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuild = async () => {
    setBuilding(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai-experiments/${experimentId}/build`,
        { method: 'POST' }
      );
      const data = await response.json();
      
      if (data.success) {
        await fetchBuildStatus();
        alert('✅ Experiment built successfully!');
      } else {
        alert('❌ Build failed: ' + data.message);
      }
    } catch (error) {
      console.error('Build error:', error);
      alert('Error building experiment');
    } finally {
      setBuilding(false);
    }
  };

  const handleTogglePublic = async () => {
    setToggling(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai-experiments/${experimentId}/toggle-public`,
        { method: 'POST' }
      );
      const data = await response.json();
      
      if (data.success) {
        await fetchBuildStatus();
      } else {
        alert('Error toggling public access: ' + data.message);
      }
    } catch (error) {
      console.error('Toggle error:', error);
      alert('Error toggling public access');
    } finally {
      setToggling(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading build status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show preview even without build if we have templateId
  if (!buildStatus?.built && templateId) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Preview Your Experiment</CardTitle>
            <CardDescription>
              Your experiment is saved! Preview it below or build it for standalone sharing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Eye className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium">Template ID: <code className="text-sm bg-muted px-2 py-1 rounded">{templateId}</code></p>
                <p className="text-sm text-muted-foreground mt-1">
                  Preview URL: http://localhost:5173/preview/{templateId}
                </p>
              </div>
              <Button onClick={() => setPreviewVisible(!previewVisible)}>
                {previewVisible ? 'Hide Preview' : 'Show Preview'}
              </Button>
            </div>

            <Button onClick={handleBuild} disabled={building} variant="outline" className="w-full">
              {building ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Building Standalone Version...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Build Standalone HTML Version
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Build a standalone HTML file that can be shared without React
            </p>
          </CardContent>
        </Card>

        {previewVisible && (
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                Your experiment running in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-white" style={{ height: '600px' }}>
                <iframe
                  src={`http://localhost:5173/preview/${templateId}`}
                  className="w-full h-full"
                  title="Experiment Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Build Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Standalone Build</CardTitle>
              <CardDescription>
                Build your experiment as a standalone HTML file that can be shared publicly
              </CardDescription>
            </div>
            {buildStatus?.built && (
              <Badge variant={buildStatus.buildStatus === 'success' ? 'default' : 'destructive'}>
                {buildStatus.buildStatus}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!buildStatus?.built ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                This experiment hasn't been built yet. Click below to create a standalone version.
              </p>
              <Button onClick={handleBuild} disabled={building}>
                {building ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Building...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Build Experiment
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              {/* Build Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Public ID</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {buildStatus.publicId}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(buildStatus.publicId)}
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Build Version</Label>
                  <p className="mt-1 text-sm">{buildStatus.buildVersion}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Access Count</Label>
                  <p className="mt-1 text-sm">{buildStatus.accessCount} views</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Public Access</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {buildStatus.isPublic ? (
                      <>
                        <Globe className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Public</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-orange-600">Private</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* URLs */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Share Links</Label>
                <div className="space-y-2">
                  {/* Frontend Preview URL */}
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={`http://localhost:5173/preview/${buildStatus.templateId || templateId || buildStatus.publicId}`}
                      className="flex-1 text-sm bg-muted px-3 py-2 rounded border"
                      placeholder="Preview URL (no login required)"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewVisible(!previewVisible)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {previewVisible ? 'Hide' : 'Preview'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`http://localhost:5173/preview/${buildStatus.templateId || templateId || buildStatus.publicId}`)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {/* Public Experiment URL (frontend) */}
                  {buildStatus.isPublic && (
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={`http://localhost:5173/run-experiment/${buildStatus.templateId || templateId || buildStatus.publicId}`}
                        className="flex-1 text-sm bg-muted px-3 py-2 rounded border"
                        placeholder="Public experiment URL"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`http://localhost:5173/run-experiment/${buildStatus.templateId || templateId || buildStatus.publicId}`, '_blank')}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(`http://localhost:5173/run-experiment/${buildStatus.templateId || templateId || buildStatus.publicId}`)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={handleBuild} disabled={building} variant="outline">
                  {building ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rebuilding...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Rebuild
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleTogglePublic}
                  disabled={toggling}
                  variant={buildStatus.isPublic ? 'destructive' : 'default'}
                >
                  {toggling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {buildStatus.isPublic ? 'Making Private...' : 'Making Public...'}
                    </>
                  ) : (
                    <>
                      {buildStatus.isPublic ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Make Private
                        </>
                      ) : (
                        <>
                          <Globe className="mr-2 h-4 w-4" />
                          Make Public
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>

              {buildStatus.buildError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Build Error: {buildStatus.buildError}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Preview iframe - Frontend URL */}
      {previewVisible && templateId && (
        <Card>
          <CardHeader>
            <CardTitle>Experiment Preview</CardTitle>
            <CardDescription>
              This is how your experiment will appear to participants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden bg-white" style={{ height: '600px' }}>
              <iframe
                src={`http://localhost:5173/preview/${templateId}`}
                className="w-full h-full"
                title="Experiment Preview"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
