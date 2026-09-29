import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplets, Home, ArrowLeft, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getHomeRedirect = () => {
    if (!user) return '/';
    if (user.role === 'MAIN_ADMIN') return '/main-admin/dashboard';
    if (user.role === 'COMMUNITY_ADMIN') return '/community-admin/dashboard';
    return '/resident/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        {/* Background glow decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400 mb-6 shadow-sm">
          <Droplets className="h-10 w-10 animate-bounce" />
        </div>

        <span className="inline-block rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
          404 Error
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Water Pipe Disconnected!
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
          The page or water record you are looking for does not exist, has been moved, or the link is broken.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>

          <Link
            to={getHomeRedirect()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/20"
          >
            <Home className="h-4 w-4" /> Return to Dashboard
          </Link>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
          <span>Need assistance? Use the floating <strong>JalSetu AI Copilot</strong> at the bottom right.</span>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
