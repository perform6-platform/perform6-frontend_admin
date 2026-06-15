import { Play } from 'lucide-react';
import type { ProgramAccent, ProgramPhaseCard } from '../../constants/programs';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/cn';

type AccentStyle = {
  title: string;
  border: string;
  icon: string;
  cardBackground: string;
  buttonGradient: string;
  buttonBorder: string;
  buttonShadow: string;
  imageOverlay: string;
  imageBrightness: string;
};

const darkAccentStyles: Record<ProgramAccent, AccentStyle> = {
  slate: {
    title: '#94a3b8',
    border: 'rgba(148, 163, 184, 0.45)',
    icon: '#94a3b8',
    cardBackground:
      'linear-gradient(180deg, rgba(148, 163, 184, 0.1) 0%, rgba(10, 14, 20, 0.98) 38%, rgba(6, 10, 16, 1) 100%)',
    buttonGradient:
      'linear-gradient(135deg, #1e293b 0%, #334155 30%, #475569 58%, #64748b 82%, #94a3b8 100%)',
    buttonBorder: 'rgba(148, 163, 184, 0.4)',
    buttonShadow: '0 4px 14px rgba(100, 116, 139, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.16)',
    imageOverlay: 'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.25), rgba(0,0,0,0.1))',
    imageBrightness: 'brightness-[0.72] contrast-[1.08] saturate-[0.85]',
  },
  cyan: {
    title: '#22d3ee',
    border: 'rgba(34, 211, 238, 0.55)',
    icon: '#22d3ee',
    cardBackground:
      'linear-gradient(180deg, rgba(34, 211, 238, 0.12) 0%, rgba(6, 14, 24, 0.98) 38%, rgba(4, 10, 18, 1) 100%)',
    buttonGradient:
      'linear-gradient(135deg, #003844 0%, #005f73 28%, #0a9396 58%, #00bcd4 82%, #22d3ee 100%)',
    buttonBorder: 'rgba(34, 211, 238, 0.5)',
    buttonShadow: '0 4px 14px rgba(34, 211, 238, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.18)',
    imageOverlay: 'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.25), rgba(0,0,0,0.1))',
    imageBrightness: 'brightness-[0.72] contrast-[1.08] saturate-[0.85]',
  },
  teal: {
    title: '#2dd4bf',
    border: 'rgba(45, 212, 191, 0.5)',
    icon: '#2dd4bf',
    cardBackground:
      'linear-gradient(180deg, rgba(45, 212, 191, 0.11) 0%, rgba(6, 16, 20, 0.98) 38%, rgba(4, 12, 16, 1) 100%)',
    buttonGradient:
      'linear-gradient(135deg, #0a3d38 0%, #0f5c54 30%, #0d9488 58%, #14b8a6 82%, #2dd4bf 100%)',
    buttonBorder: 'rgba(45, 212, 191, 0.45)',
    buttonShadow: '0 4px 14px rgba(20, 184, 166, 0.26), inset 0 1px 0 rgba(255, 255, 255, 0.16)',
    imageOverlay: 'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.25), rgba(0,0,0,0.1))',
    imageBrightness: 'brightness-[0.72] contrast-[1.08] saturate-[0.85]',
  },
  purple: {
    title: '#a78bfa',
    border: 'rgba(167, 139, 250, 0.5)',
    icon: '#a78bfa',
    cardBackground:
      'linear-gradient(180deg, rgba(139, 92, 246, 0.14) 0%, rgba(12, 8, 28, 0.98) 38%, rgba(8, 6, 22, 1) 100%)',
    buttonGradient:
      'linear-gradient(135deg, #2e1065 0%, #4c1d95 28%, #6d28d9 56%, #7c3aed 78%, #a78bfa 100%)',
    buttonBorder: 'rgba(167, 139, 250, 0.45)',
    buttonShadow: '0 4px 14px rgba(124, 58, 237, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.16)',
    imageOverlay: 'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.25), rgba(0,0,0,0.1))',
    imageBrightness: 'brightness-[0.72] contrast-[1.08] saturate-[0.85]',
  },
  gold: {
    title: '#fbbf24',
    border: 'rgba(251, 191, 36, 0.5)',
    icon: '#fbbf24',
    cardBackground:
      'linear-gradient(180deg, rgba(245, 158, 11, 0.12) 0%, rgba(18, 12, 4, 0.98) 38%, rgba(12, 8, 2, 1) 100%)',
    buttonGradient:
      'linear-gradient(135deg, #451a03 0%, #78350f 26%, #b45309 54%, #d97706 78%, #fbbf24 100%)',
    buttonBorder: 'rgba(251, 191, 36, 0.45)',
    buttonShadow: '0 4px 14px rgba(217, 119, 6, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.18)',
    imageOverlay: 'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.25), rgba(0,0,0,0.1))',
    imageBrightness: 'brightness-[0.72] contrast-[1.08] saturate-[0.85]',
  },
};

const lightAccentStyles: Record<ProgramAccent, AccentStyle> = {
  slate: {
    title: '#64748b',
    border: 'rgba(100, 116, 139, 0.4)',
    icon: '#64748b',
    cardBackground:
      'linear-gradient(180deg, rgba(148, 163, 184, 0.18) 0%, rgba(248, 250, 252, 0.95) 28%, #ffffff 100%)',
    buttonGradient:
      'linear-gradient(135deg, #334155 0%, #475569 45%, #64748b 78%, #94a3b8 100%)',
    buttonBorder: 'rgba(100, 116, 139, 0.3)',
    buttonShadow: '0 4px 12px rgba(100, 116, 139, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.55)',
    imageOverlay: 'linear-gradient(to top, rgba(0,0,0,0.35), rgba(0,0,0,0.08), transparent)',
    imageBrightness: 'brightness-[0.94] contrast-[1.02] saturate-[0.95]',
  },
  cyan: {
    title: '#06b6d4',
    border: 'rgba(6, 182, 212, 0.45)',
    icon: '#06b6d4',
    cardBackground:
      'linear-gradient(180deg, rgba(34, 211, 238, 0.22) 0%, rgba(236, 254, 255, 0.95) 28%, #ffffff 100%)',
    buttonGradient:
      'linear-gradient(135deg, #0891b2 0%, #06b6d4 45%, #22d3ee 78%, #67e8f9 100%)',
    buttonBorder: 'rgba(6, 182, 212, 0.35)',
    buttonShadow: '0 4px 12px rgba(6, 182, 212, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.55)',
    imageOverlay: 'linear-gradient(to top, rgba(0,0,0,0.35), rgba(0,0,0,0.08), transparent)',
    imageBrightness: 'brightness-[0.94] contrast-[1.02] saturate-[0.95]',
  },
  teal: {
    title: '#14b8a6',
    border: 'rgba(20, 184, 166, 0.42)',
    icon: '#14b8a6',
    cardBackground:
      'linear-gradient(180deg, rgba(45, 212, 191, 0.2) 0%, rgba(240, 253, 250, 0.95) 28%, #ffffff 100%)',
    buttonGradient:
      'linear-gradient(135deg, #0f766e 0%, #14b8a6 45%, #2dd4bf 78%, #5eead4 100%)',
    buttonBorder: 'rgba(20, 184, 166, 0.32)',
    buttonShadow: '0 4px 12px rgba(20, 184, 166, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.55)',
    imageOverlay: 'linear-gradient(to top, rgba(0,0,0,0.35), rgba(0,0,0,0.08), transparent)',
    imageBrightness: 'brightness-[0.94] contrast-[1.02] saturate-[0.95]',
  },
  purple: {
    title: '#8b5cf6',
    border: 'rgba(139, 92, 246, 0.42)',
    icon: '#8b5cf6',
    cardBackground:
      'linear-gradient(180deg, rgba(167, 139, 250, 0.2) 0%, rgba(245, 243, 255, 0.95) 28%, #ffffff 100%)',
    buttonGradient:
      'linear-gradient(135deg, #6d28d9 0%, #7c3aed 42%, #8b5cf6 72%, #a78bfa 100%)',
    buttonBorder: 'rgba(139, 92, 246, 0.32)',
    buttonShadow: '0 4px 12px rgba(124, 58, 237, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.55)',
    imageOverlay: 'linear-gradient(to top, rgba(0,0,0,0.35), rgba(0,0,0,0.08), transparent)',
    imageBrightness: 'brightness-[0.94] contrast-[1.02] saturate-[0.95]',
  },
  gold: {
    title: '#d97706',
    border: 'rgba(217, 119, 6, 0.42)',
    icon: '#d97706',
    cardBackground:
      'linear-gradient(180deg, rgba(251, 191, 36, 0.22) 0%, rgba(255, 251, 235, 0.95) 28%, #ffffff 100%)',
    buttonGradient:
      'linear-gradient(135deg, #b45309 0%, #d97706 42%, #f59e0b 72%, #fbbf24 100%)',
    buttonBorder: 'rgba(217, 119, 6, 0.32)',
    buttonShadow: '0 4px 12px rgba(217, 119, 6, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.55)',
    imageOverlay: 'linear-gradient(to top, rgba(0,0,0,0.35), rgba(0,0,0,0.08), transparent)',
    imageBrightness: 'brightness-[0.94] contrast-[1.02] saturate-[0.95]',
  },
};

export interface ProgramPhaseCardProps {
  program: ProgramPhaseCard;
  onManage?: (route: string) => void;
}

export function ProgramPhaseCardView({ program, onManage }: ProgramPhaseCardProps) {
  const { isDark } = useTheme();
  const accent = isDark ? darkAccentStyles[program.accent] : lightAccentStyles[program.accent];
  const videoLabel = program.videoCount === 1 ? '1 Video' : `${program.videoCount} Videos`;

  return (
    <article
      className={cn(
        'overflow-hidden rounded-xl',
        isDark ? 'shadow-card' : 'shadow-[0_2px_12px_rgba(15,23,42,0.08)]',
      )}
      style={{
        border: `1px solid ${accent.border}`,
        background: accent.cardBackground,
        borderRadius: '12px',
      }}
    >
      <div className="p-4">
        <h3
          className="text-section-label font-bold uppercase tracking-[0.08em]"
          style={{ color: accent.title }}
        >
          {program.title}
        </h3>

        <div
          className={cn(
            'relative mt-3 overflow-hidden rounded-lg border',
            isDark ? 'border-white/5' : 'border-surface-border',
          )}
        >
          <div className={cn('aspect-[16/10] w-full', isDark ? 'bg-black/40' : 'bg-surface-muted')}>
            <img
              src={program.thumbnailUrl}
              alt={program.title}
              className={cn('h-full w-full object-cover', accent.imageBrightness)}
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0" style={{ background: accent.imageOverlay }} />
        </div>

        <p
          className={cn(
            'mt-3 text-body-sm leading-relaxed',
            isDark ? 'text-content-primary/90' : 'text-content-secondary',
          )}
        >
          {program.description}
        </p>

        <div className="mt-2.5 flex items-center gap-1.5 text-caption font-medium">
          <Play className="h-3.5 w-3.5 shrink-0" style={{ color: accent.icon }} />
          <span style={{ color: accent.icon }}>{videoLabel}</span>
        </div>

        <button
          type="button"
          className={cn(
            'mt-4 flex h-9 w-full items-center justify-center rounded-lg',
            'text-sm font-semibold text-white transition-all',
            'hover:brightness-110 active:scale-[0.99]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30',
          )}
          style={{
            background: accent.buttonGradient,
            border: `1px solid ${accent.buttonBorder}`,
            boxShadow: accent.buttonShadow,
          }}
          onClick={() => onManage?.(program.manageRoute)}
        >
          Manage
        </button>
      </div>
    </article>
  );
}
