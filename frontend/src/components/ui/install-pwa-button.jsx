import { useState, useEffect } from 'react';
import { Button } from './button';
import { Download } from 'lucide-react';

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
      console.log('beforeinstallprompt event fired!'); // Debug log
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for app installed event
    const installedHandler = () => {
      console.log('App installed successfully!'); // Debug log
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
    console.log('Install button clicked, deferredPrompt:', deferredPrompt);
    if (!deferredPrompt) {
      alert('Install not available. Try:\n1. Use Chrome/Edge\n2. Visit on HTTPS\n3. Interact with page first\n4. Clear cache and reload');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
  };

  // Don't show button if app is already installed or prompt not available
  if (isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <Button 
      onClick={handleInstallClick} 
      className="flex items-center gap-2 h-12 w-full md:w-auto"
      variant="outline"
    >
      <Download className="h-4 w-4" />
      Install App
    </Button>
  );
}