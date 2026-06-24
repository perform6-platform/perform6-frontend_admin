import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RotationPhasePanel } from '../components/rotation/RotationPhasePanel';
import { Button, PageTitle } from '../components/ui';
import {
  contentCategoryGroups,
  type PlaybackCategoryId,
} from '../constants/contentPlayback';
import type { ContentCategoryId } from '../constants/contentPlayback';
import { useContent } from '../context/ContentContext';
import { useRotationSchedule } from '../context/RotationScheduleContext';
import { useToast } from '../context/ToastContext';
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
  const { showToast } = useToast();
  const [activePhase, setActivePhase] = useState<PlaybackCategoryId>('default');
  const [assignments, setAssignments] = useState<Record<string, VideoAssignmentState>>({});

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
    showToast({
      title: 'Rotation saved',
      message: 'Your video assignments have been saved to the rotation schedule.',
      variant: 'success',
    });
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
