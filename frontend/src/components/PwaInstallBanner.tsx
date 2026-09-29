import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, X, Sparkles, Smartphone, Monitor, Waves, Share2, PlusSquare } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

export const PwaInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIos, promptInstall } = usePwaInstall();
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('jalsetu_pwa_banner_dismissed') === 'true';
  });
  const [showIosModal, setShowIosModal] = useState(false);

  // If already installed or dismissed, do not render banner
  if (isInstalled || dismissed || !isInstallable) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('jalsetu_pwa_banner_dismissed', 'true');
  };

  const handleInstall = async () => {
    if (isIos) {
      setShowIosModal(true);
      return;
    }
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      setDismissed(true);
    } else if (outcome === 'ios') {
      setShowIosModal(true);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-40 md:bottom-6 md:left-auto md:right-6 md:max-w-md animate-fade-in">
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-cyan-500/20 dark:bg-slate-900/95 dark:text-white">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-cyan-500 to-teal-400" />

          <button
            onClick={handleDismiss}
            className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-cyan-500 to-teal-400 text-white shadow-md shadow-brand-500/25">
              <Waves className="h-6 w-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Install JalSetu App</h4>
                <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.2 text-[9px] font-black text-cyan-600 dark:text-cyan-400">
                  FREE
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-snug">
                Install as a standalone app on your Desktop or Mobile for instant access and offline water tracking.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleInstall}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 via-cyan-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 transition-all hover:opacity-95 active:scale-95 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Install App</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Safari Instruction Modal */}
      {showIosModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowIosModal(false)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-cyan-500 to-teal-400 text-white shadow-lg shadow-brand-500/30">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Install on iOS</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Add JalSetu to Home Screen</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-100 font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 text-[11px]">
                    1
                  </div>
                  <div>
                    Tap the <strong className="text-slate-900 dark:text-white">Share button</strong> (
                    <Share2 className="inline h-3.5 w-3.5 text-brand-600 mx-0.5" />) in your Safari toolbar at the bottom.
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-100 font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 text-[11px]">
                    2
                  </div>
                  <div>
                    Scroll down and tap{' '}
                    <strong className="text-slate-900 dark:text-white">
                      <PlusSquare className="inline h-3.5 w-3.5 text-brand-600 mx-0.5" /> Add to Home Screen
                    </strong>
                    .
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-100 font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 text-[11px]">
                    3
                  </div>
                  <div>
                    Tap <strong className="text-slate-900 dark:text-white">Add</strong> in the top right corner. JalSetu will now launch as a fullscreen native app!
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIosModal(false)}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 py-2.5 text-center text-xs font-bold text-white shadow-md shadow-brand-500/25 transition-all hover:opacity-95"
              >
                Got it!
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
