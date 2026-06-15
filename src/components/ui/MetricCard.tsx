import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { CARD_SURFACE_CLASS } from './cardStyles';
import { SectionLabel } from './Card';

type MetricAccent = 'brand' | 'success' | 'warning' | 'neutral';

const accentClass: Record<MetricAccent, string> = {
  brand: 'metric-icon--brand',
  success: 'metric-icon--success',
  warning: 'metric-icon--warning',
  neutral: 'metric-icon--neutral',
};

export interface MetricCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: ReactNode;
  accent?: MetricAccent;
  className?: string;
}

export function MetricCard({
  label,
  value,
  subtext,
  icon,
  accent = 'brand',
  className,
}: MetricCardProps) {
  return (
    <div className={cn(CARD_SURFACE_CLASS, 'p-4 sm:p-5', className)}>
      <div className={cn('metric-icon [&_svg]:h-5 [&_svg]:w-5', accentClass[accent])}>{icon}</div>
      <SectionLabel className="block">{label}</SectionLabel>
      <p className="mt-1 text-metric-value text-content-primary">{value}</p>
      <p className="mt-0.5 text-metric-label text-content-muted">{subtext}</p>
    </div>
  );
}
