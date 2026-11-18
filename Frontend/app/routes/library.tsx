import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Plus, RefreshCw, Sparkles } from 'lucide-react';
import AddModal, {
  type NewBookData,
  type NewNoteData,
} from '~/components/common/AddModal';
import BookDetailModal from '~/components/features/library/BookDetailModal';
import BookGrid from '~/components/features/library/BookGrid';
import EditBookModal from '~/components/features/library/EditBookModal';
import EditNoteModal from '~/components/features/library/EditNoteModal';
import EpubReaderModal from '~/components/features/library/EpubReaderModal';
import LibraryToolbar, {
  type ActiveLibraryTab,
  type CategoryFilter,
} from '~/components/features/library/LibraryToolbar';
import NotesGrid from '~/components/features/library/NotesGrid';
import PdfReaderModal from '~/components/features/library/PdfReaderModal';
import Skeleton from '~/components/ui/Skeleton';
import { useLibrary } from '~/hooks/useLibrary';
import type {
  Note,
  Resource,
  ResourceStatus,
  UpdateResourceInput,
} from '~/lib/library';

const CATEGORIES: CategoryFilter[] = [
  'All',
  'Productivity',
  'Focus',
  'Finance',
  'Philosophy',
];

export default function Library() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveLibraryTab>('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [selectedBook, setSelectedBook] = useState<Resource | null>(null);
  const [editingBook, setEditingBook] = useState<Resource | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [readingBook, setReadingBook] = useState<Resource | null>(null);
  const [readerType, setReaderType] = useState<'pdf' | 'epub' | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const state = location.state as { focusSearch?: boolean } | null;
    if (!state?.focusSearch) return;

    document.getElementById('library-search-input')?.focus();
    navigate(location.pathname, { replace: true, state: null });
  }, [location.key, location.pathname, location.state, navigate]);

  const {
    books,
    notes,
    isLoading,
    error,
    reload,
    addBook,
    updateBook,
    updateBookProgress,
    deleteBook,
    uploadAttachment,
    removeAttachment,
    updateEpubProgress,
    addNote,
    updateExistingNote,
    deleteExistingNote,
  } = useLibrary();

  const activeSelectedBook = useMemo(() => {
    if (!selectedBook) return null;
    return books.find((b) => b._id === selectedBook._id) || null;
  }, [books, selectedBook]);

  const activeReadingBook = useMemo(() => {
    if (!readingBook) return null;
    return books.find((b) => b._id === readingBook._id) || null;
  }, [books, readingBook]);

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

  const handleUpdateProgress = async (
    id: string,
    currentPage: number,
    status?: ResourceStatus,
  ) => {
    await updateBookProgress(id, currentPage, status);
  };

  const handleReconcilePages = async (id: string, totalPages: number) => {
    await updateBook(id, { pages: totalPages });
  };

  const handleSaveEditedBook = async (
    id: string,
    data: UpdateResourceInput,
  ) => {
    await updateBook(id, data);
  };

  const handleDeleteBook = async (book: Resource) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?\n\nNote: Any linked notes and reflections will not be deleted, but will no longer be linked to this book.`,
    );
    if (!confirmed) return;

    try {
      await deleteBook(book._id);
      setSelectedBook(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete book.');
    }
  };

  const handleSaveEditedNote = async (
    id: string,
    data: {
      title?: string;
      quote?: string;
      reflection?: string;
      tags?: string;
      resourceId?: string;
    },
  ) => {
    await updateExistingNote(id, data);
  };

  const handleDeleteNote = async (note: Note) => {
    const title =
      note.resource && typeof note.resource === 'object' && note.resource.title
        ? note.resource.title
        : note.title || 'Personal Reflection';
    const confirmed = window.confirm(
      `Are you sure you want to delete this note for "${title}"?`,
    );
    if (!confirmed) return;

    try {
      await deleteExistingNote(note._id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete note.');
    }
  };

  return (
    <div className="route-enter mx-auto min-h-screen max-w-6xl space-y-8 rounded-xl bg-[var(--canvas)] p-4 font-sans text-[var(--text)] sm:p-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">
            <Sparkles className="h-4 w-4 text-[var(--accent-text)]" />
            <span>Knowledge Base</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text)]">
            Library &amp; Notes
          </h1>
          <p className="text-xs text-[var(--text-3)]">
            Manage your active reads, summaries, and personal reflections.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)]"
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
            className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
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
        <div
          className={`grid grid-cols-1 gap-6 ${activeTab === 'books' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'}`}
          role="status"
          aria-label={`Loading ${activeTab === 'books' ? 'books' : 'notes'}`}
        >
          {Array.from({ length: activeTab === 'books' ? 6 : 4 }, (_, index) => (
            <article
              key={index}
              className="space-y-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5"
            >
              <div className="flex items-start justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              {activeTab === 'books' ? (
                <div className="flex items-center gap-4 py-2">
                  <Skeleton className="h-22 w-16 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-2/5" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              )}
              <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3">
                <Skeleton className="h-3 w-2/5" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            </article>
          ))}
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
          onEdit={(note) => setEditingNote(note)}
          onDelete={handleDeleteNote}
        />
      )}

      {/* BOOK DETAIL MODAL */}
      <BookDetailModal
        book={activeSelectedBook}
        onClose={() => setSelectedBook(null)}
        onEdit={(book) => setEditingBook(book)}
        onDelete={handleDeleteBook}
        onUpdateProgress={handleUpdateProgress}
        onUploadAttachment={async (id, file) => {
          await uploadAttachment(id, file);
        }}
        onRemoveAttachment={async (id) => {
          await removeAttachment(id);
        }}
        onOpenPdfReader={(book) => {
          setSelectedBook(null);
          setReadingBook(book);
          setReaderType('pdf');
        }}
        onOpenEpubReader={(book) => {
          setSelectedBook(null);
          setReadingBook(book);
          setReaderType('epub');
        }}
      />

      {/* PDF READER MODAL */}
      {activeReadingBook && readerType === 'pdf' && (
        <PdfReaderModal
          book={activeReadingBook}
          onClose={() => {
            setReadingBook(null);
            setReaderType(null);
          }}
          onUpdateProgress={handleUpdateProgress}
          onReconcilePages={handleReconcilePages}
        />
      )}

      {/* EPUB READER MODAL */}
      {activeReadingBook && readerType === 'epub' && (
        <EpubReaderModal
          book={activeReadingBook}
          onClose={() => {
            setReadingBook(null);
            setReaderType(null);
          }}
          onUpdateEpubProgress={async (id, cfi, percentage) => {
            await updateEpubProgress(id, cfi, percentage);
          }}
        />
      )}

      {/* EDIT BOOK MODAL */}
      {editingBook && (
        <EditBookModal
          isOpen={Boolean(editingBook)}
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onSave={handleSaveEditedBook}
        />
      )}

      {/* EDIT NOTE MODAL */}
      {editingNote && (
        <EditNoteModal
          isOpen={Boolean(editingNote)}
          note={editingNote}
          availableBooks={availableBookOptions}
          onClose={() => setEditingNote(null)}
          onSave={handleSaveEditedNote}
        />
      )}

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
