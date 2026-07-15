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
  /** Active media version id from API — required for POST /rotation. */
  mediaVersionId?: string;
  libraryType?: string;
  /** Custom category program id when not a system library. */
  programId?: string;
  /** Backend media workflow status. */
  status?: 'READY' | 'PROCESSING' | 'FAILED' | 'ARCHIVED' | string;
  updatedAt?: string;
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
