import { TemplateSelector } from '@/components/experiment/TemplateSelector';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/user/AppSidebar';
import { Separator } from '@/components/ui/separator';

export default function Templates() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex h-23 items-center gap-4 px-6">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold">Experiment Templates</h1>
          </div>
        </div>
        
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Choose from our collection of validated psychological experiments. Each template is based on established research paradigms and includes AI-powered analysis.
              </p>
            </div>
            
            <TemplateSelector />
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}