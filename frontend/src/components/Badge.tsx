import React from 'react';

export type BadgeVariant =
  | 'normal'
  | 'overuse'
  | 'billing'
  | 'supply'
  | 'anomaly'
  | 'neutral'
  | 'admin'
  | 'disabled'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'normal',
  children,
  size = 'md',
  dot = false,
  className = '',
}) => {
  const styles: Record<BadgeVariant, string> = {
    normal: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80',
    overuse: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/80',
    billing: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/80',
    supply: 'bg-orange-50 text-orange-700 border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/80',
    anomaly: 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/80',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/90 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700',
    disabled: 'bg-slate-100 text-slate-500 border-slate-200/80 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/60',
    admin: 'bg-brand-50 text-brand-700 border-brand-200/80 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-800/80',
    info: 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/80',
  };

  const dots: Record<BadgeVariant, string> = {
    normal: 'bg-emerald-500',
    success: 'bg-emerald-500',
    overuse: 'bg-rose-500',
    danger: 'bg-rose-500',
    billing: 'bg-amber-500',
    warning: 'bg-amber-500',
    supply: 'bg-orange-500',
    anomaly: 'bg-purple-500',
    neutral: 'bg-slate-400',
    disabled: 'bg-slate-400',
    admin: 'bg-brand-500',
    info: 'bg-sky-500',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium tracking-tight',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-tight',
    lg: 'text-sm px-3 py-1.5 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors shadow-2xs ${styles[variant]} ${sizes[size]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dots[variant]}`} />}
      {children}
    </span>
  );
};
