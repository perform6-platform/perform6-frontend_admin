import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { RotationPhasePanel } from '../components/rotation/RotationPhasePanel';
import { Button, PageTitle } from '../components/ui';
import {
  contentCategoryGroups,
  type PlaybackCategoryId,
} from '../constants/contentPlayback';
import type { ContentCategoryId } from '../constants/contentPlayback';
import { useContent } from '../context/ContentContext';
import { useRotationSchedule } from '../context/RotationScheduleContext';
import { cn } from '../lib/cn';
import {
  buildVideoAssignmentsFromSchedule,
  getVideoAssignmentKey,
  type VideoAssignment,
  type VideoAssignmentState,
} from '../lib/rotationAssignments';

export default function Rotation() {
  const navigate = useNavigate();
  const { getVideosByCategory } = useContent();
  const { rows, applyRotationAssignments } = useRotationSchedule();
  const [activePhase, setActivePhase] = useState<PlaybackCategoryId>('default');
  const [assignments, setAssignments] = useState<Record<string, VideoAssignmentState>>({});
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setAssignments(buildVideoAssignmentsFromSchedule(rows, getVideosByCategory));
  }, [rows, getVideosByCategory]);

  const activeGroup = useMemo(
    () => contentCategoryGroups.find((group) => group.playbackCategory === activePhase)!,
    [activePhase],
  );

  const handleAssignmentChange = useCallback(
    (categoryId: ContentCategoryId, videoTitle: string, next: VideoAssignmentState) => {
      const key = getVideoAssignmentKey(categoryId, videoTitle);

      setAssignments((current) => {
        const updated = { ...current, [key]: next };

        if (next.included && !usesRotationCategory(categoryId)) {
          Object.keys(updated).forEach((assignmentKey) => {
            if (assignmentKey.startsWith(`${categoryId}::`) && assignmentKey !== key) {
              updated[assignmentKey] = { ...updated[assignmentKey]!, included: false };
            }
          });
        }

        return updated;
      });
      setSavedNotice(false);
    },
    [],
  );

  function handleSave() {
    const videoAssignments: VideoAssignment[] = Object.entries(assignments).map(
      ([key, state]) => {
        const separatorIndex = key.indexOf('::');
        const categoryId = key.slice(0, separatorIndex) as ContentCategoryId;
        const videoTitle = key.slice(separatorIndex + 2);
        return { categoryId, videoTitle, ...state };
      },
    );

    applyRotationAssignments(videoAssignments);
    setSavedNotice(true);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <PageTitle>Rotation</PageTitle>
          <p className="mt-1 text-body-sm text-content-secondary">
            Assign videos to each phase and choose which day they play in the rotation.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="h-9 w-full gap-2 px-4 sm:w-auto"
            onClick={() => navigate('/rotation-schedule')}
          >
            <CalendarDays className="h-4 w-4" />
            View Schedule
          </Button>
          <Button
            type="button"
            size="md"
            className="h-9 w-full gap-2 px-4 sm:w-auto"
            onClick={handleSave}
          >
            <Save className="h-4 w-4" />
            Save Rotation
          </Button>
        </div>
      </div>

      {savedNotice && (
        <div className="flex items-start gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-600/30 dark:bg-brand-600/10">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-success" />
          <p className="text-body-sm text-content-primary">
            Rotation saved.{' '}
            <Link
              to="/rotation-schedule"
              className="font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              View the 36-day schedule
            </Link>{' '}
            to confirm assignments.
          </p>
        </div>
      )}

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 hide-scrollbar sm:flex-wrap sm:overflow-visible sm:pb-0">
        {contentCategoryGroups.map((group) => (
          <button
            key={group.playbackCategory}
            type="button"
            onClick={() => setActivePhase(group.playbackCategory)}
            className={cn(
              'shrink-0 rounded-lg border px-3 py-1.5 text-body-sm font-medium transition-colors',
              activePhase === group.playbackCategory
                ? 'border-brand-500/40 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                : 'border-surface-border bg-surface-muted text-content-secondary hover:text-content-primary',
            )}
          >
            {group.label}
          </button>
        ))}
      </div>

      <RotationPhasePanel
        group={activeGroup}
        assignments={assignments}
        onAssignmentChange={handleAssignmentChange}
      />
    </div>
  );
}

function usesRotationCategory(categoryId: ContentCategoryId): boolean {
  const group = contentCategoryGroups.find((entry) =>
    entry.children.some((child) => child.id === categoryId),
  );
  if (!group) return false;
  return group.playbackCategory === 'phase-1' ||
    group.playbackCategory === 'phase-2' ||
    group.playbackCategory === 'full-program';
}
