import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import type { ContentCategoryId, ContentItem } from '../constants/contentLibrary';
import type { PlaybackCategoryId } from '../constants/contentPlayback';
import { useMediaAssets } from '../hooks/useMedia';
import { mapMediaAssetToContentItem } from '../lib/deviceMapper';
import { getManageableCategoryIds } from '../lib/programHelpers';

interface ContentContextValue {
  items: ContentItem[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  getVideosByCategory: (categoryId: ContentCategoryId) => ContentItem[];
  getVideoCountByCategory: (categoryId: ContentCategoryId) => number;
  getVideosForProgram: (programId: PlaybackCategoryId | ContentCategoryId) => ContentItem[];
  getVideoCountForProgram: (programId: PlaybackCategoryId | ContentCategoryId) => number;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isError, refetch } = useMediaAssets({
    status: 'READY',
    page: 1,
    limit: 100,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  const items = useMemo(() => {
    const assets = data?.items ?? [];
    return assets
      .map(mapMediaAssetToContentItem)
      .filter((item): item is ContentItem => item !== null);
  }, [data]);

  const getVideosByCategory = useCallback(
    (categoryId: ContentCategoryId) =>
      items.filter((item) => item.categoryId === categoryId && item.mediaType === 'video'),
    [items],
  );

  const getVideoCountByCategory = useCallback(
    (categoryId: ContentCategoryId) => getVideosByCategory(categoryId).length,
    [getVideosByCategory],
  );

  const getVideosForProgram = useCallback(
    (programId: PlaybackCategoryId | ContentCategoryId) => {
      const categoryIds = getManageableCategoryIds(programId);
      return items.filter(
        (item) => categoryIds.includes(item.categoryId) && item.mediaType === 'video',
      );
    },
    [items],
  );

  const getVideoCountForProgram = useCallback(
    (programId: PlaybackCategoryId | ContentCategoryId) => getVideosForProgram(programId).length,
    [getVideosForProgram],
  );

  const value = useMemo(
    () => ({
      items,
      isLoading,
      isError,
      refetch: () => {
        void refetch();
      },
      getVideosByCategory,
      getVideoCountByCategory,
      getVideosForProgram,
      getVideoCountForProgram,
    }),
    [
      items,
      isLoading,
      isError,
      refetch,
      getVideosByCategory,
      getVideoCountByCategory,
      getVideosForProgram,
      getVideoCountForProgram,
    ],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within ContentProvider');
  }
  return context;
}
