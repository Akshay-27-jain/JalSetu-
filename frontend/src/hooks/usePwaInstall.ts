import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
    const isIosStandalone = (window.navigator as any).standalone === true;
    const isAndroidApp = document.referrer.includes('android-app://');
    return isStandaloneMedia || isIosStandalone || isAndroidApp;
  });
  const [isIos, setIsIos] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    // Detect Standalone Mode (Already installed / Running as App)
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isIosStandalone = (window.navigator as any).standalone === true;
      const isAndroidApp = document.referrer.includes('android-app://');
      return isStandaloneMedia || isIosStandalone || isAndroidApp;
    };

    if (checkStandalone()) {
      setIsInstalled(true);
      setIsInstallable(false);
    }

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/chrome|crios|fxios/.test(ua);
    if (isIosDevice && !checkStandalone()) {
      setIsIos(true);
      setIsInstallable(true);
    }

    // Handler for beforeinstallprompt (Chromium Desktop & Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!checkStandalone()) {
        setIsInstallable(true);
        setIsInstalled(false);
      }
    };

    // Handler for appinstalled
    const handleAppInstalled = () => {
      localStorage.setItem('jalsetu_pwa_installed', 'true');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      window.dispatchEvent(new Event('pwa-installed-state-changed'));
      console.log('[PWA] JalSetu App installed successfully');
    };

    const handleStateChanged = () => {
      setIsInstalled(checkStandalone());
    };

    // Online/Offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-installed-state-changed', handleStateChanged);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-installed-state-changed', handleStateChanged);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'ios' | 'unsupported'> => {
    if (isIos) {
      return 'ios';
    }

    if (!deferredPrompt) {
      return 'unsupported';
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        localStorage.setItem('jalsetu_pwa_installed', 'true');
        setIsInstalled(true);
        setIsInstallable(false);
        window.dispatchEvent(new Event('pwa-installed-state-changed'));
      }
      setDeferredPrompt(null);
      return choice.outcome;
    } catch (err) {
      console.error('[PWA] Error triggering install prompt:', err);
      return 'dismissed';
    }
  }, [deferredPrompt, isIos]);

  const markAsInstalled = useCallback(() => {
    localStorage.setItem('jalsetu_pwa_installed', 'true');
    setIsInstalled(true);
    setIsInstallable(false);
    window.dispatchEvent(new Event('pwa-installed-state-changed'));
  }, []);

  return {
    isInstallable,
    isInstalled,
    isIos,
    isOnline,
    promptInstall,
    markAsInstalled,
  };
}
