import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ExternalLink,
  FileText,
  Pencil,
  Pin,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import ConfirmDialog from '~/components/common/ConfirmDialog';
import ModalLayer from '~/components/common/ModalLayer';
import type { NewNoteData } from '~/components/common/AddModal';
import type { Note, Resource, ResourceStatus } from '~/lib/library';

interface BookDetailModalProps {
  book: Resource | null;
  notes: Note[];
  onClose: () => void;
  onEdit: (book: Resource) => void;
  onDelete: (book: Resource) => void;
  onUpdateProgress: (
    id: string,
    currentPage: number,
    status?: ResourceStatus,
  ) => Promise<void>;
  onTogglePin: (id: string) => Promise<void>;
  onUploadAttachment: (id: string, file: File) => Promise<void>;
  onRemoveAttachment: (id: string) => Promise<void>;
  onOpenPdfReader: (book: Resource) => void;
  onOpenEpubReader: (book: Resource) => void;
  onSaveNote: (data: NewNoteData) => Promise<void>;
  onOpenNote: (note: Note) => void;
  onAddDemo: (book: Resource) => Promise<void>;
}

const STATUSES: ResourceStatus[] = ['Plan to Do', 'In Progress', 'Completed'];
const DEMO_CONNECTIONS = [
  { title: 'What stayed with me', type: 'Sample journal entry' },
  { title: 'Reading', type: 'Sample habit' },
];

function formatDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Recently';
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatFileSize(bytes?: number) {
  if (!bytes || bytes <= 0) return '0 B';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function BookDetailModal({
  book,
  notes,
  onClose,
  onEdit,
  onDelete,
  onUpdateProgress,
  onTogglePin,
  onUploadAttachment,
  onRemoveAttachment,
  onOpenPdfReader,
  onOpenEpubReader,
  onSaveNote,
  onOpenNote,
  onAddDemo,
}: BookDetailModalProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [status, setStatus] = useState<ResourceStatus>('Plan to Do');
  const [isUpdating, setIsUpdating] = useState(false);
  const [progressError, setProgressError] = useState('');
  const [progressSaved, setProgressSaved] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [noteError, setNoteError] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');
  const [confirmRemoveAttachment, setConfirmRemoveAttachment] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [demoError, setDemoError] = useState('');
  const [pinError, setPinError] = useState('');
  const [isPinning, setIsPinning] = useState(false);
  const [isAddingDemo, setIsAddingDemo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!book) return;
    setCurrentPage(book.currentPage || 0);
    setStatus(book.status || 'Plan to Do');
    setNoteDraft('');
    setNoteError('');
    setProgressError('');
    setProgressSaved(false);
    setAttachmentError('');
    setDemoError('');
  }, [book?._id]);

  if (!book) return null;
  const currentBook = book;

  const isDemo = book._id.startsWith('demo-');
  const totalPages = book.pages ?? 0;
  const progress = totalPages
    ? Math.max(0, Math.min(100, Math.round((currentPage / totalPages) * 100)))
    : Math.max(0, Math.min(100, Math.round(book.progress || 0)));
  const isEpub = Boolean(
    book.attachment?.mimeType === 'application/epub+zip' ||
      book.attachment?.fileName?.toLowerCase().endsWith('.epub'),
  );
  const linkedNotes = notes.filter(
    (note) =>
      note.resource &&
      typeof note.resource === 'object' &&
      note.resource._id === book._id,
  );

  async function saveProgress(nextPage: number, nextStatus: ResourceStatus) {
    setProgressError('');
    setProgressSaved(false);
    setIsUpdating(true);
    try {
      await onUpdateProgress(currentBook._id, nextPage, nextStatus);
      setProgressSaved(true);
    } catch (error) {
      setProgressError(
        error instanceof Error ? error.message : 'Progress could not be saved.',
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleStatusChange(nextStatus: ResourceStatus) {
    setStatus(nextStatus);
    const nextPage =
      nextStatus === 'Completed' && totalPages > 0
        ? totalPages
        : currentPage;
    setCurrentPage(nextPage);
    await saveProgress(nextPage, nextStatus);
  }

  async function handleProgressSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!Number.isInteger(currentPage) || currentPage < 0) {
      setProgressError('Enter a whole page number of zero or more.');
      return;
    }
    if (totalPages > 0 && currentPage > totalPages) {
      setProgressError(`Current page cannot exceed ${totalPages}.`);
      return;
    }
    const nextStatus =
      totalPages > 0 && currentPage >= totalPages
        ? 'Completed'
        : currentPage > 0 && status === 'Plan to Do'
          ? 'In Progress'
          : status;
    setStatus(nextStatus);
    await saveProgress(currentPage, nextStatus);
  }

  async function handleSaveNote() {
    if (!noteDraft.trim()) {
      setNoteError('Write a short reflection before saving.');
      return;
    }
    setIsSavingNote(true);
    setNoteError('');
    try {
      await onSaveNote({
        bookTitle: currentBook.title,
        quote: '',
        reflection: noteDraft.trim(),
        tags: '',
        resourceId: currentBook._id,
      });
      setNoteDraft('');
    } catch (error) {
      setNoteError(
        error instanceof Error ? error.message : 'Your note could not be saved.',
      );
    } finally {
      setIsSavingNote(false);
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.pdf') && !name.endsWith('.epub')) {
      setAttachmentError('Choose a PDF or EPUB file.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setAttachmentError('The file must be smaller than 50 MB.');
      return;
    }

    setAttachmentError('');
    setIsUploading(true);
    try {
      await onUploadAttachment(currentBook._id, file);
    } catch (error) {
      setAttachmentError(
        error instanceof Error ? error.message : 'The file could not be uploaded.',
      );
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  async function handleRemoveAttachment() {
    setIsUploading(true);
    setAttachmentError('');
    try {
      await onRemoveAttachment(currentBook._id);
    } catch (error) {
      setAttachmentError(
        error instanceof Error ? error.message : 'The file could not be removed.',
      );
      throw error;
    } finally {
      setIsUploading(false);
    }
  }

  async function handleAddDemo() {
    setIsAddingDemo(true);
    setDemoError('');
    try {
      await onAddDemo(currentBook);
    } catch (error) {
      setDemoError(
        error instanceof Error ? error.message : 'The example could not be added.',
      );
    } finally {
      setIsAddingDemo(false);
    }
  }

  async function handleTogglePin() {
    setIsPinning(true);
    setPinError('');
    try {
      await onTogglePin(currentBook._id);
    } catch (error) {
      setPinError(
        error instanceof Error ? error.message : 'Pinned status could not be updated.',
      );
    } finally {
      setIsPinning(false);
    }
  }

  return (
    <ModalLayer
      canDismiss={
        !isUpdating &&
        !isUploading &&
        !isSavingNote &&
        !isAddingDemo &&
        !isPinning
      }
      onClose={onClose}
      className="library-detail-overlay fixed inset-0 z-[10000] overflow-y-auto bg-[var(--canvas)] text-[var(--text)]"
    >
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-detail-title"
        className="library-detail-panel mx-auto min-h-screen w-full max-w-[1440px] px-5 pb-12 sm:px-8 lg:px-12"
      >
        <div className="library-detail-topbar">
          <button type="button" onClick={onClose} className="library-detail-back">
            <ArrowLeft size={14} aria-hidden="true" />
            Library
          </button>
          <span>{progress}%</span>
        </div>

        <section className="library-detail-hero">
          <div className="library-detail-cover" aria-hidden="true">
            <span>{getInitials(book.author || book.type)}</span>
            <i />
            <strong>{book.title}</strong>
            <small>{book.category || book.type} / {progress}%</small>
          </div>

          <div className="library-detail-intro">
            <p className="library-detail-kicker">
              {isDemo ? 'DEMO BOOK' : book.type.toUpperCase()} <span>·</span>{' '}
              ADDED {formatDate(book.createdAt).toUpperCase()}
            </p>
            <h1 id="book-detail-title">{book.title}</h1>
            <p className="library-detail-author">{book.author || 'Unknown author'}</p>
            {book.summary && <p className="library-detail-summary">{book.summary}</p>}
            <span className="library-detail-tag">
              {book.category || 'Personal library'}
            </span>
            {!isDemo && (
              <button
                type="button"
                className="library-detail-tag library-detail-pin"
                onClick={() => void handleTogglePin()}
                disabled={isPinning}
                aria-pressed={book.isPinned}
              >
                <Pin size={13} fill={book.isPinned ? 'currentColor' : 'none'} />
                {isPinning ? 'Saving…' : book.isPinned ? 'Unpin' : 'Pin book'}
              </button>
            )}
            {pinError && <p className="library-inline-error" role="alert">{pinError}</p>}
          </div>

          <div className="library-detail-status">
            <label htmlFor="book-detail-status">Status</label>
            <div className="library-detail-select">
              <select
                id="book-detail-status"
                value={status}
                disabled={isDemo || isUpdating}
                onChange={(event) =>
                  void handleStatusChange(event.target.value as ResourceStatus)
                }
              >
                {STATUSES.map((value) => (
                  <option value={value} key={value}>{value}</option>
                ))}
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </div>
            {isDemo && <small>Add this example to track it.</small>}
          </div>
        </section>

        <div className="library-detail-columns">
          <main className="library-detail-main">
            {isDemo ? (
              <section className="library-detail-section library-demo-callout">
                <div>
                  <span className="library-detail-section-label">EXAMPLE RESOURCE</span>
                  <p>Save this book to your library to track progress and add private notes.</p>
                </div>
                <button
                  type="button"
                  className="library-primary-action"
                  disabled={isAddingDemo}
                  onClick={() => void handleAddDemo()}
                >
                  <Plus size={15} />
                  {isAddingDemo ? 'Adding…' : 'Add to my library'}
                </button>
                {demoError && <p role="alert" className="library-inline-error">{demoError}</p>}
              </section>
            ) : (
              <>
                <section className="library-detail-section">
                  <h2><span>[01]</span> PERSONAL NOTE</h2>
                  <textarea
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                    placeholder="What idea do you want to carry into your day?"
                    aria-label="Personal note for this book"
                    rows={4}
                    disabled={isSavingNote}
                  />
                  <div className="library-detail-note-footer">
                    <span>Private to your workspace</span>
                    <button
                      type="button"
                      className="library-primary-action"
                      disabled={isSavingNote || !noteDraft.trim()}
                      onClick={() => void handleSaveNote()}
                    >
                      <Check size={14} />
                      {isSavingNote ? 'Saving…' : 'Save note'}
                    </button>
                  </div>
                  {noteError && <p role="alert" className="library-inline-error">{noteError}</p>}
                </section>

                <section className="library-detail-section library-book-timeline">
                  <h2><span>[02]</span> TIMELINE HISTORY</h2>
                  <article>
                    <time>{formatDate(book.createdAt)}</time>
                    <i aria-hidden="true" />
                    <div>
                      <small>RESOURCE ADDED</small>
                      <strong>{book.title} added to your library</strong>
                    </div>
                  </article>
                  {book.updatedAt !== book.createdAt && (
                    <article>
                      <time>{formatDate(book.updatedAt)}</time>
                      <i aria-hidden="true" />
                      <div>
                        <small>READING PROGRESS</small>
                        <strong>{progress}% complete · {status}</strong>
                      </div>
                    </article>
                  )}
                  {linkedNotes.map((note) => (
                    <article key={note._id}>
                      <time>{formatDate(note.createdAt)}</time>
                      <i aria-hidden="true" />
                      <div>
                        <small>PERSONAL NOTE</small>
                        <strong>{note.title || 'Reflection saved'}</strong>
                      </div>
                    </article>
                  ))}
                </section>
              </>
            )}

            {!isDemo && (
              <>
                <section className="library-detail-section library-attachment-section">
                  <div className="library-detail-section-heading">
                    <h2><span>[04]</span> READING FILE</h2>
                    {book.attachment && (
                      <span>{isEpub ? 'EPUB' : 'PDF'} · {formatFileSize(book.attachment.size)}</span>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.epub,application/pdf,application/epub+zip"
                    className="sr-only"
                    disabled={isUploading}
                    onChange={(event) => void handleFileChange(event)}
                  />
                  {attachmentError && <p role="alert" className="library-inline-error">{attachmentError}</p>}
                  {book.attachment ? (
                    <div className="library-attachment-row">
                      <div>
                        <BookOpen size={17} />
                        <span>
                          <strong>{book.attachment.fileName}</strong>
                          <small>{formatFileSize(book.attachment.size)} · saved to your private library</small>
                        </span>
                      </div>
                      <div className="library-attachment-actions">
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => isEpub ? onOpenEpubReader(book) : onOpenPdfReader(book)}
                        >
                          <BookOpen size={14} /> Read
                        </button>
                        <button type="button" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
                          <RefreshCw size={14} /> Replace
                        </button>
                        <button type="button" disabled={isUploading} onClick={() => setConfirmRemoveAttachment(true)}>
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="library-upload-action"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={16} />
                      {isUploading ? 'Uploading…' : 'Attach a PDF or EPUB'}
                    </button>
                  )}
                </section>

                <form
                  onSubmit={(event) => void handleProgressSubmit(event)}
                  className="library-detail-section library-progress-form"
                >
                  <div className="library-detail-section-heading">
                    <h2><span>[05]</span> READING PROGRESS</h2>
                    <strong>{progress}%</strong>
                  </div>
                  <div className="library-progress-track">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  {progressError && <p role="alert" className="library-inline-error">{progressError}</p>}
                  <div className="library-progress-controls">
                    <label>
                      Current page
                      <input
                        type="number"
                        min={0}
                        max={totalPages || 100000}
                        value={currentPage}
                        onChange={(event) => setCurrentPage(Number(event.target.value))}
                        disabled={isUpdating}
                      />
                      {totalPages > 0 && <span>/ {totalPages}</span>}
                    </label>
                    <button type="submit" className="library-primary-action" disabled={isUpdating}>
                      {isUpdating ? 'Saving…' : progressSaved ? 'Saved' : 'Save progress'}
                    </button>
                  </div>
                </form>

                <footer className="library-detail-actions">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEdit(book);
                    }}
                  >
                    <Pencil size={14} /> Edit book
                  </button>
                  <button type="button" className="is-danger" onClick={() => onDelete(book)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </footer>
              </>
            )}
          </main>

          <aside className="library-detail-aside">
            <section>
              <h2>CONNECTIONS</h2>
              {isDemo ? (
                DEMO_CONNECTIONS.map((connection) => (
                  <div className="library-connection-card is-demo" key={connection.title}>
                    <FileText size={15} />
                    <span><strong>{connection.title}</strong><small>{connection.type}</small></span>
                  </div>
                ))
              ) : linkedNotes.length ? (
                linkedNotes.map((note) => (
                  <button
                    type="button"
                    className="library-connection-card"
                    key={note._id}
                    onClick={() => onOpenNote(note)}
                  >
                    <FileText size={15} />
                    <span>
                      <strong>{note.title || 'Personal reflection'}</strong>
                      <small>{note.quote || note.content || 'Related note'}</small>
                    </span>
                  </button>
                ))
              ) : (
                <p className="library-detail-muted">Notes you save here will appear as connections.</p>
              )}
            </section>

            <section className="library-detail-meta">
              <h2>RESOURCE DETAILS</h2>
              <p><span>Type</span><strong>{book.type}</strong></p>
              <p><span>Status</span><strong>{status}</strong></p>
              {totalPages > 0 && <p><span>Pages</span><strong>{currentPage} / {totalPages}</strong></p>}
              <p><span>Added</span><strong>{formatDate(book.createdAt)}</strong></p>
              {book.link ? (
                <a href={book.link} target="_blank" rel="noreferrer">
                  <ExternalLink size={14} /> Open source
                </a>
              ) : (
                <span className="library-detail-muted">No external source linked</span>
              )}
            </section>
          </aside>
        </div>
      </article>
      {confirmRemoveAttachment && (
        <ConfirmDialog
          title="Remove attached file?"
          description="Remove this file? Your book and notes will stay saved."
          confirmLabel="Remove file"
          tone="danger"
          onClose={() => setConfirmRemoveAttachment(false)}
          onConfirm={handleRemoveAttachment}
        />
      )}
    </ModalLayer>
  );
}
