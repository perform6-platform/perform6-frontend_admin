import { buildRotationVideoName, ROTATION_DAYS } from './contentPlayback';

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

function formatScheduleDate(dayOffset: number): string {
  const date = new Date(2025, 3, 14 + (dayOffset - 14));
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function buildVideoRow(day: number): RotationScheduleRow {
  return {
    id: `day-${day}`,
    day,
    dayLabel: `Day ${day}`,
    dateLabel: day === 36 ? '12 May 2025' : formatScheduleDate(day),
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

export const mockRotationScheduleRows: RotationScheduleRow[] = [
  buildVideoRow(14),
  buildVideoRow(15),
  buildVideoRow(16),
  buildVideoRow(17),
  buildVideoRow(18),
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
  buildVideoRow(36),
];

export const currentRotationDay = 15;

export function getRotationRowForDay(day: number): RotationScheduleRow | undefined {
  if (day < 1 || day > ROTATION_DAYS) return undefined;
  return buildVideoRow(day);
}
