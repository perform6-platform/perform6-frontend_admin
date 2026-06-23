import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  createInitialRotationSchedule,
  getPreviewRotationRows,
  getRotationRowForDay,
  type RotationScheduleColumnKey,
  type RotationScheduleRow,
} from '../constants/rotationSchedule';

interface RotationScheduleContextValue {
  rows: RotationScheduleRow[];
  previewRows: RotationScheduleRow[];
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  getRowByDay: (day: number) => RotationScheduleRow | undefined;
  updateDayRow: (day: number, updates: Partial<Record<RotationScheduleColumnKey, string>>) => void;
  resetSchedule: () => void;
}

const RotationScheduleContext = createContext<RotationScheduleContextValue | null>(null);

export function RotationScheduleProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<RotationScheduleRow[]>(createInitialRotationSchedule);
  const [isEditing, setIsEditing] = useState(false);

  const previewRows = useMemo(() => getPreviewRotationRows(rows), [rows]);

  const getRowByDay = useCallback(
    (day: number) => getRotationRowForDay(day, rows),
    [rows],
  );

  const updateDayRow = useCallback(
    (day: number, updates: Partial<Record<RotationScheduleColumnKey, string>>) => {
      setRows((current) =>
        current.map((row) => (row.day === day ? { ...row, ...updates } : row)),
      );
    },
    [],
  );

  const resetSchedule = useCallback(() => {
    setRows(createInitialRotationSchedule());
  }, []);

  const value = useMemo(
    () => ({
      rows,
      previewRows,
      isEditing,
      setIsEditing,
      getRowByDay,
      updateDayRow,
      resetSchedule,
    }),
    [rows, previewRows, isEditing, getRowByDay, updateDayRow, resetSchedule],
  );

  return (
    <RotationScheduleContext.Provider value={value}>{children}</RotationScheduleContext.Provider>
  );
}

export function useRotationSchedule() {
  const context = useContext(RotationScheduleContext);
  if (!context) {
    throw new Error('useRotationSchedule must be used within RotationScheduleProvider');
  }
  return context;
}
