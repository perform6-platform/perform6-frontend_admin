import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'ui-button-primary',
  outline: 'ui-button-outline',
  ghost: 'ui-button-ghost',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-caption',
  md: 'h-10 px-4 text-body-sm',
  lg: 'h-11 px-5 text-body-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
        'disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface QuickActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
}

export function QuickActionButton({ icon, label, className, ...props }: QuickActionButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex flex-1 items-center justify-center gap-2 rounded-card border border-surface-border',
        'bg-surface px-4 py-3 text-body-sm font-medium text-brand-600 shadow-card transition-colors',
        'hover:border-brand-500/40 hover:bg-brand-50/50 dark:text-brand-400 dark:hover:bg-brand-600/10',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
        className,
      )}
      {...props}
    >
      <span className="text-brand-600 dark:text-brand-400">{icon}</span>
      {label}
    </button>
  );
}
