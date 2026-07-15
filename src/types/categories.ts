export type DayPlaybackMode = 'LOOP' | 'ONCE';

export type CategoryScope = 'GLOBAL' | 'BY_FIELD' | 'BY_FIELD_AND_VARIANT';

export type FieldCategory = 'FITNESS' | 'GOLF';
export type ExerciseVariant = 'WALL' | 'NO_WALL';

export interface CategoryPlaylist {
  id: string;
  name: string;
  slug: string;
  libraryType: string | null;
  fieldCategory: FieldCategory | null;
  exerciseVariant: ExerciseVariant | null;
  isRotating: boolean;
  dayPlaybackMode: DayPlaybackMode;
  sessionCount: number;
  assignedSessionCount: number;
  sessions?: Array<{
    id: string;
    dayNumber: number;
    title: string | null;
    mediaVersionId: string | null;
  }>;
}

export interface ContentCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  scope: CategoryScope;
  dayPlaybackMode: DayPlaybackMode;
  cycleDays: number;
  isSystem: boolean;
  roleHint?: string | null;
  playlistCount: number;
  sessionCount: number;
  assignedSessionCount: number;
  playlists: CategoryPlaylist[];
  /** Always null on parent categories (compat). */
  libraryType: string | null;
  isRotating: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContentCategoryDetail extends ContentCategory {}

export interface CreateCategoryPayload {
  name: string;
  scope: CategoryScope;
  dayPlaybackMode: DayPlaybackMode;
  description?: string;
  roleHint?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  dayPlaybackMode?: DayPlaybackMode;
  description?: string;
  roleHint?: string;
}
