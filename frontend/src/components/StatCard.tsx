import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon | React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: 'normal' | 'billing' | 'overuse' | 'supply' | string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-brand-50 dark:bg-brand-950/50',
  iconColor = 'text-brand-600 dark:text-brand-400',
  trend,
  variant,
  className = '',
}) => {
  const { t } = useLanguage();

  // Variant auto-theming if specific variant provided and iconBgColor is default
  let resolvedBg = iconBgColor;
  let resolvedColor = iconColor;
  if (variant === 'billing') {
    resolvedBg = 'bg-amber-50 dark:bg-amber-950/50';
    resolvedColor = 'text-amber-600 dark:text-amber-400';
  } else if (variant === 'overuse') {
    resolvedBg = 'bg-rose-50 dark:bg-rose-950/50';
    resolvedColor = 'text-rose-600 dark:text-rose-400';
  } else if (variant === 'supply') {
    resolvedBg = 'bg-sky-50 dark:bg-sky-950/50';
    resolvedColor = 'text-sky-600 dark:text-sky-400';
  }

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as React.ComponentType<{ className?: string }>;
    return <IconComponent className={`h-5 w-5 ${resolvedColor}`} />;
  };

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#131B2E] p-5 sm:p-6 shadow-card transition-all duration-200 hover:shadow-card-hover hover:border-slate-300 dark:hover:border-slate-700/80 min-h-[124px] ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {t(title, title)}
          </p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl tabular-nums">
              {value}
            </h3>
            {trend && (
              <span
                className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                  trend.isPositive
                    ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/50'
                    : 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed truncate">
              {t(subtitle, subtitle)}
            </p>
          )}
        </div>

        {icon && (
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/5 dark:ring-white/10 ${resolvedBg}`}>
            {renderIcon()}
          </div>
        )}
      </div>
    </div>
  );
};
