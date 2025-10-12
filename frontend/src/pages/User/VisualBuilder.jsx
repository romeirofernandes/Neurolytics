import React, { useState, useCallback } from 'react';
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
  Play,
  CheckCircle2,
  Trash2,
  Copy,
  Sparkles,
  Info
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
    stroke: '#6366f1', // Use hex color instead of CSS variable
  },
};

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

  const onConnect = useCallback(
    (params) => {
      console.log('Connection params:', params);
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        style: {
          strokeWidth: 3,
          stroke: '#6366f1', // Use hex color instead of CSS variable
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

  const deleteNode = useCallback((id) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  }, [setNodes, setEdges]);

  const duplicateNode = useCallback((node) => {
    const newNode = {
      ...node,
      id: `node-${Date.now()}-${Math.random()}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      data: {
        ...node.data,
        label: `${node.data.label} (copy)`,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const clearCanvas = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the canvas?')) {
      setNodes([]);
      setEdges([]);
    }
  }, [setNodes, setEdges]);

  const saveExperiment = async () => {
    if (!experimentName.trim()) {
      alert('Please enter an experiment name');
      return;
    }

    if (nodes.length === 0) {
      alert('Please add at least one node');
      return;
    }

    setSaving(true);
    setSaveSuccess(false);

    try {
      const experimentId = experimentName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const experimentData = {
        id: experimentId,
        name: experimentName,
        fullName: experimentDescription || experimentName,
        category: 'custom',
        difficulty: 'medium',
        duration: `${Math.ceil(nodes.length * repetitions * 2 / 60)} min`,
        trials: `${nodes.length * repetitions} trials`,
        description: experimentDescription,
        source: 'visual-builder',
        config: {
          nodes: nodes,
          edges: edges,
          randomization: randomization,
          repetitions: repetitions,
          flowType: 'node-based'
        },
        createdBy: user._id,
        createdAt: new Date().toISOString()
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/visual-builder/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ experiment: experimentData })
      });

      const data = await response.json();

      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save experiment: ' + error.message);
    } finally {
      setSaving(false);
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
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          setExperimentName(data.name || '');
          setExperimentDescription(data.description || '');
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
          setRandomization(data.randomization || { enabled: false, type: 'full' });
          setRepetitions(data.repetitions || 1);
        } catch (error) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
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

          <div className="flex gap-4">
            <Button onClick={clearCanvas} variant="outline" className="p-4">
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
            <Button onClick={saveExperiment} disabled={saving} className="gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </header>

        <main className="flex-1 h-[calc(100vh-4rem)] relative">
          {saveSuccess && (
            <Alert className="absolute top-4 right-4 w-96 z-20 border-success bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Experiment saved successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Tutorial hint for first-time users */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <Card className="max-w-md pointer-events-auto">
                <CardContent className="pt-6 text-center space-y-3">
                  <Info className="h-12 w-12 mx-auto text-primary" />
                  <h3 className="text-lg font-semibold">Welcome to Visual Builder!</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on blocks in the right panel to add nodes. Connect them with arrows to create your experiment flow.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click any node to edit its properties. Drag nodes to reposition them.
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
                    placeholder="e.g., Stroop Color-Word Task"
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <textarea
                    className="w-full p-2 border rounded-md bg-background text-xs min-h-[60px]"
                    value={experimentDescription}
                    onChange={(e) => setExperimentDescription(e.target.value)}
                    placeholder="Brief description of your experiment..."
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
                  <Button variant="outline" size="sm" onClick={exportJSON}>
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
                    accept=".json"
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

          <div className="w-full h-full">
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