'use client';

import { useState, useEffect } from 'react';

interface PWAState {
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  updateAvailable: boolean;
  serviceWorkerStatus: 'active' | 'inactive' | 'checking' | 'unavailable';
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWA() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isOnline: true,
    isInstalled: false,
    canInstall: false,
    updateAvailable: false,
    serviceWorkerStatus: 'checking',
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check online status
    const handleOnline = () => setPwaState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setPwaState(prev => ({ ...prev, isOnline: false }));

    // Check if app is installed
    const checkInstallation = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
      setPwaState(prev => ({ ...prev, isInstalled }));
    };

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPwaState(prev => ({ ...prev, canInstall: true }));
    };

    // Handle app installed
    const handleAppInstalled = () => {
      setPwaState(prev => ({ 
        ...prev, 
        isInstalled: true, 
        canInstall: false 
      }));
      setDeferredPrompt(null);
    };

    // Check service worker status
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          const status = registration?.active ? 'active' : 'inactive';
          setPwaState(prev => ({ ...prev, serviceWorkerStatus: status }));
        } catch {
          setPwaState(prev => ({ ...prev, serviceWorkerStatus: 'inactive' }));
        }
      } else {
        setPwaState(prev => ({ ...prev, serviceWorkerStatus: 'unavailable' }));
      }
    };

    // Initialize
    setPwaState(prev => ({ ...prev, isOnline: navigator.onLine }));
    checkInstallation();
    checkServiceWorker();

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setPwaState(prev => ({ ...prev, canInstall: false }));
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Installation failed:', error);
      return false;
    }
  };

  const checkForUpdates = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
        }
      } catch (error) {
        console.error('Update check failed:', error);
      }
    }
  };

  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        return true;
      } catch (error) {
        console.error('Cache clearing failed:', error);
        return false;
      }
    }
    return false;
  };

  return {
    ...pwaState,
    installApp,
    checkForUpdates,
    clearCache,
  };
} 