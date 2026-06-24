import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  variant: ToastVariant;
}

export interface ShowToastOptions {
  title: string;
  message?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: ShowToastOptions) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<
  ToastVariant,
  { container: string; icon: string; Icon: typeof CheckCircle2 }
> = {
  success: {
    container: 'border-emerald-500/25 bg-emerald-50 dark:bg-emerald-950/40',
    icon: 'text-emerald-600 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  error: {
    container: 'border-red-500/25 bg-red-50 dark:bg-red-950/40',
    icon: 'text-red-600 dark:text-red-400',
    Icon: XCircle,
  },
  warning: {
    container: 'border-amber-500/25 bg-amber-50 dark:bg-amber-950/40',
    icon: 'text-amber-600 dark:text-amber-400',
    Icon: TriangleAlert,
  },
  info: {
    container: 'border-brand-500/25 bg-brand-50 dark:bg-brand-950/40',
    icon: 'text-brand-600 dark:text-brand-400',
    Icon: Info,
  },
};

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:top-6"
    >
      {toasts.map((toast) => {
        const style = variantStyles[toast.variant];
        const Icon = style.Icon;

        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto w-full max-w-sm rounded-card border border-surface-border/60 p-4 shadow-card transition-all duration-300',
              'bg-surface',
              style.container,
            )}
          >
            <div className="flex items-start gap-3">
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', style.icon)} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-body-sm font-semibold text-content-primary">{toast.title}</p>
                {toast.message && (
                  <p className="mt-1 text-caption text-content-secondary">{toast.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className={cn(
                  'shrink-0 rounded-md p-1 text-content-muted transition-colors',
                  'hover:bg-surface-muted hover:text-content-primary',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
                )}
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, variant = 'info', duration = 5000 }: ShowToastOptions) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setToasts((current) => [...current, { id, title, message, variant }]);

      if (duration > 0) {
        window.setTimeout(() => dismissToast(id), duration);
      }
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
