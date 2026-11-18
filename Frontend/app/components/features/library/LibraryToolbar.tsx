import React from 'react';
import { BookOpen, FileText, Search } from 'lucide-react';
import type { ResourceCategory } from '~/lib/library';

export type CategoryFilter = 'All' | ResourceCategory;
export type ActiveLibraryTab = 'books' | 'notes';

interface LibraryToolbarProps {
  activeTab: ActiveLibraryTab;
  onTabChange: (tab: ActiveLibraryTab) => void;
  booksCount: number;
  notesCount: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: CategoryFilter;
  onCategoryChange: (cat: CategoryFilter) => void;
  categories: CategoryFilter[];
}

export default function LibraryToolbar({
  activeTab,
  onTabChange,
  booksCount,
  notesCount,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
}: LibraryToolbarProps) {
  return (
    <div className="space-y-4">
      {/* SEARCH & TAB SWITCHER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        {/* Tab Switcher */}
        <div className="flex w-fit rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-2)] p-1">
          <button
            type="button"
            onClick={() => onTabChange('books')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'books'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                : 'text-[var(--text-3)] hover:text-[var(--text)]'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Books Library ({booksCount})
          </button>
          <button
            type="button"
            onClick={() => onTabChange('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'notes'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                : 'text-[var(--text-3)] hover:text-[var(--text)]'
            }`}
          >
            <FileText className="w-4 h-4" /> Notes &amp; Quotes ({notesCount})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-3)]" />
          <input
            type="text"
            placeholder={
              activeTab === 'books'
                ? 'Search books or authors…'
                : 'Search notes, quotes, or keywords…'
            }
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-10 pr-12 text-sm text-[var(--text)] placeholder:text-[var(--text-3)] transition-colors focus:border-[var(--accent)] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-3)] hover:text-[var(--text)]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* CATEGORY FILTER CHIPS (Only shown in books tab) */}
      {activeTab === 'books' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[var(--granite-strong)] text-[var(--surface)] shadow-sm'
                  : 'border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-2)] hover:border-[var(--border)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
