import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Download,
  Smartphone,
  Check,
  Share2,
  PlusSquare,
  X,
  MoreVertical,
  Chrome,
  Apple,
  Laptop,
  Copy,
  Zap,
  Globe,
  Monitor,
  CheckCircle2,
} from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

interface PwaInstallButtonProps {
  variant?: 'navbar' | 'sidebar' | 'pill' | 'header-compact' | 'icon-only' | 'hero';
  className?: string;
}

export const PwaInstallButton: React.FC<PwaInstallButtonProps> = ({
  variant = 'navbar',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIos, promptInstall, markAsInstalled } = usePwaInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installStatusMsg, setInstallStatusMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-detect current device
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('desktop');
  const [detectedOS, setDetectedOS] = useState<string>('Desktop / Web');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setActiveTab('ios');
        setDetectedOS('iPhone / iPad (iOS)');
      } else if (/android/.test(ua)) {
        setActiveTab('android');
        setDetectedOS('Android Phone / Tablet');
      } else if (/macintosh|mac os x/.test(ua)) {
        setActiveTab('desktop');
        setDetectedOS('Mac OS');
      } else if (/windows/.test(ua)) {
        setActiveTab('desktop');
        setDetectedOS('Windows PC');
      } else {
        setActiveTab('desktop');
        setDetectedOS('Desktop / Browser');
      }
    }
  }, []);

  // Hide only if already running in true standalone app window
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Re-detect device on click
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setActiveTab('ios');
      } else if (/android/.test(ua)) {
        setActiveTab('android');
      } else {
        setActiveTab('desktop');
      }
    }

    if (isIos) {
      setShowInstallModal(true);
      return;
    }

    try {
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        markAsInstalled();
        setShowInstallModal(false);
      } else {
        setShowInstallModal(true);
      }
    } catch {
      setShowInstallModal(true);
    }
  };

  const handleModalDirectInstall = async () => {
    try {
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        markAsInstalled();
        setShowInstallModal(false);
      } else if (outcome === 'unsupported' || outcome === 'ios') {
        setInstallStatusMsg(
          activeTab === 'ios'
            ? 'Apple Safari requires using the Share button in your bottom toolbar.'
            : activeTab === 'desktop'
            ? 'Click the install icon (⊕ or ⬇) in your browser address bar above, or follow Step 1 & 2.'
            : 'Browser requires manual tap on Chrome menu (⋮) &rarr; "Install app".'
        );
        setTimeout(() => setInstallStatusMsg(null), 6000);
      } else {
        setInstallStatusMsg('Install prompt was closed. You can install anytime using the instructions below.');
        setTimeout(() => setInstallStatusMsg(null), 4000);
      }
    } catch {
      setInstallStatusMsg('Please follow the numbered steps below to install on this device.');
      setTimeout(() => setInstallStatusMsg(null), 4000);
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Render modal into document.body to avoid stacking context & clipping issues
  const renderModal = () => {
    if (!showInstallModal || typeof document === 'undefined') return null;

    return createPortal(
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
        onClick={() => setShowInstallModal(false)}
      >
        <div
          className="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl dark:bg-[#161F30] border border-slate-200 dark:border-slate-800 animate-scale-in max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setShowInstallModal(false)}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3.5 mb-4 pr-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-cyan-500 to-teal-400 text-white shadow-lg shadow-brand-500/30">
              {activeTab === 'desktop' ? <Laptop className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Install JalSetu App
                </h3>
                <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[9px] font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Detected Device: <strong className="text-brand-600 dark:text-cyan-400">{detectedOS}</strong>
              </p>
            </div>
          </div>

          {/* PRIMARY DIRECT INSTALL BUTTON */}
          <div className="mb-4">
            <button
              type="button"
              onClick={handleModalDirectInstall}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 via-cyan-600 to-teal-600 py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-lg shadow-brand-500/30 hover:scale-[1.01] hover:shadow-brand-500/40 active:scale-[0.99] transition-all cursor-pointer"
            >
              <Zap className="h-4 w-4 text-amber-300 animate-bounce" />
              <span>📲 Install JalSetu on {activeTab === 'desktop' ? 'PC / Laptop' : activeTab === 'ios' ? 'iPhone' : 'Android'}</span>
            </button>

            {installStatusMsg && (
              <div
                tabIndex={-1}
                className="mt-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 p-3 text-center text-xs text-amber-900 dark:text-amber-200 animate-fade-in font-medium"
              >
                💡 {installStatusMsg}
              </div>
            )}
          </div>

          {/* Device Tabs (Auto-Selected for Current Device) */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 mb-4 border border-slate-200/60 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('desktop')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'desktop'
                  ? 'bg-white dark:bg-[#0B1120] text-brand-600 dark:text-brand-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Laptop className="h-4 w-4" />
              <span>Desktop / PC</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('android')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'android'
                  ? 'bg-white dark:bg-[#0B1120] text-brand-600 dark:text-brand-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Chrome className="h-4 w-4" />
              <span>Android</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ios')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ios'
                  ? 'bg-white dark:bg-[#0B1120] text-brand-600 dark:text-brand-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Apple className="h-4 w-4" />
              <span>iPhone / iOS</span>
            </button>
          </div>

          {/* DESKTOP (Windows / Mac / Chrome / Edge) Instructions */}
          {activeTab === 'desktop' && (
            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-100 font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 text-[11px]">
                  1
                </div>
                <div>
                  Look for the <strong className="text-slate-900 dark:text-white">Install App icon (⊕ or ⬇)</strong> on the right side of your browser URL/address bar.
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-100 font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 text-[11px]">
                  2
                </div>
                <div>
                  Or open Chrome/Edge menu (<MoreVertical className="inline h-3.5 w-3.5 text-brand-600 mx-0.5" />) &rarr; <strong className="text-slate-900 dark:text-white">"Save and share"</strong> (or <strong className="text-slate-900 dark:text-white">"Apps"</strong>) &rarr; <strong className="text-slate-900 dark:text-white">"Install JalSetu"</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-100 font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 text-[11px]">
                  3
                </div>
                <div>
                  Click <strong className="text-slate-900 dark:text-white">Install</strong>. JalSetu opens in a dedicated window and adds a desktop shortcut icon!
                </div>
              </div>
            </div>
          )}

          {/* ANDROID Instructions */}
          {activeTab === 'android' && (
            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-100 font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 text-[11px]">
                  1
                </div>
                <div>
                  Tap the <strong className="text-slate-900 dark:text-white">3 dots menu</strong> (<MoreVertical className="inline h-3.5 w-3.5 text-brand-600 mx-0.5" />) in the top-right corner of Chrome browser.
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-100 font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 text-[11px]">
                  2
                </div>
                <div>
                  Tap <strong className="text-slate-900 dark:text-white">"Install app"</strong> or <strong className="text-slate-900 dark:text-white">"Add to Home screen"</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-100 font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 text-[11px]">
                  3
                </div>
                <div>
                  Tap <strong className="text-slate-900 dark:text-white">Install</strong>. The JalSetu icon appears on your phone home screen!
                </div>
              </div>
            </div>
          )}

          {/* IOS (iPhone / iPad) Instructions */}
          {activeTab === 'ios' && (
            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-100 font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 text-[11px]">
                  1
                </div>
                <div>
                  Tap the <strong className="text-slate-900 dark:text-white">Share button</strong> (<Share2 className="inline h-3.5 w-3.5 text-brand-600 mx-0.5" />) in your Safari bottom bar.
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-100 font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 text-[11px]">
                  2
                </div>
                <div>
                  Scroll down and tap <strong className="text-slate-900 dark:text-white"><PlusSquare className="inline h-3.5 w-3.5 text-brand-600 mx-0.5" /> Add to Home Screen</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-100 font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 text-[11px]">
                  3
                </div>
                <div>
                  Tap <strong className="text-slate-900 dark:text-white">Add</strong> in top right. JalSetu opens as a native fullscreen app!
                </div>
              </div>
            </div>
          )}

          {/* Copy Link Helper */}
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 border border-slate-200/60 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
              {window.location.href}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-[11px] font-bold text-brand-600 dark:text-cyan-400 hover:underline cursor-pointer shrink-0"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
            </button>
          </div>

          {/* Modal Bottom Actions */}
          <div className="mt-5 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                markAsInstalled();
                setShowInstallModal(false);
              }}
              className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-center text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition-all hover:opacity-95 cursor-pointer"
            >
              ✓ I've Installed It!
            </button>
            <button
              type="button"
              onClick={() => setShowInstallModal(false)}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      {/* 1. Header Compact Variant (Responsive for Mobile & Desktop) */}
      {variant === 'header-compact' && (
        <button
          onClick={handleInstallClick}
          className={`relative inline-flex items-center gap-1 sm:gap-1.5 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/15 via-teal-500/15 to-brand-500/15 px-2 sm:px-2.5 py-1.5 text-xs font-bold text-cyan-800 dark:text-cyan-300 shadow-sm transition-all hover:border-cyan-500/60 hover:bg-cyan-500/25 active:scale-95 cursor-pointer shrink-0 ${className}`}
          title="Install JalSetu App on Desktop / Mobile"
          aria-label="Install JalSetu App"
        >
          <Download className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 animate-pulse shrink-0" />
          <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap">
            <span className="sm:hidden">Install</span>
            <span className="hidden sm:inline">Install App</span>
          </span>
          <span className="rounded bg-cyan-600/20 dark:bg-cyan-400/20 px-1 py-0.2 text-[8px] sm:text-[9px] font-black uppercase text-cyan-700 dark:text-cyan-300">
            PWA
          </span>
        </button>
      )}

      {/* 2. Sidebar Variant */}
      {variant === 'sidebar' && (
        <button
          onClick={handleInstallClick}
          className={`group relative flex w-full items-center justify-between gap-2 overflow-hidden rounded-xl border border-brand-500/20 bg-gradient-to-r from-brand-600/10 via-cyan-500/10 to-teal-500/10 p-2.5 text-left transition-all hover:border-brand-500/40 hover:from-brand-600/20 hover:to-teal-500/20 active:scale-[0.99] cursor-pointer ${className}`}
          title="Install JalSetu App on Desktop or Mobile"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 text-white shadow-sm shadow-brand-500/30 group-hover:scale-105 transition-transform">
              <Download className="h-4 w-4 animate-bounce" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                  Install JalSetu
                </span>
                <span className="rounded-full bg-brand-500/20 px-1.5 py-0.2 text-[9px] font-extrabold text-brand-600 dark:text-brand-400">
                  PWA
                </span>
              </div>
              <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                Install as Desktop / Mobile App
              </p>
            </div>
          </div>
        </button>
      )}

      {/* 3. Icon-only Variant */}
      {variant === 'icon-only' && (
        <button
          onClick={handleInstallClick}
          className={`flex h-9 w-9 mx-auto items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 via-cyan-600 to-teal-600 text-white shadow-md shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer ${className}`}
          title="Install JalSetu App on Desktop or Mobile"
          aria-label="Install JalSetu App"
        >
          <Download className="h-4 w-4 animate-bounce" />
        </button>
      )}

      {/* 4. Navbar Standard Variant */}
      {variant === 'navbar' && (
        <button
          onClick={handleInstallClick}
          className={`relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-cyan-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 transition-all hover:scale-105 hover:shadow-brand-500/35 active:scale-95 cursor-pointer ${className}`}
        >
          <Download className="h-3.5 w-3.5 animate-pulse" />
          <span>Install App</span>
        </button>
      )}

      {/* 5. Pill Variant */}
      {variant === 'pill' && (
        <button
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 px-3 py-1.5 text-xs font-bold text-brand-600 dark:text-cyan-300 hover:bg-brand-500/20 transition-all cursor-pointer ${className}`}
          title="Install JalSetu App on Desktop or Mobile"
        >
          <Download className="h-3.5 w-3.5 text-brand-600 dark:text-cyan-400 animate-bounce" />
          <span>Install App (PWA)</span>
        </button>
      )}

      {/* 6. Hero Variant */}
      {variant === 'hero' && (
        <button
          onClick={handleInstallClick}
          className={`inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 border border-white/30 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:border-white/50 hover:bg-white/25 active:scale-95 shadow-lg cursor-pointer ${className}`}
          title="Install JalSetu App on Desktop or Mobile"
        >
          <Download className="h-4 w-4 text-cyan-300 animate-bounce" />
          <span>Install App (Desktop & Mobile)</span>
        </button>
      )}

      {renderModal()}
    </>
  );
};
