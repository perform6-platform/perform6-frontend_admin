import type { LucideIcon } from 'lucide-react';
import { Activity, Dumbbell, Flag, Layers, Target } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RotationScheduleRow } from '../../constants/rotationSchedule';
import { currentRotationDay } from '../../constants/rotationSchedule';
import { useRotationSchedule } from '../../context/RotationScheduleContext';
import { useGlobalRotation } from '../../hooks/useRotation';
import { mapGlobalRotationToScheduleRow } from '../../lib/rotationMapper';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

type RotationAccent = 'slate' | 'blue' | 'teal' | 'purple' | 'gold';

interface RotationItem {
  title: string;
  subtitle: string;
  accent: RotationAccent;
  icon: LucideIcon;
}

const accentStyles: Record<RotationAccent, string> = {
  slate: 'bg-gradient-to-br from-p6-gray-700 to-p6-gray-900',
  blue: 'bg-gradient-to-br from-brand-500 to-brand-600',
  teal: 'bg-gradient-to-br from-p6-golf-text to-[#1f4a30]',
  purple: 'bg-gradient-to-br from-brand-600 to-brand-900',
  gold: 'bg-gradient-to-br from-status-warning to-[#e8892e]',
};

function buildUpcomingItems(row: RotationScheduleRow | undefined): RotationItem[] {
  if (!row) return [];

  return [
    { title: 'Phase 1 — Fitness (Wall)', subtitle: row.phase1FitnessWall, accent: 'teal', icon: Dumbbell },
    {
      title: 'Phase 1 — Fitness (No Wall)',
      subtitle: row.phase1FitnessNoWall,
      accent: 'teal',
      icon: Activity,
    },
    { title: 'Phase 1 — Golf (Wall)', subtitle: row.phase1GolfWall, accent: 'blue', icon: Flag },
    { title: 'Phase 1 — Golf (No Wall)', subtitle: row.phase1GolfNoWall, accent: 'blue', icon: Target },
    { title: 'Phase 2', subtitle: row.phase2, accent: 'purple', icon: Layers },
    { title: 'Full Program', subtitle: row.fullProgram, accent: 'gold', icon: Layers },
  ];
}

export interface UpcomingRotationCardProps {
  day?: number;
}

export function UpcomingRotationCard({ day }: UpcomingRotationCardProps) {
  const navigate = useNavigate();
  const { getRowByDay, isLoading: isScheduleLoading } = useRotationSchedule();
  const { data: globalRotation, isLoading: isCurrentLoading } = useGlobalRotation();

  const rotationDay = day ?? globalRotation?.rotationDay ?? currentRotationDay;
  const row = useMemo(() => {
    if (globalRotation && !day) {
      return mapGlobalRotationToScheduleRow(globalRotation, rotationDay);
    }
    return getRowByDay(rotationDay);
  }, [day, getRowByDay, globalRotation, rotationDay]);

  const items = useMemo(() => buildUpcomingItems(row), [row]);
  const isLoading = isScheduleLoading || isCurrentLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Rotation</CardTitle>
        <div className="mt-2">
          <p className="text-xl font-bold text-content-primary sm:text-2xl">
            {isLoading ? '…' : `DAY ${rotationDay}`}
          </p>
          <p className="text-caption text-content-muted">{row?.dateLabel ?? '—'}</p>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.title}
                className={cn(
                  'flex items-center gap-3 rounded-lg border border-surface-border bg-surface-muted p-3',
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white shadow-sm',
                    accentStyles[item.accent],
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-semibold text-content-primary">{item.title}</p>
                  <p className="truncate text-caption text-content-muted">{item.subtitle}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <Button
          variant="outline"
          fullWidth
          className="mt-4 border-surface-border font-semibold"
          onClick={() => navigate('/rotation-schedule')}
        >
          View Full Schedule
        </Button>
      </CardContent>
    </Card>
  );
}
