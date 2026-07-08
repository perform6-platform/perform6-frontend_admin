import { useEffect, useMemo, useState } from 'react';
import { Upload } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CategorySidebar } from '../components/content-library/CategorySidebar';
import { ContentCard } from '../components/content-library/ContentCard';
import { ContentLibraryToolbar } from '../components/content-library/ContentLibraryToolbar';
import { ContentVideoPlayerModal } from '../components/content-library/ContentVideoPlayerModal';
import {
  UploadContentModal,
  type UploadContentPayload,
} from '../components/content-library/UploadContentModal';
import { Button, Card, ConfirmModal, EmptyState, PageTitle } from '../components/ui';
import type { ContentCategoryId, ContentItem, ContentTypeFilter } from '../constants/contentLibrary';
import { getFullCategoryLabel } from '../constants/contentPlayback';
import { useContent } from '../context/ContentContext';
import { useToast } from '../context/ToastContext';
import { useDeleteMedia, useUploadMedia } from '../hooks/useMedia';
import { categoryToLibraryType } from '../lib/libraryType';
import { getApiErrorMessage } from '../services/axios';

function readVideoDurationSeconds(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? Math.round(video.duration) : undefined;
      URL.revokeObjectURL(url);
      resolve(duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };
    video.src = url;
  });
}

export default function ContentLibrary() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, isLoading, isError, refetch } = useContent();
  const { showToast } = useToast();
  const { mutate: deleteMedia, isPending: isDeleting } = useDeleteMedia();
  const { mutateAsync: uploadMedia, isPending: isUploading } = useUploadMedia();
  const [activeTab, setActiveTab] = useState<ContentTypeFilter>('all');
  const [activeCategory, setActiveCategory] = useState<ContentCategoryId>('default-fitness');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [playingItem, setPlayingItem] = useState<ContentItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ContentItem | null>(null);

  useEffect(() => {
    const state = location.state as { openUpload?: boolean; categoryId?: ContentCategoryId } | null;
    if (state?.categoryId) {
      setActiveCategory(state.categoryId);
    }
    if (state?.openUpload) {
      setUploadOpen(true);
    }
    if (state?.openUpload || state?.categoryId) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const filteredItems = useMemo(() => {
    let result = items.filter((item) => item.categoryId === activeCategory);

    if (activeTab !== 'all') {
      const typeMap: Record<Exclude<ContentTypeFilter, 'all'>, string> = {
        videos: 'video',
      };
      result = result.filter((item) => item.mediaType === typeMap[activeTab]);
    }

    if (categoryFilter !== 'all') {
      result = result.filter((item) => item.categoryId === categoryFilter);
    }

    return result;
  }, [items, activeTab, activeCategory, categoryFilter]);

  async function handleUpload(payload: UploadContentPayload) {
    try {
      const durationSeconds = await readVideoDurationSeconds(payload.file);
      const result = await uploadMedia({
        file: payload.file,
        title: payload.title.trim() || payload.file.name,
        libraryType: categoryToLibraryType(payload.categoryId),
        thumbnail: payload.thumbnail,
        mediaType: 'VIDEO',
        durationSeconds,
      });

      setActiveCategory(payload.categoryId);
      setActiveTab('all');
      setSelectedId(result.asset.id);
      setUploadOpen(false);
      refetch();
      showToast({
        title: 'Video uploaded',
        message: `"${result.asset.title}" has been uploaded to ${getFullCategoryLabel(payload.categoryId)}.`,
        variant: 'success',
      });
    } catch (error) {
      showToast({
        title: getApiErrorMessage(error, 'Failed to upload video'),
        variant: 'error',
      });
      throw error;
    }
  }

  function handleDeleteConfirm() {
    if (!itemToDelete) return;

    deleteMedia(itemToDelete.id, {
      onSuccess: (result) => {
        if (selectedId === itemToDelete.id) {
          setSelectedId(null);
        }
        if (playingItem?.id === itemToDelete.id) {
          setPlayingItem(null);
        }
        refetch();
        showToast({
          title: result.message || 'Video deleted',
          message: `"${itemToDelete.title}" has been removed from the library.`,
          variant: 'success',
        });
        setItemToDelete(null);
      },
      onError: (error) => {
        showToast({
          title: getApiErrorMessage(error, 'Failed to delete video'),
          variant: 'error',
        });
      },
    });
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PageTitle>Content Library</PageTitle>
          <Button
            size="sm"
            className="h-9 w-full shrink-0 gap-2 whitespace-nowrap px-4 sm:w-auto"
            onClick={() => setUploadOpen(true)}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4" />
            Upload video
          </Button>
        </div>

        <Card padding="none" className="overflow-hidden">
          <div className="p-4 sm:p-5">
            <ContentLibraryToolbar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
            />
          </div>

          <div className="flex flex-col gap-5 border-t border-surface-border p-4 sm:p-5 lg:flex-row lg:gap-8">
            <div className="shrink-0 lg:border-r lg:border-surface-border lg:pr-6">
              <CategorySidebar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
            </div>

            <div className="min-w-0 flex-1">
              {isError ? (
                <EmptyState message="Failed to load media library. Try refreshing." />
              ) : isLoading ? (
                <EmptyState message="Loading content..." />
              ) : filteredItems.length === 0 ? (
                <EmptyState message="No content found for the selected category." />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {filteredItems.map((item) => (
                    <ContentCard
                      key={item.id}
                      item={item}
                      selected={selectedId === item.id}
                      onSelect={setSelectedId}
                      onPlay={setPlayingItem}
                      onDelete={setItemToDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <UploadContentModal
        open={uploadOpen}
        defaultCategoryId={activeCategory}
        onClose={() => setUploadOpen(false)}
        onSubmit={handleUpload}
      />

      <ContentVideoPlayerModal
        open={playingItem !== null}
        item={playingItem}
        onClose={() => setPlayingItem(null)}
      />

      <ConfirmModal
        open={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete video?"
        description={
          itemToDelete
            ? `Are you sure you want to delete "${itemToDelete.title}"? This will remove the video and thumbnail from storage.`
            : undefined
        }
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        tone="danger"
      />
    </>
  );
}
