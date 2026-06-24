import { Eye, Pencil } from 'lucide-react';
import type { RotationScheduleRow, RotationScheduleColumnKey } from '../../constants/rotationSchedule';
import {
  getRotationScheduleCellValue,
  rotationColumnGroups,
  rotationFlatColumns,
} from '../../constants/rotationSchedule';
import { cn } from '../../lib/cn';
import { IconButton } from '../ui';
import { CARD_SURFACE_CLASS } from '../ui/cardStyles';

const SCHEDULE_FOOTER_NOTE =
  'Sample schedule excerpt shown for reference. Complete 36-day rotation follows the same assignment logic and repeats continuously.';

type ColumnKey = keyof Omit<RotationScheduleRow, 'id' | 'isEllipsis'>;

const thBaseClass =
  'whitespace-nowrap px-3 py-2 text-center text-table-header font-semibold uppercase';

function getTrackTone(key: string): 'fitness' | 'golf' | null {
  const lower = key.toLowerCase();
  if (lower.includes('fitness')) return 'fitness';
  if (lower.includes('golf')) return 'golf';
  return null;
}

function getTrackHeaderClass(key: string) {
  const track = getTrackTone(key);
  if (track === 'fitness') return 'rotation-schedule-header-fitness';
  if (track === 'golf') return 'rotation-schedule-header-golf';
  return 'rotation-schedule-header-group';
}

function getPhase1LeafLabel(key: string): string {
  if (key.includes('NoWall')) return 'No Wall';
  if (key.includes('Wall')) return 'Wall';
  return '';
}

function isSingleSpanGroup(label: string) {
  return label === 'Phase 2' || label === 'Full Program';
}

export interface RotationScheduleTableProps {
  rows: RotationScheduleRow[];
  viewFilter?: 'all' | 'fitness' | 'golf' | 'rotation';
  isEditing?: boolean;
  onEditDay?: (day: number) => void;
  highlightCell?: { day: number; column: RotationScheduleColumnKey };
  highlightDay?: number;
  visibleColumnKeys?: string[];
  showViewActions?: boolean;
  onViewRow?: (row: RotationScheduleRow) => void;
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

function RotationScheduleTableHeader({
  showActions,
  showViewActions,
  headerRowCount,
  visibleGroups,
  hasPhase1,
}: {
  showActions: boolean;
  showViewActions: boolean;
  headerRowCount: number;
  visibleGroups: { label: string; columns: (typeof rotationFlatColumns)[number][] }[];
  hasPhase1: boolean;
}) {
  const phase1Group = visibleGroups.find((group) => group.label === 'Phase 1');
  const phase1FitnessColumns =
    phase1Group?.columns.filter((column) => getTrackTone(column.key) === 'fitness') ?? [];
  const phase1GolfColumns =
    phase1Group?.columns.filter((column) => getTrackTone(column.key) === 'golf') ?? [];

  return (
    <thead>
      <tr>
        {showActions && (
          <th
            rowSpan={headerRowCount}
            className={cn(thBaseClass, 'rotation-schedule-header-neutral w-12 text-white')}
          >
            Edit
          </th>
        )}
        {visibleGroups
          .filter((group) => !group.label)
          .flatMap((group) =>
            group.columns.map((column) => (
              <th
                key={column.key}
                rowSpan={headerRowCount}
                className={cn(thBaseClass, 'rotation-schedule-header-neutral text-white')}
              >
                {column.label}
              </th>
            )),
          )}
        {visibleGroups
          .filter((group) => group.label)
          .map((group) => {
            if (isSingleSpanGroup(group.label)) {
              return (
                <th
                  key={group.label}
                  rowSpan={headerRowCount}
                  className={cn(thBaseClass, 'rotation-schedule-header-group text-white')}
                >
                  {group.label}
                </th>
              );
            }

            return (
              <th
                key={group.label}
                colSpan={group.columns.length}
                className={cn(thBaseClass, 'rotation-schedule-header-group text-white')}
              >
                {group.label}
              </th>
            );
          })}
        {showViewActions && (
          <th
            rowSpan={headerRowCount}
            className={cn(thBaseClass, 'rotation-schedule-header-neutral w-12 text-white')}
          >
            View
          </th>
        )}
      </tr>

      {headerRowCount >= 2 && (
        <tr>
          {visibleGroups
            .filter((group) => group.label && !isSingleSpanGroup(group.label) && group.label !== 'Phase 1')
            .flatMap((group) =>
              group.columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(thBaseClass, getTrackHeaderClass(column.key))}
                >
                  {column.label}
                </th>
              )),
            )}
          {hasPhase1 && phase1FitnessColumns.length > 0 && (
            <th
              colSpan={phase1FitnessColumns.length}
              className={cn(thBaseClass, 'rotation-schedule-header-fitness')}
            >
              Fitness
            </th>
          )}
          {hasPhase1 && phase1GolfColumns.length > 0 && (
            <th
              colSpan={phase1GolfColumns.length}
              className={cn(thBaseClass, 'rotation-schedule-header-golf')}
            >
              Golf
            </th>
          )}
        </tr>
      )}

      {hasPhase1 && headerRowCount === 3 && (
        <tr>
          {phase1Group?.columns.map((column) => (
            <th key={column.key} className={cn(thBaseClass, getTrackHeaderClass(column.key))}>
              {getPhase1LeafLabel(column.key)}
            </th>
          ))}
        </tr>
      )}
    </thead>
  );
}

export function RotationScheduleTable({
  rows,
  viewFilter = 'all',
  isEditing = false,
  onEditDay,
  highlightCell,
  highlightDay,
  visibleColumnKeys,
  showViewActions = false,
  onViewRow,
}: RotationScheduleTableProps) {
  const visibleColumns = rotationFlatColumns.filter((column) => {
    if (visibleColumnKeys && !visibleColumnKeys.includes(column.key)) return false;
    return isColumnVisible(column.key, viewFilter);
  });
  const visibleGroups = rotationColumnGroups
    .map((group) => ({
      label: group.label,
      columns: group.columns.filter((column) => {
        if (visibleColumnKeys && !visibleColumnKeys.includes(column.key)) return false;
        return isColumnVisible(column.key, viewFilter);
      }),
    }))
    .filter((group) => group.columns.length > 0);
  const hasPhase1 = visibleGroups.some((group) => group.label === 'Phase 1');
  const hasSubRow = visibleGroups.some(
    (group) =>
      group.label &&
      !isSingleSpanGroup(group.label) &&
      group.columns.length > 0,
  );
  const headerRowCount = hasPhase1 ? 3 : hasSubRow ? 2 : 1;
  const showActions = isEditing && onEditDay;
  const totalColumns = visibleColumns.length + (showActions ? 1 : 0) + (showViewActions ? 1 : 0);
  const footerNote = showViewActions
    ? 'Full 36-day schedule for the selected device. Use View on any row to see all videos for that day.'
    : SCHEDULE_FOOTER_NOTE;

  return (
    <div className={cn(CARD_SURFACE_CLASS, 'overflow-hidden p-0')}>
      {isEditing && (
        <div className="border-b border-surface-border bg-brand-50/50 px-4 py-2.5 text-body-sm text-brand-700 dark:bg-brand-600/10 dark:text-brand-300">
          {highlightCell
            ? 'Deployed video highlighted below — tap Edit to adjust the schedule.'
            : 'Edit mode — choose category and program, then set the video for each day.'}
        </div>
      )}

      <p className="scroll-hint px-4 pt-3 text-caption text-content-muted">
        Swipe horizontally to view all columns →
      </p>
      <div className="table-scroll-x w-full max-w-full overflow-x-auto overscroll-x-contain">
        <table className="rotation-schedule-table w-full min-w-[960px] border-collapse text-left xl:min-w-[1200px]">
            <RotationScheduleTableHeader
              showActions={showActions}
              showViewActions={showViewActions}
              headerRowCount={headerRowCount}
              visibleGroups={visibleGroups}
              hasPhase1={hasPhase1}
            />
            <tbody>
              {rows.map((row) => {
                const isHighlightedRow =
                  (highlightDay === row.day || highlightCell?.day === row.day) && !row.isEllipsis;
                return (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b border-surface-border transition-colors',
                    row.isEllipsis ? 'bg-surface-muted/30' : 'hover:bg-surface-muted/25',
                    isHighlightedRow && 'bg-brand-50/60 dark:bg-brand-600/10',
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
                  {visibleColumns.map((column) => {
                    const isHighlightedCell =
                      highlightCell?.day === row.day && highlightCell.column === column.key;
                    return (
                    <td
                      key={column.key}
                      className={cn(
                        'max-w-[180px] truncate px-3 py-2.5 text-body-sm xl:max-w-none xl:whitespace-nowrap',
                        column.key === 'day' || column.key === 'date'
                          ? 'font-medium text-content-primary'
                          : 'text-content-secondary',
                        isHighlightedCell &&
                          'bg-brand-100 font-semibold text-brand-800 dark:bg-brand-600/20 dark:text-brand-200',
                      )}
                      title={getRotationScheduleCellValue(row, column.key)}
                    >
                      {getRotationScheduleCellValue(row, column.key)}
                    </td>
                    );
                  })}
                  {showViewActions && onViewRow && (
                    <td className="px-2 py-2.5 text-center">
                      {row.isEllipsis ? (
                        <span className="text-content-muted">…</span>
                      ) : (
                        <IconButton
                          label={`View Day ${row.day} videos`}
                          className="mx-auto h-8 w-8"
                          onClick={() => onViewRow(row)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </IconButton>
                      )}
                    </td>
                  )}
                </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={totalColumns}
                  className="bg-surface-muted/80 px-4 py-3 text-center text-body-sm text-content-secondary"
                >
                  {footerNote}
                </td>
              </tr>
            </tfoot>
          </table>
      </div>
    </div>
  );
}
