import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X, Check, Shield } from 'lucide-react';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('jalsetu_cookie_consent');
    if (!consent) {
      // Delay slightly for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('jalsetu_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('jalsetu_cookie_consent', 'essential_only');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-40 animate-fade-in">
      <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Cookie className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Cookie & Telemetry Preferences</span>
              <Shield className="h-3 w-3 text-emerald-500" />
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              JalSetu uses cookies and local browser storage to keep you securely signed in, cache offline water usage telemetry, and personalize the Gemini AI Copilot. Read our{' '}
              <Link to="/privacy" className="text-blue-600 font-semibold hover:underline dark:text-blue-400">
                Privacy Policy
              </Link>{' '}
              for details.
            </p>

            <div className="mt-3.5 flex items-center gap-2">
              <button
                onClick={handleAccept}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" /> Accept All
              </button>

              <button
                onClick={handleDecline}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Essential Only
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
