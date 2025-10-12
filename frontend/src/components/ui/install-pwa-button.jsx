import { useState, useEffect } from 'react';
import { Button } from './button';
import { Download, CheckCircle } from 'lucide-react';

export function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if running as installed PWA
    if (window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Listen for the install prompt
    const handler = (e) => {
      console.log('✅ beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for app installed event
    const installedHandler = () => {
      console.log('App installed successfully!');
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('🔘 Install button clicked');
    console.log('deferredPrompt:', deferredPrompt);
    
    if (!deferredPrompt) {
      alert('Install prompt not ready yet.\n\nTry:\n• Use Chrome or Edge browser\n• Visit on HTTPS\n• Scroll around the page\n• Wait a few seconds\n• Reload the page');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted install');
        setIsInstalled(true);
      } else {
        console.log('User dismissed install');
      }
    } catch (error) {
      console.error('Install error:', error);
    }

    setDeferredPrompt(null);
  };

  // Show "Already Installed" if installed
  if (isInstalled) {
    return (
      <Button 
        disabled
        className="flex items-center gap-2 h-12 w-full md:w-auto"
        variant="outline"
      >
        <CheckCircle className="h-4 w-4 text-green-500" />
        App Installed
      </Button>
    );
  }

  // ALWAYS SHOW BUTTON (even if prompt not ready)
  return (
    <Button 
      onClick={handleInstallClick} 
      className="flex items-center gap-2 h-12 w-full md:w-auto"
      variant="outline"
    >
      <Download className="h-4 w-4" />
      {deferredPrompt ? 'Install App' : 'Install App (Ready...)'}
    </Button>
  );
}