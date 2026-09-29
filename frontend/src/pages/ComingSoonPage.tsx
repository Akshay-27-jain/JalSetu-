import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComingSoonPageProps {
  featureName?: string;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ featureName = 'Feature' }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-card space-y-4 my-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 shadow-sm">
        <Construction className="h-8 w-8 stroke-[1.8]" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="font-display text-xl font-bold text-slate-900">
          {featureName} Module
        </h3>
        <p className="text-xs text-slate-500">
          This automated module is scheduled for the next phase in the JalSetu roadmap. Core meter tracking & billing engines are currently active.
        </p>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
};
