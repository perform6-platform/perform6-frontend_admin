import { useEffect, useMemo, useState } from 'react';
import { Upload } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CategorySidebar } from '../components/content-library/CategorySidebar';
import { ContentCard } from '../components/content-library/ContentCard';
import { ContentLibraryToolbar } from '../components/content-library/ContentLibraryToolbar';
import { ContentVideoPlayerModal } from '../components/content-library/ContentVideoPlayerModal';
import {
  UploadContentModal,
  buildContentItemFromUpload,
  type UploadContentPayload,
} from '../components/content-library/UploadContentModal';
import { Button, Card, EmptyState, PageTitle } from '../components/ui';
import type { ContentCategoryId, ContentItem, ContentTypeFilter } from '../constants/contentLibrary';
import { useContent } from '../context/ContentContext';

export default function ContentLibrary() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, addItem } = useContent();
  const [activeTab, setActiveTab] = useState<ContentTypeFilter>('videos');
  const [activeCategory, setActiveCategory] = useState<ContentCategoryId>('default-fitness');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string>('content-default-fitness');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [playingItem, setPlayingItem] = useState<ContentItem | null>(null);

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
    const newItem = await buildContentItemFromUpload(payload, `content-${Date.now()}`);
    addItem(newItem);
    setActiveCategory(payload.categoryId);
    setActiveTab('videos');
    setSelectedId(newItem.id);
    setUploadOpen(false);
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
              {filteredItems.length === 0 ? (
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
    </>
  );
}
