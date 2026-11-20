import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Plus, RefreshCw } from 'lucide-react';
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
  type LibraryStatusFilter,
  type LibraryTypeFilter,
  type LibraryViewMode,
} from '~/components/features/library/LibraryToolbar';
import NotesGrid from '~/components/features/library/NotesGrid';
import PdfReaderModal from '~/components/features/library/PdfReaderModal';
import { DEMO_BOOKS } from '~/components/features/library/demoLibrary';
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

function getInitialLibraryStatus(search: string): LibraryStatusFilter {
  const status = new URLSearchParams(search).get('status');
  return status === 'Plan to Do' ||
    status === 'In Progress' ||
    status === 'Completed'
    ? status
    : 'all';
}

export default function Library() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveLibraryTab>(() =>
    new URLSearchParams(location.search).get('tab') === 'notes'
      ? 'notes'
      : 'books',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [selectedType, setSelectedType] = useState<LibraryTypeFilter>('All Types');
  const [selectedStatus, setSelectedStatus] =
    useState<LibraryStatusFilter>(() => getInitialLibraryStatus(location.search));
  const [viewMode, setViewMode] = useState<LibraryViewMode>('grid');
  const [selectedBook, setSelectedBook] = useState<Resource | null>(null);
  const [editingBook, setEditingBook] = useState<Resource | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [readingBook, setReadingBook] = useState<Resource | null>(null);
  const [readerType, setReaderType] = useState<'pdf' | 'epub' | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const handledResourceId = useRef('');

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
    toggleBookPin,
    updateBookProgress,
    deleteBook,
    uploadAttachment,
    removeAttachment,
    updateEpubProgress,
    addNote,
    updateExistingNote,
    deleteExistingNote,
  } = useLibrary();

  useEffect(() => {
    const resourceId = new URLSearchParams(location.search).get('resource') ?? '';
    if (!resourceId) {
      handledResourceId.current = '';
      return;
    }
    if (isLoading || handledResourceId.current === resourceId) return;

    handledResourceId.current = resourceId;
    const resource = books.find((book) => book._id === resourceId);
    if (resource) {
      setActiveTab('books');
      setSelectedBook(resource);
    }
  }, [books, isLoading, location.search]);

  const activeSelectedBook = useMemo(() => {
    if (!selectedBook) return null;
    return (
      books.find((b) => b._id === selectedBook._id) ||
      (selectedBook._id.startsWith('demo-') ? selectedBook : null)
    );
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
      const matchesType =
        selectedType === 'All Types' || book.type === selectedType;
      const matchesStatus =
        selectedStatus === 'all' || book.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesType && matchesStatus;
    });
  }, [
    books,
    searchQuery,
    selectedCategory,
    selectedType,
    selectedStatus,
  ]);

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

  const handleAddDemoBook = async (demoBook: Resource) => {
    const created = await addBook({
      title: demoBook.title,
      author: demoBook.author ?? '',
      category: demoBook.category ?? 'Productivity',
      pages: demoBook.pages ?? 1,
    });
    setSelectedBook(created);
  };

  const handleOpenLinkedNote = (note: Note) => {
    closeBookDetails();
    setActiveTab('notes');
    setEditingNote(note);
  };

  const closeBookDetails = () => {
    setSelectedBook(null);
    handledResourceId.current = '';
    const params = new URLSearchParams(location.search);
    if (params.has('resource')) {
      params.delete('resource');
      const query = params.toString();
      navigate(`${location.pathname}${query ? `?${query}` : ''}`, {
        replace: true,
      });
    }
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
      closeBookDetails();
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
    <div className="library-page route-enter">
      <header className="library-page__header">
        <div>
          <h1>LIBRARY</h1>
          <p>Collect what teaches you something.</p>
        </div>
        <div className="library-page__actions">
          <button
            type="button"
            className="library-notes-toggle"
            onClick={() =>
              setActiveTab(activeTab === 'books' ? 'notes' : 'books')
            }
          >
            {activeTab === 'books' ? (
              <>NOTES &amp; QUOTES <span>{notes.length}</span></>
            ) : (
              <>PERSONAL ARCHIVE <span>{books.length}</span></>
            )}
          </button>
          <button
            type="button"
            className="library-add-button"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={15} aria-hidden="true" />
            ADD RESOURCE
          </button>
        </div>
      </header>

      {error && (
        <div className="library-error" role="alert">
          <div>
            <strong>Unable to load library records</strong>
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => void reload()}>
            <RefreshCw size={14} aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      <LibraryToolbar
        activeTab={activeTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={CATEGORIES}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <section className="library-archive" aria-labelledby="library-archive-title">
        <div className="library-archive__heading">
          <h2 id="library-archive-title">
            {activeTab === 'books' ? 'PERSONAL ARCHIVE' : 'NOTES & QUOTES'}
          </h2>
          <span>
            {activeTab === 'books'
              ? `${filteredBooks.length} resources · sorted by recent`
              : `${filteredNotes.length} notes · sorted by recent`}
          </span>
        </div>

        {isLoading ? (
          <div
            className={`library-skeleton-grid ${
              viewMode === 'list' ? 'is-list' : ''
            }`}
            role="status"
            aria-label={`Loading ${activeTab === 'books' ? 'resources' : 'notes'}`}
          >
            {Array.from({ length: activeTab === 'books' ? 6 : 4 }, (_, index) => (
              <article className="library-skeleton-card" key={index}>
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-3 w-2/5" />
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </article>
            ))}
          </div>
        ) : activeTab === 'books' ? (
          <BookGrid
            books={filteredBooks}
            demoBooks={DEMO_BOOKS}
            viewMode={viewMode}
            onSelectBook={setSelectedBook}
            onTogglePin={(book) => toggleBookPin(book._id)}
            isFiltered={Boolean(
              searchQuery ||
                selectedCategory !== 'All' ||
                selectedType !== 'All Types' ||
                selectedStatus !== 'all',
            )}
          />
        ) : (
          <NotesGrid
            notes={filteredNotes}
            viewMode={viewMode}
            isFiltered={Boolean(searchQuery)}
            onEdit={(note) => setEditingNote(note)}
            onDelete={handleDeleteNote}
            onAddDemo={async (note) => {
              await addNote(note);
            }}
          />
        )}
      </section>

      {/* BOOK DETAIL MODAL */}
      <BookDetailModal
        book={activeSelectedBook}
        notes={notes}
        onClose={closeBookDetails}
        onEdit={(book) => setEditingBook(book)}
        onDelete={handleDeleteBook}
        onUpdateProgress={handleUpdateProgress}
        onTogglePin={async (id) => {
          await toggleBookPin(id);
        }}
        onUploadAttachment={async (id, file) => {
          await uploadAttachment(id, file);
        }}
        onRemoveAttachment={async (id) => {
          await removeAttachment(id);
        }}
        onSaveNote={handleSaveNote}
        onOpenNote={handleOpenLinkedNote}
        onAddDemo={handleAddDemoBook}
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
