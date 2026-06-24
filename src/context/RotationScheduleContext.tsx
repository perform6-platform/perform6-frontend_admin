import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ContentCategoryId } from '../constants/contentPlayback';
import { getPlaybackCategoryForContent } from '../constants/contentPlayback';
import type { DeploymentScheduleEntry } from '../constants/deployments';
import {
  createInitialRotationSchedule,
  getPreviewRotationRows,
  getRotationRowForDay,
  getScheduleColumnForCategory,
  toScheduleVideoName,
  type RotationScheduleColumnKey,
  type RotationScheduleRow,
} from '../constants/rotationSchedule';
import { usesRotationForPlayback } from '../lib/deploymentHelpers';
import {
  applyVideoAssignmentsToSchedule,
  type VideoAssignment,
} from '../lib/rotationAssignments';

export interface DeploymentSchedulePayload {
  entries: DeploymentScheduleEntry[];
}

interface RotationScheduleContextValue {
  rows: RotationScheduleRow[];
  previewRows: RotationScheduleRow[];
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  getRowByDay: (day: number) => RotationScheduleRow | undefined;
  updateDayRow: (day: number, updates: Partial<Record<RotationScheduleColumnKey, string>>) => void;
  applyDeploymentToSchedule: (payload: DeploymentSchedulePayload) => void;
  applyRotationAssignments: (assignments: VideoAssignment[]) => void;
  resetSchedule: () => void;
}

function applyDeploymentToScheduleRows(
  rows: RotationScheduleRow[],
  entriesByCategory: Map<ContentCategoryId, DeploymentScheduleEntry[]>,
): RotationScheduleRow[] {
  return rows.map((row) => {
    const updates: Partial<Record<RotationScheduleColumnKey, string>> = {};

    entriesByCategory.forEach((entries, categoryId) => {
      const playbackCategory = getPlaybackCategoryForContent(categoryId);
      const column = getScheduleColumnForCategory(categoryId);
      const usesRotation = usesRotationForPlayback(playbackCategory);

      if (!usesRotation) {
        const videoName = toScheduleVideoName(entries[0]?.videoTitle ?? '');
        if (videoName) updates[column] = videoName;
        return;
      }

      const dayEntry = entries.find((entry) => entry.day === row.day);
      if (dayEntry) {
        updates[column] = toScheduleVideoName(dayEntry.videoTitle);
      }
    });

    return Object.keys(updates).length > 0 ? { ...row, ...updates } : row;
  });
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

  const applyDeploymentToSchedule = useCallback((payload: DeploymentSchedulePayload) => {
    setRows((current) => {
      const entriesByCategory = new Map<ContentCategoryId, DeploymentScheduleEntry[]>();

      payload.entries.forEach((entry) => {
        const existing = entriesByCategory.get(entry.categoryId) ?? [];
        entriesByCategory.set(entry.categoryId, [...existing, entry]);
      });

      return applyDeploymentToScheduleRows(current, entriesByCategory);
    });
  }, []);

  const applyRotationAssignments = useCallback((assignments: VideoAssignment[]) => {
    setRows((current) => applyVideoAssignmentsToSchedule(current, assignments));
  }, []);

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
      applyDeploymentToSchedule,
      applyRotationAssignments,
      resetSchedule,
    }),
    [rows, previewRows, isEditing, getRowByDay, updateDayRow, applyDeploymentToSchedule, applyRotationAssignments, resetSchedule],
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
