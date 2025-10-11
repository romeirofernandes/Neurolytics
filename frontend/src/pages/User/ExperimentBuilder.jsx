import React, { useState } from 'react';
import AppSidebar from '../../components/user/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../../components/ui/sidebar';
import PalettePanel from '../../components/experiment/PalettePanel';
import CanvasPanel from '../../components/experiment/CanvasPanel';
import InspectorPanel from '../../components/experiment/InspectorPanel';
import AllBlocksPreview from '../../components/experiment/AllBlocksPreview';
import { ExperimentProvider, useExperiment } from '../../context/ExperimentContext';
import { Play, FileJson } from 'lucide-react';

const ExperimentBuilderContent = () => {
  const { blocks } = useExperiment();
  const [isRunning, setIsRunning] = useState(false);

  const handleRunExperiment = () => {
    if (blocks.length === 0) {
      alert('Please add at least one block to your experiment before running it.');
      return;
    }
    setIsRunning(true);
  };

  const handleExportJSON = () => {
    if (blocks.length === 0) {
      alert('No blocks to export.');
      return;
    }

    const dataStr = JSON.stringify(blocks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `experiment-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <header className="flex h-23 shrink-0 items-center justify-between gap-2 border-b px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-xl font-semibold text-foreground">Experiment Builder</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={blocks.length === 0}
          >
            <FileJson className="w-4 h-4" />
            Export JSON
          </button>
          
          <button
            onClick={handleRunExperiment}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={blocks.length === 0}
          >
            <Play className="w-4 h-4" />
            Preview All Blocks
          </button>
        </div>
      </header>
      
      <main className="flex-1 flex h-[calc(100vh-4rem)]">
        <PalettePanel />
        <CanvasPanel />
        <InspectorPanel />
      </main>

      {isRunning && (
        <AllBlocksPreview
          blocks={blocks}
          onClose={() => setIsRunning(false)}
        />
      )}
    </>
  );
};

const ExperimentBuilder = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ExperimentProvider>
          <ExperimentBuilderContent />
        </ExperimentProvider>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ExperimentBuilder;