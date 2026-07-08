import type { ContentItem } from '../constants/contentLibrary';
import {
  contentCategoryGroups,
  type ContentCategoryId,
  type PlaybackCategoryId,
} from '../constants/contentPlayback';
import type {
  RotationBulkPayload,
  RotationBulkSection,
} from '../types/rotation';
import { categoryToLibraryType } from './libraryType';
import type { VideoAssignment } from './rotationAssignments';

function getSectionCategoryIds(section: PlaybackCategoryId): ContentCategoryId[] {
  const group = contentCategoryGroups.find((entry) => entry.playbackCategory === section);
  return group?.children.map((child) => child.id) ?? [];
}

function findMediaVersionId(
  items: ContentItem[],
  categoryId: ContentCategoryId,
  videoTitle: string,
): string | null {
  const item = items.find(
    (entry) => entry.categoryId === categoryId && entry.title === videoTitle,
  );
  return item?.mediaVersionId ?? null;
}

function buildSingleLibraryPayload(
  section: 'default' | 'start-here',
  sectionAssignments: VideoAssignment[],
  items: ContentItem[],
): RotationBulkPayload {
  const categoryIds = getSectionCategoryIds(section);

  return {
    libraries: categoryIds.map((categoryId) => {
      const selected = sectionAssignments.find(
        (assignment) => assignment.categoryId === categoryId && assignment.included,
      );
      const mediaVersionId = selected
        ? findMediaVersionId(items, categoryId, selected.videoTitle)
        : null;

      return {
        libraryType: categoryToLibraryType(categoryId),
        mediaVersionId,
      };
    }),
  };
}

function buildRotatingLibraryPayload(
  section: 'phase-1' | 'phase-2' | 'full-program',
  sectionAssignments: VideoAssignment[],
  items: ContentItem[],
): RotationBulkPayload {
  const categoryIds = getSectionCategoryIds(section);

  return {
    libraries: categoryIds.map((categoryId) => ({
      libraryType: categoryToLibraryType(categoryId),
      assignments: sectionAssignments
        .filter((assignment) => assignment.categoryId === categoryId && assignment.included)
        .map((assignment) => {
          const mediaVersionId = findMediaVersionId(items, categoryId, assignment.videoTitle);
          if (!mediaVersionId) return null;
          return { dayNumber: assignment.day, mediaVersionId };
        })
        .filter((entry): entry is { dayNumber: number; mediaVersionId: string } => entry !== null),
    })),
  };
}

export function buildRotationBulkPayload(
  section: RotationBulkSection,
  assignments: VideoAssignment[],
  items: ContentItem[],
): RotationBulkPayload {
  const sectionCategoryIds = getSectionCategoryIds(section);
  const sectionAssignments = assignments.filter((assignment) =>
    sectionCategoryIds.includes(assignment.categoryId),
  );

  if (section === 'default' || section === 'start-here') {
    return buildSingleLibraryPayload(section, sectionAssignments, items);
  }

  return buildRotatingLibraryPayload(section, sectionAssignments, items);
}

export function filterAssignmentsForSection(
  section: PlaybackCategoryId,
  assignments: VideoAssignment[],
): VideoAssignment[] {
  const sectionCategoryIds = getSectionCategoryIds(section);
  return assignments.filter((assignment) => sectionCategoryIds.includes(assignment.categoryId));
}
