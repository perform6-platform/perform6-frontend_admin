import { Pencil } from 'lucide-react';
import type { RotationScheduleRow } from '../../constants/rotationSchedule';
import {
  rotationColumnGroups,
  rotationFlatColumns,
} from '../../constants/rotationSchedule';
import { cn } from '../../lib/cn';
import { Button, IconButton } from '../ui';
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
  isEditing?: boolean;
  onEditDay?: (day: number) => void;
}

function isColumnVisible(key: string, viewFilter: RotationScheduleTableProps['viewFilter']): boolean {
  if (!viewFilter || viewFilter === 'all') return true;
  if (viewFilter === 'rotation') {
    return !['day', 'date', 'defaultFitness', 'defaultGolf', 'startHereFitness', 'startHereGolf'].includes(
      key,
    );
  }
  if (viewFilter === 'fitness') {
    return !['phase1GolfWall', 'phase1GolfNoWall', 'defaultGolf', 'startHereGolf'].includes(key);
  }
  if (viewFilter === 'golf') {
    return !['phase1FitnessWall', 'phase1FitnessNoWall', 'defaultFitness', 'startHereFitness'].includes(key);
  }
  return true;
}

function getColumnMeta(key: string) {
  for (const group of rotationColumnGroups) {
    const column = group.columns.find((entry) => entry.key === key);
    if (column) {
      return { label: column.label, group: group.label || undefined };
    }
  }
  return { label: key, group: undefined };
}

function RotationScheduleMobileCard({
  row,
  visibleColumns,
  isEditing,
  onEditDay,
}: {
  row: RotationScheduleRow;
  visibleColumns: typeof rotationFlatColumns;
  isEditing?: boolean;
  onEditDay?: (day: number) => void;
}) {
  if (row.isEllipsis) {
    return (
      <div className="rounded-lg border border-dashed border-surface-border bg-surface-muted/30 px-4 py-3 text-center text-body-sm text-content-muted">
        … more days in schedule …
      </div>
    );
  }

  return (
    <article className="rounded-lg border border-surface-border bg-surface p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-content-primary">{row.dayLabel}</p>
          <p className="text-caption text-content-muted">{row.dateLabel}</p>
        </div>
        {isEditing && onEditDay && (
          <Button size="sm" variant="outline" className="h-8 shrink-0 gap-1.5 px-3" onClick={() => onEditDay(row.day)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
      </div>
      <dl className="space-y-2">
        {visibleColumns
          .filter((column) => !['day', 'date'].includes(column.key))
          .map((column) => {
            const meta = getColumnMeta(column.key);
            return (
              <div key={column.key} className="grid grid-cols-1 gap-0.5 sm:grid-cols-[minmax(0,9rem)_1fr] sm:gap-3">
                <dt className="text-caption font-medium text-content-muted">
                  {meta.group ? `${meta.group} · ${meta.label}` : meta.label}
                </dt>
                <dd className="break-all text-body-sm text-content-primary">
                  {row[column.key as ColumnKey] as string}
                </dd>
              </div>
            );
          })}
      </dl>
    </article>
  );
}

export function RotationScheduleTable({
  rows,
  viewFilter = 'all',
  isEditing = false,
  onEditDay,
}: RotationScheduleTableProps) {
  const visibleColumns = rotationFlatColumns.filter((column) => isColumnVisible(column.key, viewFilter));
  const showActions = isEditing && onEditDay;

  return (
    <div className={cn(CARD_SURFACE_CLASS, 'overflow-hidden p-0')}>
      {isEditing && (
        <div className="border-b border-surface-border bg-brand-50/50 px-4 py-2.5 text-body-sm text-brand-700 dark:bg-brand-600/10 dark:text-brand-300">
          Edit mode — tap Edit on any day to update video assignments.
        </div>
      )}

      <div className="space-y-3 p-4 lg:hidden">
        {rows.map((row) => (
          <RotationScheduleMobileCard
            key={row.id}
            row={row}
            visibleColumns={visibleColumns}
            isEditing={isEditing}
            onEditDay={onEditDay}
          />
        ))}
      </div>

      <div className="hidden lg:block">
        <p className="scroll-hint px-4 pt-3 text-caption text-content-muted xl:hidden">
          Swipe horizontally to view all columns →
        </p>
        <div className="table-scroll-x overflow-x-auto">
          <table className="rotation-schedule-table w-full min-w-[960px] border-collapse text-left xl:min-w-[1200px]">
            <thead>
              <tr>
                {showActions && (
                  <th className="rotation-schedule-header-neutral w-12 px-2 py-2.5 text-section-label font-semibold uppercase text-white">
                    Edit
                  </th>
                )}
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
                  {showActions && (
                    <td className="px-2 py-2.5 text-center">
                      {row.isEllipsis ? (
                        <span className="text-content-muted">…</span>
                      ) : (
                        <IconButton
                          label={`Edit Day ${row.day}`}
                          className="mx-auto h-8 w-8"
                          onClick={() => onEditDay(row.day)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </IconButton>
                      )}
                    </td>
                  )}
                  {visibleColumns.map((column) => (
                    <td
                      key={column.key}
                      className="max-w-[180px] truncate px-3 py-2.5 text-body-sm text-content-primary xl:max-w-none xl:whitespace-nowrap"
                      title={row[column.key as ColumnKey] as string}
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
    </div>
  );
}
