import type { ContentCategoryId } from './contentPlayback';

export type { ContentCategoryId };

export type ContentTypeFilter = 'all' | 'videos';

export type ContentMediaType = 'video' | 'image' | 'document';

export interface ContentItem {
  id: string;
  title: string;
  mediaType: ContentMediaType;
  categoryId: ContentCategoryId;
  rotationDay?: number;
  duration?: string;
  dateLabel: string;
  format: string;
  thumbnailUrl: string;
  videoUrl?: string;
}

export const defaultContentThumbnail =
  'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=480&h=270&fit=crop';

export const sampleContentVideoUrl =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

export function getContentVideoUrl(item: ContentItem): string | null {
  if (item.mediaType !== 'video') return null;
  return item.videoUrl ?? sampleContentVideoUrl;
}

export const contentTypeTabs: { value: ContentTypeFilter; label: string }[] = [
  { value: 'all', label: 'All Content' },
  { value: 'videos', label: 'Videos' },
];

import { allContentCategories } from './contentPlayback';

export const contentCategories = allContentCategories;

export const contentCategoryFilterOptions = [
  { value: 'all', label: 'All Categories' },
  ...contentCategories.map((category) => ({ value: category.id, label: category.label })),
];

export const contentTypeFilterOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'video', label: 'Video' },
];

export const contentSortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
];

const thumbnails = [
  'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=480&h=270&fit=crop',
  'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=480&h=270&fit=crop',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=480&h=270&fit=crop',
  'https://images.unsplash.com/photo-1517836357463-d06f66068342?w=480&h=270&fit=crop',
  'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=480&h=270&fit=crop',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=480&h=270&fit=crop',
];

function buildRotationSamples(
  categoryId: ContentCategoryId,
  nameBuilder: (day: number) => string,
  duration: string,
  days: number[] = [14, 15, 34, 36],
): ContentItem[] {
  return days.map((day, index) => ({
    id: `content-${categoryId}-day${day}`,
    title: `${nameBuilder(day)}.mp4`,
    mediaType: 'video' as const,
    categoryId,
    rotationDay: day,
    duration,
    dateLabel: '14 Apr 2025',
    format: 'MP4',
    thumbnailUrl: thumbnails[index % thumbnails.length] ?? thumbnails[0]!,
  }));
}

export const mockContentItems: ContentItem[] = [
  {
    id: 'content-default-fitness',
    title: '01_Home_Fitness.mp4',
    mediaType: 'video',
    categoryId: 'default-fitness',
    duration: '2:30',
    dateLabel: '14 Apr 2025',
    format: 'MP4',
    thumbnailUrl: thumbnails[0]!,
  },
  {
    id: 'content-default-golf',
    title: '01_Home_Golf.mp4',
    mediaType: 'video',
    categoryId: 'default-golf',
    duration: '2:30',
    dateLabel: '14 Apr 2025',
    format: 'MP4',
    thumbnailUrl: thumbnails[1]!,
  },
  {
    id: 'content-start-here-fitness',
    title: '01_Screen 1_Fitness.mp4',
    mediaType: 'video',
    categoryId: 'start-here-fitness',
    duration: '6:00',
    dateLabel: '14 Apr 2025',
    format: 'MP4',
    thumbnailUrl: thumbnails[2]!,
  },
  {
    id: 'content-start-here-golf',
    title: '01_Screen 1_Golf.mp4',
    mediaType: 'video',
    categoryId: 'start-here-golf',
    duration: '6:00',
    dateLabel: '14 Apr 2025',
    format: 'MP4',
    thumbnailUrl: thumbnails[3]!,
  },
  ...buildRotationSamples(
    'phase-1-fitness-wall',
    (day) => `${String(day).padStart(2, '0')}_Screen 2_Fitness_Wall`,
    '5:00',
  ),
  ...buildRotationSamples(
    'phase-1-fitness-no-wall',
    (day) => `${String(day).padStart(2, '0')}_Screen 2_Fitness_NoWall`,
    '5:00',
  ),
  ...buildRotationSamples(
    'phase-1-golf-wall',
    (day) => `${String(day).padStart(2, '0')}_Screen 2_Golf_Wall`,
    '5:00',
  ),
  ...buildRotationSamples(
    'phase-1-golf-no-wall',
    (day) => `${String(day).padStart(2, '0')}_Screen 2_Golf_NoWall`,
    '5:00',
  ),
  ...buildRotationSamples('phase-2', (day) => `${String(day).padStart(2, '0')}_Screen 3`, '5:00'),
  ...buildRotationSamples('full-program', (day) => `${String(day).padStart(2, '0')}_Team`, '68:00'),
];
