import type { ContentCategoryId } from '../../constants/contentLibrary';
import { contentCategoryGroups } from '../../constants/contentPlayback';
import { cn } from '../../lib/cn';
import { SectionLabel } from '../ui';

export interface CategorySidebarProps {
  activeCategory: ContentCategoryId;
  onCategoryChange: (categoryId: ContentCategoryId) => void;
}

export function CategorySidebar({ activeCategory, onCategoryChange }: CategorySidebarProps) {
  return (
    <aside className="w-full shrink-0 border-surface-border lg:w-[200px] xl:w-[220px]">
      <SectionLabel className="mb-3 block">Categories</SectionLabel>
      <nav className="space-y-4">
        {contentCategoryGroups.map((group) => (
          <div key={group.playbackCategory}>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-content-muted">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.children.map((category) => {
                const isActive = category.id === activeCategory;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onCategoryChange(category.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'ui-category-nav-item w-full text-left',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
                      isActive && 'ui-category-nav-item--active',
                    )}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
