import type { RotationScheduleRow } from '../../constants/rotationSchedule';
import { rotationColumnGroups, rotationFlatColumns } from '../../constants/rotationSchedule';
import { cn } from '../../lib/cn';
import { CARD_SURFACE_CLASS } from '../ui/cardStyles';

const headerToneStyles = {
  neutral: 'rotation-schedule-header-neutral',
  slate: 'rotation-schedule-header-slate',
  blue: 'rotation-schedule-header-blue',
  teal: 'rotation-schedule-header-teal',
  purple: 'rotation-schedule-header-purple',
  gold: 'rotation-schedule-header-gold',
} as const;

type ColumnKey = keyof Omit<RotationScheduleRow, 'id' | 'isEllipsis'>;

export interface RotationScheduleTableProps {
  rows: RotationScheduleRow[];
  viewFilter?: 'all' | 'fitness' | 'golf' | 'rotation';
}

function isColumnVisible(key: string, viewFilter: RotationScheduleTableProps['viewFilter']): boolean {
  if (!viewFilter || viewFilter === 'all') return true;
  if (viewFilter === 'rotation') {
    return !['day', 'date', 'defaultFitness', 'defaultGolf', 'startHereFitness', 'startHereGolf'].includes(key);
  }
  if (viewFilter === 'fitness') {
    return !['phase1GolfWall', 'phase1GolfNoWall', 'defaultGolf', 'startHereGolf'].includes(key);
  }
  if (viewFilter === 'golf') {
    return !['phase1FitnessWall', 'phase1FitnessNoWall', 'defaultFitness', 'startHereFitness'].includes(key);
  }
  return true;
}

export function RotationScheduleTable({ rows, viewFilter = 'all' }: RotationScheduleTableProps) {
  const visibleColumns = rotationFlatColumns.filter((column) => isColumnVisible(column.key, viewFilter));

  return (
    <div className={cn(CARD_SURFACE_CLASS, 'overflow-hidden p-0')}>
      <div className="overflow-x-auto">
        <table className="rotation-schedule-table w-full min-w-[1200px] border-collapse text-left">
          <thead>
            <tr>
              {rotationColumnGroups.map((group) => {
                const groupColumns = group.columns.filter((column) =>
                  isColumnVisible(column.key, viewFilter),
                );
                if (groupColumns.length === 0) return null;

                return groupColumns.map((column, index) => (
                  <th
                    key={column.key}
                    colSpan={1}
                    className={cn(
                      'whitespace-nowrap px-3 py-2.5 text-section-label font-semibold uppercase text-white',
                      headerToneStyles[column.tone],
                      index === 0 && group.label ? 'border-l border-white/10' : undefined,
                    )}
                  >
                    {group.label && index === 0 ? (
                      <span className="block text-[10px] font-medium normal-case opacity-80">
                        {group.label}
                      </span>
                    ) : null}
                    <span>{column.label}</span>
                  </th>
                ));
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  'border-b border-surface-border transition-colors',
                  row.isEllipsis ? 'bg-surface-muted/30' : 'hover:bg-surface-muted/25',
                )}
              >
                {visibleColumns.map((column) => (
                  <td
                    key={column.key}
                    className="px-3 py-2.5 text-body-sm text-content-primary"
                  >
                    {row[column.key as ColumnKey] as string}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
