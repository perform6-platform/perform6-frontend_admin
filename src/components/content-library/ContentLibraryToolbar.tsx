import type { ContentTypeFilter } from '../../constants/contentLibrary';
import {
  contentCategoryFilterOptions,
  contentSortOptions,
  contentTypeFilterOptions,
  contentTypeTabs,
} from '../../constants/contentLibrary';
import { cn } from '../../lib/cn';
import { Dropdown } from '../ui';

export interface ContentLibraryToolbarProps {
  activeTab: ContentTypeFilter;
  onTabChange: (tab: ContentTypeFilter) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export function ContentLibraryToolbar({
  activeTab,
  onTabChange,
  categoryFilter,
  onCategoryFilterChange,
  typeFilter,
  onTypeFilterChange,
  sortBy,
  onSortChange,
}: ContentLibraryToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-surface-border pb-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap gap-1.5">
        {contentTypeTabs.map((tab) => {
          const isActive = tab.value === activeTab;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value)}
              className={cn(
                'rounded-md px-3.5 py-1.5 text-body-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
                isActive
                  ? 'ui-button-primary shadow-sm'
                  : 'border border-surface-border bg-surface-muted text-content-secondary hover:border-brand-500/20 hover:text-content-primary',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Dropdown
          options={contentCategoryFilterOptions}
          value={categoryFilter}
          onChange={onCategoryFilterChange}
        />
        <Dropdown
          options={contentTypeFilterOptions}
          value={typeFilter}
          onChange={onTypeFilterChange}
        />
        <Dropdown
          options={contentSortOptions}
          value={sortBy}
          onChange={onSortChange}
          placeholder="Sort"
          className="[&_button]:w-9 [&_button]:min-w-9 [&_button]:justify-center [&_button_span]:sr-only"
        />
      </div>
    </div>
  );
}
