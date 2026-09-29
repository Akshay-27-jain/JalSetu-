import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, CheckCircle2, Info, X, ShieldAlert } from 'lucide-react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  showAlert: (message: string, title?: string, variant?: 'danger' | 'warning' | 'primary' | 'success') => Promise<void>;
}

const ConfirmDialogContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAlertMode, setIsAlertMode] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: 'Confirm Action',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger',
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions | string): Promise<boolean> => {
    const normalized: ConfirmOptions = typeof opts === 'string'
      ? { message: opts, title: 'Please Confirm', variant: 'danger' }
      : opts;

    setOptions({
      title: normalized.title || (normalized.variant === 'danger' ? 'Permanent Action' : 'Please Confirm'),
      message: normalized.message,
      confirmText: normalized.confirmText || (normalized.variant === 'danger' ? 'Delete Permanently' : 'Confirm'),
      cancelText: normalized.cancelText || 'Cancel',
      variant: normalized.variant || 'danger',
    });
    setIsAlertMode(false);
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const showAlert = useCallback((message: string, title = 'Notice', variant: 'danger' | 'warning' | 'primary' | 'success' = 'primary'): Promise<void> => {
    setOptions({
      title,
      message,
      confirmText: 'Got It',
      variant,
    });
    setIsAlertMode(true);
    setIsOpen(true);

    return new Promise<void>((resolve) => {
      resolverRef.current = () => resolve();
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  };

  // Keyboard shortcut listener
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      } else if (e.key === 'Enter') {
        handleConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const variantStyles = {
    danger: {
      iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60',
      buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25',
      icon: Trash2,
      accentBorder: 'border-rose-200 dark:border-rose-900/50',
    },
    warning: {
      iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/25',
      icon: AlertTriangle,
      accentBorder: 'border-amber-200 dark:border-amber-900/50',
    },
    primary: {
      iconBg: 'bg-brand-100 text-brand-700 dark:bg-brand-950/80 dark:text-brand-400 border border-brand-200 dark:border-brand-900/60',
      buttonBg: 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/25',
      icon: ShieldAlert,
      accentBorder: 'border-brand-200 dark:border-brand-900/50',
    },
    success: {
      iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25',
      icon: CheckCircle2,
      accentBorder: 'border-emerald-200 dark:border-emerald-900/50',
    },
  };

  const currentVariant = variantStyles[options.variant || 'danger'];
  const IconComponent = currentVariant.icon;

  return (
    <ConfirmDialogContext.Provider value={{ confirm, showAlert }}>
      {children}

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          {/* Backdrop dismiss */}
          <div
            className="fixed inset-0"
            onClick={handleCancel}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 shadow-2xl animate-scale-in p-6 sm:p-7 text-left"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            {/* Top Close Button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header: Icon + Title */}
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${currentVariant.iconBg} shadow-sm`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <div className="min-w-0 pr-4">
                <h3
                  id="confirm-dialog-title"
                  className="font-display text-lg font-bold text-slate-900 dark:text-white leading-snug"
                >
                  {options.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                  {options.message}
                </p>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-7 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              {!isAlertMode && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  {options.cancelText || 'Cancel'}
                </button>
              )}
              <button
                type="button"
                autoFocus
                onClick={handleConfirm}
                className={`rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${currentVariant.buttonBg}`}
              >
                {options.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ConfirmDialogContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context;
};
