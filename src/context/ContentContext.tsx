import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  mockContentItems,
  type ContentCategoryId,
  type ContentItem,
} from '../constants/contentLibrary';
import type { PlaybackCategoryId } from '../constants/contentPlayback';
import { getManageableCategoryIds } from '../lib/programHelpers';

interface ContentContextValue {
  items: ContentItem[];
  addItem: (item: ContentItem) => void;
  removeItem: (id: string) => void;
  getVideosByCategory: (categoryId: ContentCategoryId) => ContentItem[];
  getVideoCountByCategory: (categoryId: ContentCategoryId) => number;
  getVideosForProgram: (programId: PlaybackCategoryId | ContentCategoryId) => ContentItem[];
  getVideoCountForProgram: (programId: PlaybackCategoryId | ContentCategoryId) => number;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ContentItem[]>(mockContentItems);

  const addItem = useCallback((item: ContentItem) => {
    setItems((current) => [item, ...current]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

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
      addItem,
      removeItem,
      getVideosByCategory,
      getVideoCountByCategory,
      getVideosForProgram,
      getVideoCountForProgram,
    }),
    [items, addItem, removeItem, getVideosByCategory, getVideoCountByCategory, getVideosForProgram, getVideoCountForProgram],
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
