import { Grid2X2, List, Search } from 'lucide-react';
import type {
  ResourceCategory,
  ResourceStatus,
  ResourceType,
} from '~/lib/library';

export type ActiveLibraryTab = 'books' | 'notes';
export type CategoryFilter = 'All' | ResourceCategory;
export type LibraryStatusFilter = 'all' | ResourceStatus;
export type LibraryViewMode = 'grid' | 'list';
export type LibraryTypeFilter = 'All Types' | ResourceType;

interface LibraryToolbarProps {
  activeTab: ActiveLibraryTab;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  categories: CategoryFilter[];
  selectedType: LibraryTypeFilter;
  onTypeChange: (type: LibraryTypeFilter) => void;
  selectedStatus: LibraryStatusFilter;
  onStatusChange: (status: LibraryStatusFilter) => void;
  viewMode: LibraryViewMode;
  onViewModeChange: (mode: LibraryViewMode) => void;
}

export default function LibraryToolbar({
  activeTab,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  viewMode,
  onViewModeChange,
}: LibraryToolbarProps) {
  return (
    <div className="library-toolbar">
      <label className="library-search">
        <Search aria-hidden="true" size={15} />
        <input
          id="library-search-input"
          type="search"
          aria-label="Search your library"
          placeholder="Search your library"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>

      {activeTab === 'books' && (
        <div className="library-filters" aria-label="Library filters">
          <label className="library-select-wrap">
            <span className="sr-only">Filter by resource type</span>
            <select
              value={selectedType}
              onChange={(event) =>
                onTypeChange(event.target.value as LibraryTypeFilter)
              }
            >
              <option value="All Types">All types</option>
              <option value="Book">Books</option>
              <option value="Article">Articles</option>
              <option value="YouTube">YouTube</option>
              <option value="Documentary">Documentaries</option>
            </select>
          </label>

          {(['Plan to Do', 'In Progress', 'Completed'] as const).map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={selectedStatus === status}
              className={`library-status-filter ${
                selectedStatus === status ? 'is-active' : ''
              }`}
              onClick={() =>
                onStatusChange(selectedStatus === status ? 'all' : status)
              }
            >
              {status.toUpperCase()}
            </button>
          ))}

          <label className="library-select-wrap library-category-select">
            <span className="sr-only">Filter by category</span>
            <select
              value={selectedCategory}
              onChange={(event) =>
                onCategoryChange(event.target.value as CategoryFilter)
              }
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'All' ? 'All categories' : category}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="library-view-switch" aria-label="Display mode">
        <button
          type="button"
          aria-label="Show list view"
          aria-pressed={viewMode === 'list'}
          className={viewMode === 'list' ? 'is-active' : ''}
          onClick={() => onViewModeChange('list')}
        >
          <List size={15} />
        </button>
        <button
          type="button"
          aria-label="Show grid view"
          aria-pressed={viewMode === 'grid'}
          className={viewMode === 'grid' ? 'is-active' : ''}
          onClick={() => onViewModeChange('grid')}
        >
          <Grid2X2 size={15} />
        </button>
      </div>
    </div>
  );
}
