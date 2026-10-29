import React, { useMemo, useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<ActiveLibraryTab>('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [selectedBook, setSelectedBook] = useState<Resource | null>(null);
  const [editingBook, setEditingBook] = useState<Resource | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [readingBook, setReadingBook] = useState<Resource | null>(null);
  const [readerType, setReaderType] = useState<'pdf' | 'epub' | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
          className="flex items-center gap-2 bg-[#171A20] hover:bg-[#393C41] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm cursor-pointer"
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
