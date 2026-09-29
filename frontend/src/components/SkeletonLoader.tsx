import React from 'react';

export const SkeletonText: React.FC<{ className?: string }> = ({ className = 'h-4 w-24' }) => (
  <div className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 ${className}`} />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#131B2E] p-6 shadow-card space-y-4 animate-pulse ${className}`}
  >
    <div className="flex items-center justify-between">
      <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
    </div>
    <div className="h-8 w-36 rounded-lg bg-slate-200 dark:bg-slate-800" />
    <div className="h-3 w-44 rounded bg-slate-100 dark:bg-slate-800/60" />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#131B2E] shadow-card">
    <div className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/50 p-4">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    </div>
    <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-3.5 px-3">
          {Array.from({ length: columns }).map((_, c) => (
            <div
              key={c}
              className={`h-4 flex-1 rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse ${
                c === 0 ? 'w-1/3' : 'w-full'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);
