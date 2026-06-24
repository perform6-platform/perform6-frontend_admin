import { buildRotationVideoName, ROTATION_DAYS } from './contentPlayback';
import type { ContentCategoryId } from './contentPlayback';

export type RotationViewFilter = 'all' | 'fitness' | 'golf' | 'rotation';

export interface RotationScheduleRow {
  id: string;
  day: number;
  dayLabel: string;
  dateLabel: string;
  defaultFitness: string;
  defaultGolf: string;
  startHereFitness: string;
  startHereGolf: string;
  phase1FitnessWall: string;
  phase1FitnessNoWall: string;
  phase1GolfWall: string;
  phase1GolfNoWall: string;
  phase2: string;
  fullProgram: string;
  isEllipsis?: boolean;
}

export const rotationViewOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'fitness', label: 'Fitness Track' },
  { value: 'golf', label: 'Golf Track' },
  { value: 'rotation', label: '36-Day Rotation Only' },
] as const;

export const rotationColumnGroups = [
  {
    label: '',
    columns: [
      { key: 'day', label: 'Day', tone: 'neutral' as const },
      { key: 'date', label: 'Date', tone: 'neutral' as const },
    ],
  },
  {
    label: 'Default',
    columns: [
      { key: 'defaultFitness', label: 'Fitness', tone: 'slate' as const },
      { key: 'defaultGolf', label: 'Golf', tone: 'slate' as const },
    ],
  },
  {
    label: 'Start Here',
    columns: [
      { key: 'startHereFitness', label: 'Fitness', tone: 'blue' as const },
      { key: 'startHereGolf', label: 'Golf', tone: 'blue' as const },
    ],
  },
  {
    label: 'Phase 1',
    columns: [
      { key: 'phase1FitnessWall', label: 'Fitness (Wall)', tone: 'teal' as const },
      { key: 'phase1FitnessNoWall', label: 'Fitness (No Wall)', tone: 'teal' as const },
      { key: 'phase1GolfWall', label: 'Golf (Wall)', tone: 'teal' as const },
      { key: 'phase1GolfNoWall', label: 'Golf (No Wall)', tone: 'teal' as const },
    ],
  },
  {
    label: 'Phase 2',
    columns: [{ key: 'phase2', label: 'All', tone: 'purple' as const }],
  },
  {
    label: 'Full Program',
    columns: [{ key: 'fullProgram', label: 'All', tone: 'gold' as const }],
  },
];

export const rotationFlatColumns = rotationColumnGroups.flatMap((group) => group.columns);

function formatScheduleDate(day: number): { dayLabel: string; dateLabel: string } {
  const date = new Date(2025, 3, 14 + (day - 14));
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).replace(/\.$/, '');
  return {
    dayLabel: weekday,
    dateLabel: date
      .toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      .replace(' ', '-'),
  };
}

export function getRotationScheduleCellValue(
  row: RotationScheduleRow,
  columnKey: string,
): string {
  if (columnKey === 'day') return row.dayLabel;
  if (columnKey === 'date') return row.dateLabel;
  const value = row[columnKey as keyof RotationScheduleRow];
  return value === undefined || value === null ? '' : String(value);
}

function buildVideoRow(day: number): RotationScheduleRow {
  const { dayLabel, dateLabel } = formatScheduleDate(day);
  return {
    id: `day-${day}`,
    day,
    dayLabel,
    dateLabel,
    defaultFitness: buildRotationVideoName(day, 'defaultFitness'),
    defaultGolf: buildRotationVideoName(day, 'defaultGolf'),
    startHereFitness: buildRotationVideoName(day, 'startHereFitness'),
    startHereGolf: buildRotationVideoName(day, 'startHereGolf'),
    phase1FitnessWall: buildRotationVideoName(day, 'phase1FitnessWall'),
    phase1FitnessNoWall: buildRotationVideoName(day, 'phase1FitnessNoWall'),
    phase1GolfWall: buildRotationVideoName(day, 'phase1GolfWall'),
    phase1GolfNoWall: buildRotationVideoName(day, 'phase1GolfNoWall'),
    phase2: buildRotationVideoName(day, 'phase2'),
    fullProgram: buildRotationVideoName(day, 'fullProgram'),
  };
}

export function createInitialRotationSchedule(): RotationScheduleRow[] {
  return Array.from({ length: ROTATION_DAYS }, (_, index) => buildVideoRow(index + 1));
}

export type RotationScheduleColumnKey = keyof Omit<
  RotationScheduleRow,
  'id' | 'day' | 'dayLabel' | 'dateLabel' | 'isEllipsis'
>;

export const rotationEditableColumns: {
  key: RotationScheduleColumnKey;
  label: string;
  group: string;
}[] = [
  { key: 'defaultFitness', label: 'Fitness', group: 'Default' },
  { key: 'defaultGolf', label: 'Golf', group: 'Default' },
  { key: 'startHereFitness', label: 'Fitness', group: 'Start Here' },
  { key: 'startHereGolf', label: 'Golf', group: 'Start Here' },
  { key: 'phase1FitnessWall', label: 'Fitness (Wall)', group: 'Phase 1' },
  { key: 'phase1FitnessNoWall', label: 'Fitness (No Wall)', group: 'Phase 1' },
  { key: 'phase1GolfWall', label: 'Golf (Wall)', group: 'Phase 1' },
  { key: 'phase1GolfNoWall', label: 'Golf (No Wall)', group: 'Phase 1' },
  { key: 'phase2', label: 'All Deployments', group: 'Phase 2' },
  { key: 'fullProgram', label: 'All Deployments', group: 'Full Program' },
];

export function getPreviewRotationRows(
  allRows: RotationScheduleRow[],
  extraDays: number[] = [],
): RotationScheduleRow[] {
  const previewDays = [...new Set([14, 15, 16, 17, 18, 36, ...extraDays])].sort((a, b) => a - b);
  const dataRows = previewDays
    .map((day) => allRows.find((row) => row.day === day))
    .filter((row): row is RotationScheduleRow => row !== undefined);

  if (dataRows.length <= 6) {
    return dataRows;
  }

  const firstChunk = dataRows.slice(0, 5);
  const lastRow = dataRows[dataRows.length - 1]!;

  return [
    ...firstChunk,
    {
      id: 'ellipsis',
      day: 0,
      dayLabel: '…',
      dateLabel: '…',
      defaultFitness: '…',
      defaultGolf: '…',
      startHereFitness: '…',
      startHereGolf: '…',
      phase1FitnessWall: '…',
      phase1FitnessNoWall: '…',
      phase1GolfWall: '…',
      phase1GolfNoWall: '…',
      phase2: '…',
      fullProgram: '…',
      isEllipsis: true,
    },
    lastRow,
  ];
}

export { buildVideoRow };

export const mockRotationScheduleRows: RotationScheduleRow[] = getPreviewRotationRows(
  createInitialRotationSchedule(),
);

export const currentRotationDay = 15;

export function getScheduleColumnForCategory(
  categoryId: ContentCategoryId,
): RotationScheduleColumnKey {
  const columnMap: Record<ContentCategoryId, RotationScheduleColumnKey> = {
    'default-fitness': 'defaultFitness',
    'default-golf': 'defaultGolf',
    'start-here-fitness': 'startHereFitness',
    'start-here-golf': 'startHereGolf',
    'phase-1-fitness-wall': 'phase1FitnessWall',
    'phase-1-fitness-no-wall': 'phase1FitnessNoWall',
    'phase-1-golf-wall': 'phase1GolfWall',
    'phase-1-golf-no-wall': 'phase1GolfNoWall',
    'phase-2': 'phase2',
    'full-program': 'fullProgram',
  };

  return columnMap[categoryId];
}

export function toScheduleVideoName(title: string): string {
  return title.replace(/\.mp4$/i, '').trim();
}

export function getViewFilterForCategory(categoryId: ContentCategoryId): RotationViewFilter {
  return categoryId.includes('golf') ? 'golf' : 'fitness';
}

export function getDeploymentTableColumnKeys(categoryId: ContentCategoryId): string[] {
  return ['day', 'date', getScheduleColumnForCategory(categoryId)];
}

export function getRotationRowForDay(
  day: number,
  rows?: RotationScheduleRow[],
): RotationScheduleRow | undefined {
  if (day < 1 || day > ROTATION_DAYS) return undefined;
  if (rows) {
    return rows.find((row) => row.day === day);
  }
  return buildVideoRow(day);
}
