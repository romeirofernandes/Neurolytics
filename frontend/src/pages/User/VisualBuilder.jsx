import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import AppSidebar from '../../components/user/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../../components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../components/ui/sheet';
import ExperimentNode from '../../components/visual-builder/ExperimentNode';
import NodePalette from '../../components/visual-builder/NodePalette';
import NodeEditor from '../../components/visual-builder/NodeEditor';
import {
  Save,
  Download,
  Upload,
  Settings,
  Eye,
  CheckCircle2,
  Trash2,
  Sparkles,
  Info,
  Loader2,
  X
} from 'lucide-react';

const nodeTypes = {
  experiment: ExperimentNode,
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
  },
  style: {
    strokeWidth: 3,
    stroke: '#6366f1',
  },
};

const STORAGE_KEY = 'visual-builder-state';

const VisualBuilder = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [experimentName, setExperimentName] = useState('');
  const [experimentDescription, setExperimentDescription] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [repetitions, setRepetitions] = useState(1);
  const [randomization, setRandomization] = useState({
    enabled: false,
    type: 'full',
  });
  const [previewVisible, setPreviewVisible] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [savedExperimentId, setSavedExperimentId] = useState(null);
  const [templateId, setTemplateId] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setExperimentName(data.experimentName || '');
        setExperimentDescription(data.experimentDescription || '');
        setRepetitions(data.repetitions || 1);
        setRandomization(data.randomization || { enabled: false, type: 'full' });
        setSavedExperimentId(data.savedExperimentId || null);
        setTemplateId(data.templateId || null);
      }
    } catch (error) {
      console.error('Failed to load saved state:', error);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      const state = {
        nodes,
        edges,
        experimentName,
        experimentDescription,
        repetitions,
        randomization,
        savedExperimentId,
        templateId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }, [nodes, edges, experimentName, experimentDescription, repetitions, randomization, savedExperimentId, templateId]);

  const onConnect = useCallback(
    (params) => {
      console.log('Connection params:', params);
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        style: {
          strokeWidth: 3,
          stroke: '#6366f1',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#6366f1',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setEditorOpen(true);
  }, []);

  const addNode = useCallback((blockType) => {
    const position = {
      x: 100 + (nodes.length * 50),
      y: 100 + (nodes.length * 80),
    };

    const newNode = {
      id: `node-${Date.now()}-${Math.random()}`,
      type: 'experiment',
      position,
      data: {
        label: `${blockType.name} ${nodes.length + 1}`,
        blockType: blockType.type,
        config: blockType.defaultConfig,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, nodes.length]);

  const updateNode = useCallback((updatedData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, ...updatedData } }
          : node
      )
    );
    setEditorOpen(false);
    setSelectedNode(null);
  }, [selectedNode, setNodes]);

  const clearCanvas = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the canvas? This will delete all nodes and reset the experiment.')) {
      setNodes([]);
      setEdges([]);
      setExperimentName('');
      setExperimentDescription('');
      setRepetitions(1);
      setRandomization({ enabled: false, type: 'full' });
      setSavedExperimentId(null);
      setTemplateId(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [setNodes, setEdges]);

  const generateAIExperiment = async () => {
    if (!experimentName.trim() || !experimentDescription.trim()) {
      alert('Please provide both experiment name and description for AI generation');
      return;
    }

    if (nodes.length === 0) {
      alert('Please add at least one node to define the experiment structure');
      return;
    }

    setGeneratingAI(true);

    try {
      const flowDescription = `
Create a React experiment component based on this visual flow design:

**Experiment Name:** ${experimentName}
**Description:** ${experimentDescription}
**Number of Blocks:** ${nodes.length}
**Repetitions per Block:** ${repetitions}
**Randomization:** ${randomization.enabled ? 'Enabled' : 'Disabled'}

**Experimental Flow (in sequence):**
${nodes.map((node, idx) => {
  const nextNode = edges.find(e => e.source === node.id);
  const nextNodeData = nextNode ? nodes.find(n => n.id === nextNode.target) : null;
  
  return `
Block ${idx + 1}: ${node.data.label}
- Type: ${node.data.blockType}
- Configuration: ${JSON.stringify(node.data.config, null, 2)}
${nextNodeData ? `- Next: ${nextNodeData.data.label}` : '- Final block'}
`;
}).join('\n')}

**Connection Flow:**
${edges.map(edge => {
  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);
  return `${sourceNode?.data.label} → ${targetNode?.data.label}`;
}).join('\n')}

**Requirements:**
1. Implement each block type exactly as configured
2. Follow the connection flow for trial sequencing
3. Repeat each block ${repetitions} times
${randomization.enabled ? '4. Randomize the order of trials' : '4. Keep trials in sequential order'}
5. Collect comprehensive data for each trial
6. Display clear instructions and feedback
7. Show progress indicator
8. Provide summary statistics at the end

Generate a complete, production-ready React component.
    `.trim();

      console.log('Sending AI generation request...');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/visual-builder/generate-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: flowDescription,
          researcherId: user?.mongoId || 'anonymous',
        })
      });

      if (!response.ok) {
        throw new Error(`AI generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('AI generated code successfully');

      if (!data.success) {
        throw new Error(data.message || 'Failed to generate experiment');
      }

      // Save directly to templates.json
      console.log('Saving to templates.json...');
      
      const saveResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/visual-builder/save-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: experimentName,
          description: experimentDescription,
          componentCode: data.code,
          researcherId: user?.mongoId || 'anonymous',
          estimatedDuration: Math.ceil(nodes.length * repetitions * 2 / 60),
          metadata: {
            nodeCount: nodes.length,
            edgeCount: edges.length,
            repetitions: repetitions,
            randomized: randomization.enabled,
            visualFlow: {
              nodes: nodes,
              edges: edges
            }
          }
        })
      });

      if (!saveResponse.ok) {
        throw new Error(`Failed to save: ${saveResponse.statusText}`);
      }

      const saveData = await saveResponse.json();
      console.log('Saved to templates.json:', saveData);

      if (saveData.success) {
        setTemplateId(saveData.templateInfo?.templateId);
        setSaveSuccess(true);
        alert(`✅ Experiment saved to templates.json!\n\nTemplate ID: ${saveData.templateInfo?.templateId}\nYou can now find it in your experiment templates.`);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error(saveData.message || 'Failed to save');
      }

    } catch (error) {
      console.error('AI Generation error:', error);
      alert('Failed to generate AI experiment: ' + error.message);
    } finally {
      setGeneratingAI(false);
    }
  };

  const exportJSON = () => {
    const data = {
      name: experimentName,
      description: experimentDescription,
      nodes: nodes,
      edges: edges,
      randomization: randomization,
      repetitions: repetitions,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${experimentName.replace(/\s+/g, '-')}-flow.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // Validate the JSON structure
        if (!data.nodes || !Array.isArray(data.nodes)) {
          throw new Error('Invalid JSON: missing nodes array');
        }

        // Import the data
        setExperimentName(data.name || '');
        setExperimentDescription(data.description || '');
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setRandomization(data.randomization || { enabled: false, type: 'full' });
        setRepetitions(data.repetitions || 1);

        alert(`✅ Successfully imported experiment: ${data.name || 'Untitled'}`);
      } catch (error) {
        console.error('Import error:', error);
        alert('❌ Invalid JSON file: ' + error.message);
      }
    };
    reader.readAsText(file);
    
    // Reset the file input so the same file can be imported again
    e.target.value = '';
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-23 shrink-0 items-center justify-between gap-2 border-b px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">Visual Flow Builder</h1>
            </div>
          </div>

          <div className="flex gap-2">
            {templateId && (
              <Button 
                onClick={() => setPreviewVisible(!previewVisible)} 
                variant="outline" 
                size="sm"
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                {previewVisible ? 'Hide Preview' : 'Preview'}
              </Button>
            )}
            <Button onClick={clearCanvas} variant="outline" size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button 
              onClick={generateAIExperiment} 
              disabled={generatingAI || nodes.length === 0}
              className="gap-2"
              variant="default"
            >
              {generatingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate AI Experiment
                </>
              )}
            </Button>
          </div>
        </header>

        <main className="flex-1 h-[calc(100vh-4rem)] relative overflow-hidden">
          {saveSuccess && (
            <Alert className="absolute top-4 right-4 w-96 z-20 border-success bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                AI Experiment generated and saved successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Tutorial hint */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <Card className="max-w-md pointer-events-auto">
                <CardContent className="pt-6 text-center space-y-3">
                  <Info className="h-12 w-12 mx-auto text-primary" />
                  <h3 className="text-lg font-semibold">Build Your Experiment Flow</h3>
                  <p className="text-sm text-muted-foreground">
                    1. Click blocks in the right panel to add nodes
                    <br />2. Connect them with arrows
                    <br />3. Click "Generate AI Experiment" to create a template
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Or import a JSON file to get started quickly
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="absolute top-4 left-4 z-10 w-80">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4" />
                  Experiment Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Name *</Label>
                  <Input
                    value={experimentName}
                    onChange={(e) => setExperimentName(e.target.value)}
                    placeholder="e.g., Custom Cognitive Task"
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Description *</Label>
                  <textarea
                    className="w-full p-2 border rounded-md bg-background text-xs min-h-[60px]"
                    value={experimentDescription}
                    onChange={(e) => setExperimentDescription(e.target.value)}
                    placeholder="Describe what this experiment measures..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Repetitions</Label>
                    <Input
                      type="number"
                      min="1"
                      value={repetitions}
                      onChange={(e) => setRepetitions(parseInt(e.target.value) || 1)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Nodes</Label>
                    <div className="h-8 px-3 border rounded-md bg-muted flex items-center">
                      <Badge variant="secondary" className="text-xs">{nodes.length}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <input
                    type="checkbox"
                    checked={randomization.enabled}
                    onChange={(e) => setRandomization({ ...randomization, enabled: e.target.checked })}
                    className="rounded"
                  />
                  <Label className="text-xs">Randomize Trial Order</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={exportJSON} disabled={nodes.length === 0}>
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('import-flow').click()}>
                    <Upload className="w-3 h-3 mr-1" />
                    Import
                  </Button>
                  <input
                    id="import-flow"
                    type="file"
                    accept=".json,application/json"
                    onChange={importJSON}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="absolute top-4 right-4 z-10 w-72">
            <NodePalette onAddNode={addNode} />
          </div>

          {/* Main Flow Canvas */}
          <div className={`w-full ${previewVisible ? 'h-1/2' : 'h-full'}`}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              fitView
              className="bg-background"
            >
              <Controls className="bg-card border-border shadow-lg" />
              <MiniMap 
                className="bg-card border-border shadow-lg" 
                nodeColor={(node) => {
                  const colors = {
                    stimulus: 'hsl(var(--chart-1))',
                    response: 'hsl(var(--chart-2))',
                    instruction: 'hsl(var(--chart-3))',
                    fixation: 'hsl(var(--chart-4))',
                    feedback: 'hsl(var(--chart-5))',
                    survey: 'hsl(var(--info))',
                    conditional: 'hsl(var(--warning))',
                  };
                  return colors[node.data?.blockType] || 'hsl(var(--muted))';
                }}
              />
              <Background 
                variant={BackgroundVariant.Dots}
                gap={16}
                size={2}
                className="opacity-30"
              />
            </ReactFlow>
          </div>

          {/* Preview Panel */}
          {previewVisible && templateId && (
            <div className="absolute bottom-0 left-0 right-0 h-1/2 border-t bg-background z-10">
              <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
                <h3 className="font-semibold text-sm">Live Preview</h3>
                <Button variant="ghost" size="sm" onClick={() => setPreviewVisible(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="h-[calc(100%-40px)] overflow-hidden">
                <iframe
                  src={`http://localhost:5173/preview/${templateId}`}
                  className="w-full h-full border-0"
                  title="Experiment Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            </div>
          )}

          <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
            <SheetContent className="overflow-y-auto sm:max-w-xl p-0">
              <div className="p-6">
                {selectedNode && (
                  <NodeEditor
                    node={selectedNode}
                    onSave={updateNode}
                    onCancel={() => setEditorOpen(false)}
                  />
                )}
              </div>
            </SheetContent>
          </Sheet>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default VisualBuilder;