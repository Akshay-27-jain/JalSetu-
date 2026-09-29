import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from './ui/Button';

interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as React.ComponentType<{ className?: string }>;
    return <IconComponent className="h-8 w-8 text-slate-400 dark:text-slate-500" />;
  };

  const ActionIcon = action?.icon;

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-8 sm:p-12 text-center animate-fade-in ${className}`}
    >
      {icon && (
        <div className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          {renderIcon()}
        </div>
      )}
      <h3 className="font-display text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          <Button
            variant="primary"
            size="sm"
            onClick={action.onClick}
          >
            {ActionIcon && <ActionIcon className="h-3.5 w-3.5" />}
            <span>{action.label}</span>
          </Button>
        </div>
      )}
    </div>
  );
};
