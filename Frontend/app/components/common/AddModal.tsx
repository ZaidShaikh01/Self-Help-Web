import React, { useEffect, useState } from 'react';
import { X, BookOpen, FileText, ChevronDown } from 'lucide-react';
import ModalLayer from './ModalLayer';
import type { ResourceType } from '~/lib/library';

// ==========================================
// TYPES & INTERFACES
// ==========================================
export type EntryType = 'book' | 'note';
export type BookCategory = 'Productivity' | 'Focus' | 'Finance' | 'Philosophy';

export interface NewBookData {
  title: string;
  author: string;
  category: BookCategory;
  pages: number;
}

export interface NewResourceData {
  title: string;
  type: ResourceType;
  author?: string;
  link?: string;
  category?: BookCategory;
  pages?: number;
}

export interface NewNoteData {
  bookTitle: string;
  quote: string;
  reflection: string;
  tags: string;
  resourceId?: string;
}

export interface AvailableBookOption {
  _id: string;
  title: string;
}

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBook?: (data: NewBookData) => void | Promise<void>;
  onSaveResource?: (data: NewResourceData) => void | Promise<void>;
  onSaveNote?: (data: NewNoteData) => void | Promise<void>;
  defaultTab?: EntryType;
  availableBooks?: AvailableBookOption[];
}

const CATEGORIES: BookCategory[] = [
  'Productivity',
  'Focus',
  'Finance',
  'Philosophy',
];
const RESOURCE_TYPES: ResourceType[] = [
  'Book',
  'Article',
  'YouTube',
  'Documentary',
];

// ==========================================
// SHARED STYLES
// ==========================================
const inputCls =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-3)] transition-colors focus:border-[var(--accent)] focus:outline-none';

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: 'Required' | 'Optional';
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[13px] font-semibold text-[var(--text)]">
        {label}
      </span>
      {hint && (
        <span className="mt-1.5 block text-[13px] text-[var(--text-3)]">
          {hint}
        </span>
      )}
      <div className={hint ? 'mt-2' : 'mt-2.5'}>{children}</div>
    </label>
  );
}

// ==========================================
// COMPONENT
// ==========================================
const AddModal: React.FC<AddModalProps> = ({
  isOpen,
  onClose,
  onSaveBook,
  onSaveResource,
  onSaveNote,
  defaultTab = 'book',
  availableBooks = [],
}) => {
  const [activeTab, setActiveTab] = useState<EntryType>(defaultTab);

  // Book form
  const [bookTitle, setBookTitle] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('Book');
  const [bookAuthor, setBookAuthor] = useState('');
  const [resourceLink, setResourceLink] = useState('');
  const [bookCategory, setBookCategory] =
    useState<BookCategory>('Productivity');
  const [bookPages, setBookPages] = useState<number>(300);

  // Note form
  const [noteBookTitle, setNoteBookTitle] = useState('');
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [noteQuote, setNoteQuote] = useState('');
  const [noteReflection, setNoteReflection] = useState('');
  const [noteTags, setNoteTags] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Start on the requested tab each time it opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setSubmitError(null);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  const resetForms = () => {
    setBookTitle('');
    setResourceType('Book');
    setBookAuthor('');
    setResourceLink('');
    setBookCategory('Productivity');
    setBookPages(300);
    setNoteBookTitle('');
    setSelectedResourceId('');
    setNoteQuote('');
    setNoteReflection('');
    setNoteTags('');
    setSubmitError(null);
  };

  const handleBookSelect = (bookId: string) => {
    setSelectedResourceId(bookId);
    if (bookId) {
      const found = availableBooks.find((b) => b._id === bookId);
      if (found) setNoteBookTitle(found.title);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (activeTab === 'book') {
        if (!bookTitle.trim()) {
          setSubmitError('Please enter a resource title.');
          setIsSubmitting(false);
          return;
        }

        const resourceData: NewResourceData = {
          title: bookTitle.trim(),
          type: resourceType,
          author: bookAuthor.trim() || undefined,
          link: resourceLink.trim() || undefined,
          ...(resourceType === 'Book'
            ? {
                category: bookCategory,
                pages: Number(bookPages) || 1,
              }
            : {}),
        };
        if (onSaveResource) {
          await onSaveResource(resourceData);
        } else if (resourceType === 'Book') {
          await onSaveBook?.({
            title: resourceData.title,
            author: resourceData.author ?? '',
            category: resourceData.category ?? 'Productivity',
            pages: resourceData.pages ?? 1,
          });
        }
      } else {
        if (!noteQuote.trim() && !noteReflection.trim()) {
          setSubmitError('Please provide a favorite quote or personal reflection.');
          setIsSubmitting(false);
          return;
        }

        const effectiveTitle = noteBookTitle.trim();
        if (!effectiveTitle && !selectedResourceId) {
          setSubmitError('Please provide a source title or select a book.');
          setIsSubmitting(false);
          return;
        }

        await onSaveNote?.({
          bookTitle: effectiveTitle,
          quote: noteQuote.trim(),
          reflection: noteReflection.trim(),
          tags: noteTags.trim(),
          resourceId: selectedResourceId || undefined,
        });
      }

      resetForms();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An error occurred while saving.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabCls = (tab: EntryType) =>
    `flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-all ${
      activeTab === tab
      ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
      : 'text-[var(--text-3)] hover:text-[var(--text)]'
    }`;

  return (
    <ModalLayer
      canDismiss={!isSubmitting}
      onClose={onClose}
      className="library-modal-backdrop fixed inset-0 z-[10000] grid place-items-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-modal-title"
        className="library-modal-panel flex max-h-[90vh] w-full max-w-[708px] flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
      >
        {/* Header */}
        <div className="relative shrink-0 border-b border-[var(--border-subtle)] px-5 pb-4 pt-5 sm:px-7 sm:pb-4 sm:pt-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)]">
            New entry
          </p>
          <h3
            id="add-modal-title"
            className="mt-1 pr-14 text-xl font-medium tracking-tight text-[var(--text)]"
          >
            Add to your library
          </h3>
          <button
            type="button"
            aria-label="Close"
            disabled={isSubmitting}
            onClick={onClose}
            className="absolute right-5 top-5 grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-3)] transition-colors hover:bg-[var(--canvas-2)] hover:text-[var(--text)] disabled:opacity-50 sm:right-7 sm:top-6"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error notification */}
        {submitError && (
          <div
            role="alert"
            className="border-b border-[var(--danger-border)] bg-[var(--danger-soft)] px-5 py-3 text-xs text-[var(--danger-text)] sm:px-7"
          >
            {submitError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-7">
            {/* Tab switcher */}
            <div className="flex rounded-xl bg-[var(--canvas-2)] p-1 ring-1 ring-[var(--border)]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('book');
                  setSubmitError(null);
                }}
                className={tabCls('book')}
              >
                <BookOpen className="h-3.5 w-3.5" /> New resource
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('note');
                  setSubmitError(null);
                }}
                className={tabCls('note')}
              >
                <FileText className="h-3.5 w-3.5" /> Quote / note
              </button>
            </div>

            {activeTab === 'book' ? (
              <>
                <Field label="Resource type" hint="Required">
                  <div className="relative">
                    <select
                      value={resourceType}
                      onChange={(event) =>
                        setResourceType(event.target.value as ResourceType)
                      }
                      className={`${inputCls} cursor-pointer appearance-none pr-10`}
                    >
                      {RESOURCE_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text)]" />
                  </div>
                </Field>

                <Field label="Resource title" hint="Required">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Atomic Habits or an article title"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    className={inputCls}
                  />
                </Field>

                <Field label="Author / creator" hint="Optional">
                  <input
                    type="text"
                    placeholder="e.g. James Clear"
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    className={inputCls}
                  />
                </Field>

                <Field label="Link" hint="Optional">
                  <input
                    type="url"
                    placeholder="https://…"
                    value={resourceLink}
                    onChange={(e) => setResourceLink(e.target.value)}
                    className={inputCls}
                  />
                </Field>

                {resourceType === 'Book' && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3.5">
                    <Field label="Category">
                      <div className="relative">
                        <select
                          value={bookCategory}
                          onChange={(e) =>
                            setBookCategory(e.target.value as BookCategory)
                          }
                          className={`${inputCls} cursor-pointer appearance-none pr-10`}
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text)]" />
                      </div>
                    </Field>
                    <Field label="Total pages">
                      <input
                        type="number"
                        min={1}
                        value={bookPages}
                        onChange={(e) => setBookPages(Number(e.target.value))}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                )}
              </>
            ) : (
              <>
                {availableBooks.length > 0 && (
                  <Field label="Link to an existing book" hint="Optional">
                    <div className="relative">
                      <select
                        value={selectedResourceId}
                        onChange={(e) => handleBookSelect(e.target.value)}
                        className={`${inputCls} cursor-pointer appearance-none pr-10`}
                      >
                        <option value="">-- No linked book (enter custom title below) --</option>
                        {availableBooks.map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text)]" />
                    </div>
                  </Field>
                )}

                <Field label="Book / source title" hint={selectedResourceId ? 'Optional' : 'Required'}>
                  <input
                    type="text"
                    required={!selectedResourceId}
                    placeholder="e.g. Deep Work"
                    value={noteBookTitle}
                    onChange={(e) => setNoteBookTitle(e.target.value)}
                    className={inputCls}
                  />
                </Field>

                <Field label="Favorite quote / excerpt" hint="Optional">
                  <textarea
                    rows={3}
                    placeholder="Paste the exact quote here..."
                    value={noteQuote}
                    onChange={(e) => setNoteQuote(e.target.value)}
                    className={`${inputCls} resize-none`}
                  />
                </Field>

                <Field label="Personal reflection" hint="Optional">
                  <textarea
                    rows={3}
                    placeholder="What does this mean for your daily routine?"
                    value={noteReflection}
                    onChange={(e) => setNoteReflection(e.target.value)}
                    className={`${inputCls} resize-none`}
                  />
                </Field>

                <Field label="Tags" hint="Optional">
                  <input
                    type="text"
                    placeholder="e.g. systems, focus (comma separated, max 10)"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </>
            )}

            <p className="font-mono text-[11px] leading-relaxed text-[var(--text-3)]">
              Everything you add stays in your personal library. You can edit it
              later.
            </p>
          </div>

          {/* Footer actions */}
          <div className="shrink-0 border-t border-[var(--border-subtle)] px-5 py-4 sm:mx-7 sm:px-0 sm:py-5">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="h-12 cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--text)] transition-colors hover:bg-[var(--canvas-2)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 cursor-pointer rounded-xl bg-[var(--accent-fill)] px-6 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-fill-hover)] disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Saving…'
                  : `Save ${activeTab === 'book' ? 'resource' : 'note'}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </ModalLayer>
  );
};

export default AddModal;
