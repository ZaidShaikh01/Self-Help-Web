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
        <div className="flex bg-[#EEEEEE]/70 p-1 rounded-lg border border-[#D0D1D2]/40 w-fit">
          <button
            type="button"
            onClick={() => onTabChange('books')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'books'
                ? 'bg-white text-[#171A20] shadow-sm'
                : 'text-[#5C5E62] hover:text-[#171A20]'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Books Library ({booksCount})
          </button>
          <button
            type="button"
            onClick={() => onTabChange('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'notes'
                ? 'bg-white text-[#171A20] shadow-sm'
                : 'text-[#5C5E62] hover:text-[#171A20]'
            }`}
          >
            <FileText className="w-4 h-4" /> Notes &amp; Quotes ({notesCount})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C5E62]" />
          <input
            type="text"
            placeholder={
              activeTab === 'books'
                ? 'Search books or authors…'
                : 'Search notes, quotes, or keywords…'
            }
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-[#D0D1D2] rounded-lg pl-10 pr-12 py-2 text-sm text-[#171A20] placeholder-[#5C5E62] focus:outline-none focus:border-[#3E6AE1] transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5C5E62] hover:text-[#171A20]"
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
                  ? 'bg-[#171A20] text-white shadow-sm'
                  : 'bg-white border border-[#EEEEEE] text-[#393C41] hover:border-[#D0D1D2]'
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
