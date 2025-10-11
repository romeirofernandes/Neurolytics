import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TemplateSelector from '@/components/experiment/TemplateSelector';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/user/AppSidebar';
import { Separator } from '@/components/ui/separator';

export default function Templates() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleSelectTemplate = (template) => {
    console.log('Selected template:', template);
    setSelectedTemplate(template);
    
    // Render the template component directly
    // You can also navigate to a preview page or experiment builder
    // For now, let's render it in a modal or full screen
  };

  // If a template is selected, render it
  if (selectedTemplate) {
    const TemplateComponent = selectedTemplate.component;
    
    return (
      <div className="min-h-screen bg-background">
        <TemplateComponent 
          onComplete={(results) => {
            console.log('Template completed:', results);
            // Handle completion - save results, show summary, etc.
            setSelectedTemplate(null); // Go back to template selector
          }} 
        />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex h-16 items-center gap-4 px-6">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold">Experiment Templates</h1>
          </div>
        </div>
        
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <TemplateSelector onSelectTemplate={handleSelectTemplate} />
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}