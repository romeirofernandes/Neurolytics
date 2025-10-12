import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppSidebar from '../../components/user/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../../components/ui/sidebar';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { 
  Send, 
  Sparkles, 
  Code, 
  Eye, 
  Save, 
  Rocket,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileCode,
  MessageSquare,
  Lightbulb
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ExperimentBuildPanel } from '../../components/experiment/ExperimentBuildPanel';

const AIExperimentBuilder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Chat state
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Hello! I'm your AI Experiment Builder assistant powered by **RAG (Retrieval-Augmented Generation)**.

Instead of creating experiments from scratch, I retrieve and modify **validated psychological experiment templates** based on your needs.

I can help you:
- **Retrieve** existing templates (Stroop, N-Back, BART, Go/No-Go, etc.)
- **Modify** templates with your specific requirements
- **Customize** trials, timing, stimuli, and difficulty
- **Optimize** experimental designs with best practices

**How it works:**
1. Describe what you want (e.g., "Create a Stroop task with 30 trials")
2. I'll find the most similar template from our knowledge base
3. I'll modify it according to your specifications
4. You'll get production-ready code based on proven templates

What would you like to build today?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Experiment state
  const [currentExperiment, setCurrentExperiment] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [experimentTitle, setExperimentTitle] = useState('');
  const [experimentDescription, setExperimentDescription] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [usedTemplate, setUsedTemplate] = useState(null);
  const [templateSimilarity, setTemplateSimilarity] = useState(0);

  // Publish state
  const [canPublish, setCanPublish] = useState(false);
  const [publishIssues, setPublishIssues] = useState([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai-experiments/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          conversationHistory: messages,
          currentExperiment,
          researcherId: user.mongoId
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage = {
          role: 'assistant',
          content: data.message,
          code: data.code,
          suggestions: data.suggestions,
          usedTemplate: data.usedTemplate,
          templateSimilarity: data.templateSimilarityScore,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);

        // If code was generated, store it
        if (data.code) {
          setGeneratedCode(data.code);
          setUsedTemplate(data.usedTemplate);
          setTemplateSimilarity(data.templateSimilarityScore);
          setShowCodeEditor(true);
          setActiveTab('code'); // Switch to code tab
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickAction = (action) => {
    const prompts = {
      createStroop: "Create a Stroop task with 40 trials, colored words (red, blue, green, yellow), and measure response time and accuracy.",
      createNBack: "Create a 2-back working memory task with letters, 20 trials, and track hits, misses, and false alarms.",
      modifyTiming: "I want to adjust the timing - make the fixation 750ms and stimulus presentation 2000ms.",
      addRandomization: "Add randomization to the trial order and ensure stimuli don't repeat consecutively.",
      optimizeTrials: "Reduce the number of trials to make the experiment shorter while maintaining statistical power."
    };

    setInputMessage(prompts[action]);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleSaveExperiment = async () => {
    if (!experimentTitle || !generatedCode) {
      alert('Please provide a title and generate code first');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai-experiments/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: experimentTitle,
          description: experimentDescription,
          componentCode: generatedCode,
          researcherId: user.mongoId,
          templateType: 'custom-ai-generated',
          estimatedDuration: 15
        })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentExperiment(data.experiment);
        
        // Store template info if available
        if (data.templateInfo && data.templateInfo.templateId) {
          setCurrentExperiment(prev => ({
            ...prev,
            templateId: data.templateInfo.templateId
          }));
        }
        
        alert('✅ Experiment saved successfully!');
        checkCanPublish(data.experiment._id);
        
        // Switch to build tab to show the preview
        setActiveTab('build');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save experiment');
    } finally {
      setSaving(false);
    }
  };

  const checkCanPublish = async (experimentId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai-experiments/${experimentId}/can-publish`
      );
      const data = await response.json();

      if (data.success) {
        setCanPublish(data.canPublish);
        setPublishIssues(data.issues || []);
      }
    } catch (error) {
      console.error('Publish check error:', error);
    }
  };

  const handlePublishExperiment = async () => {
    if (!currentExperiment) {
      alert('Please save the experiment first');
      return;
    }

    if (!canPublish) {
      alert('Cannot publish: ' + publishIssues.join(', '));
      return;
    }

    setPublishing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai-experiments/${currentExperiment._id}/publish`,
        { method: 'POST' }
      );

      const data = await response.json();

      if (data.success) {
        alert('🚀 Experiment published successfully!');
        navigate('/user/dashboard');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Publish error:', error);
      alert('Failed to publish experiment');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-23 shrink-0 items-center justify-between gap-2 border-b px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                AI Experiment Builder
              </h1>
             
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentExperiment && (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/user/consent-form-builder/${currentExperiment._id}`)}
                  className="gap-2"
                >
                  <FileCode className="w-4 h-4" />
                  Create Consent Form
                </Button>
                
                <Button
                  onClick={handlePublishExperiment}
                  disabled={!canPublish || publishing}
                  className="gap-2"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      Publish
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-6">
          <div className="h-full max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-4">
                <TabsTrigger value="chat" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-2" disabled={!generatedCode}>
                  <Code className="w-4 h-4" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="build" className="gap-2" disabled={!currentExperiment}>
                  <Rocket className="w-4 h-4" />
                  Build & Share
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="chat" className="h-full m-0">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                    {/* Quick Actions Sidebar */}
                    <Card className="lg:col-span-1 h-fit">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleQuickAction('createStroop')}
                        >
                          Create Stroop Task
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleQuickAction('createNBack')}
                        >
                          Create N-Back Task
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleQuickAction('modifyTiming')}
                        >
                          Adjust Timing
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleQuickAction('addRandomization')}
                        >
                          Add Randomization
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleQuickAction('optimizeTrials')}
                        >
                          Optimize Trials
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Chat Area */}
                    <div className="lg:col-span-3 flex flex-col h-full">
                      <Card className="flex-1 flex flex-col overflow-hidden">
                        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                          {messages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-4 ${
                                  msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                  <ReactMarkdown
                                    components={{
                                      code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                          <SyntaxHighlighter
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            {...props}
                                          >
                                            {String(children).replace(/\n$/, '')}
                                          </SyntaxHighlighter>
                                        ) : (
                                          <code {...props}>
                                            {children}
                                          </code>
                                        );
                                      }
                                    }}
                                  >
                                    {msg.content}
                                  </ReactMarkdown>
                                </div>
                                
                                {msg.suggestions && msg.suggestions.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-border space-y-1">
                                    <p className="text-xs font-semibold">Suggestions:</p>
                                    {msg.suggestions.map((sugg, i) => (
                                      <p key={i} className="text-xs">• {sugg}</p>
                                    ))}
                                  </div>
                                )}

                                {msg.usedTemplate && (
                                  <div className="mt-3 pt-3 border-t border-border">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className="text-xs">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        RAG: Using {msg.usedTemplate}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {msg.templateSimilarity}% match
                                      </Badge>
                                    </div>
                                  </div>
                                )}

                                <p className="text-xs opacity-60 mt-2">
                                  {msg.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                          
                          {isProcessing && (
                            <div className="flex justify-start">
                              <div className="bg-muted rounded-lg p-4">
                                <Loader2 className="w-5 h-5 animate-spin" />
                              </div>
                            </div>
                          )}
                          
                          <div ref={messagesEndRef} />
                        </CardContent>

                        <div className="border-t p-4">
                          <div className="flex gap-2">
                            <Textarea
                              ref={textareaRef}
                              value={inputMessage}
                              onChange={(e) => setInputMessage(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                              placeholder="Describe your experiment or ask for modifications..."
                              className="resize-none min-h-[60px] max-h-[200px]"
                              disabled={isProcessing}
                            />
                            <Button
                              onClick={handleSendMessage}
                              disabled={!inputMessage.trim() || isProcessing}
                              size="icon"
                              className="self-end"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Press Enter to send, Shift+Enter for new line
                          </p>
                        </div>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="code" className="h-full m-0">
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Generated Code</CardTitle>
                          <CardDescription>
                            Review and save your AI-generated experiment
                          </CardDescription>
                        </div>
                        <Button onClick={handleSaveExperiment} disabled={saving} className="gap-2">
                          {saving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Save Experiment
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Experiment Title *</Label>
                          <Input
                            id="title"
                            value={experimentTitle}
                            onChange={(e) => setExperimentTitle(e.target.value)}
                            placeholder="e.g., Custom Stroop Task"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            value={experimentDescription}
                            onChange={(e) => setExperimentDescription(e.target.value)}
                            placeholder="Brief description..."
                          />
                        </div>
                      </div>

                      {publishIssues.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-semibold text-amber-900 dark:text-amber-100">
                                Cannot Publish Yet
                              </p>
                              <ul className="mt-2 space-y-1 text-sm text-amber-800 dark:text-amber-200">
                                {publishIssues.map((issue, idx) => (
                                  <li key={idx}>• {issue}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex-1 overflow-hidden rounded-lg border">
                        <SyntaxHighlighter
                          language="jsx"
                          style={vscDarkPlus}
                          customStyle={{
                            margin: 0,
                            height: '100%',
                            borderRadius: 0
                          }}
                          showLineNumbers
                        >
                          {generatedCode}
                        </SyntaxHighlighter>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="build" className="h-full m-0">
                  <div className="space-y-6">
                    <ExperimentBuildPanel 
                      experimentId={currentExperiment?._id} 
                      templateId={currentExperiment?.templateId}
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AIExperimentBuilder;