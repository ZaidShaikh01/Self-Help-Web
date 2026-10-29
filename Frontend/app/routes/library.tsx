import React, { useMemo, useState } from 'react';
import { Plus, RefreshCw, Sparkles } from 'lucide-react';
import AddModal, {
  type NewBookData,
  type NewNoteData,
} from '~/components/common/AddModal';
import BookDetailModal from '~/components/features/library/BookDetailModal';
import BookGrid from '~/components/features/library/BookGrid';
import LibraryToolbar, {
  type ActiveLibraryTab,
  type CategoryFilter,
} from '~/components/features/library/LibraryToolbar';
import NotesGrid from '~/components/features/library/NotesGrid';
import { useLibrary } from '~/hooks/useLibrary';
import type { Resource } from '~/lib/library';

const CATEGORIES: CategoryFilter[] = [
  'All',
  'Productivity',
  'Focus',
  'Finance',
  'Philosophy',
];

export default function Library() {
  const [activeTab, setActiveTab] = useState<ActiveLibraryTab>('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [selectedBook, setSelectedBook] = useState<Resource | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    books,
    notes,
    isLoading,
    error,
    reload,
    addBook,
    addNote,
  } = useLibrary();

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return books.filter((book) => {
      const matchesSearch =
        !q ||
        book.title.toLowerCase().includes(q) ||
        (book.author && book.author.toLowerCase().includes(q));
      const matchesCategory =
        selectedCategory === 'All' || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, selectedCategory]);

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return notes.filter((note) => {
      if (!q) return true;
      const resourceTitle =
        note.resource && typeof note.resource === 'object'
          ? note.resource.title
          : '';
      return (
        (note.title && note.title.toLowerCase().includes(q)) ||
        resourceTitle.toLowerCase().includes(q) ||
        (note.quote && note.quote.toLowerCase().includes(q)) ||
        (note.content && note.content.toLowerCase().includes(q)) ||
        note.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [notes, searchQuery]);

  const availableBookOptions = useMemo(
    () => books.map((b) => ({ _id: b._id, title: b.title })),
    [books],
  );

  const handleSaveBook = async (data: NewBookData) => {
    await addBook(data);
  };

  const handleSaveNote = async (data: NewNoteData) => {
    await addNote(data);
  };

  return (
    <div className="min-h-screen rounded-xl bg-[#F4F4F4] text-[#171A20] p-4 sm:p-8 space-y-8 max-w-6xl mx-auto font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-[#EEEEEE] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5C5E62]">
            <Sparkles className="w-4 h-4 text-[#3E6AE1]" />
            <span>Knowledge Base</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171A20] mt-1">
            Library &amp; Notes
          </h1>
          <p className="text-xs text-[#5C5E62]">
            Manage your active reads, summaries, and personal reflections.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-[#171A20] hover:bg-[#393C41] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Item
        </button>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <div>
            <p className="font-semibold">Unable to load library records</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => void reload()}
            className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* TOOLBAR */}
      <LibraryToolbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        booksCount={books.length}
        notesCount={notes.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={CATEGORIES}
      />

      {/* MAIN CONTENT AREA */}
      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center gap-3 rounded-xl border border-[#EEEEEE] bg-white p-12 text-sm text-[#5C5E62]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#171A20] border-t-transparent" />
          Loading your library…
        </div>
      ) : activeTab === 'books' ? (
        <BookGrid
          books={filteredBooks}
          onSelectBook={setSelectedBook}
          isFiltered={Boolean(searchQuery || selectedCategory !== 'All')}
        />
      ) : (
        <NotesGrid
          notes={filteredNotes}
          isFiltered={Boolean(searchQuery)}
        />
      )}

      {/* BOOK DETAIL MODAL */}
      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
      />

      {/* SHARED ADD MODAL */}
      {isAddModalOpen && (
        <AddModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSaveBook={handleSaveBook}
          onSaveNote={handleSaveNote}
          defaultTab={activeTab === 'books' ? 'book' : 'note'}
          availableBooks={availableBookOptions}
        />
      )}
    </div>
  );
}
