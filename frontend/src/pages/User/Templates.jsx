import TemplateSelector from '@/components/experiment/TemplateSelector';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/user/AppSidebar';

export default function Templates() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex h-16 items-center gap-4 px-6">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Experiment Templates
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Browse and select templates to create your experiments
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <TemplateSelector />
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}