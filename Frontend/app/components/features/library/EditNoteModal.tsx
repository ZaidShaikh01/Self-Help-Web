import React, { useEffect, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import type { Note } from '~/lib/library';
import type { AvailableBookOption } from '~/components/common/AddModal';
import ModalLayer from '~/components/common/ModalLayer';

interface EditNoteModalProps {
  isOpen: boolean;
  note: Note | null;
  availableBooks: AvailableBookOption[];
  onClose: () => void;
  onSave: (
    id: string,
    data: {
      title?: string;
      quote?: string;
      reflection?: string;
      tags?: string;
      resourceId?: string;
    },
  ) => Promise<void>;
}

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

export default function EditNoteModal({
  isOpen,
  note,
  availableBooks,
  onClose,
  onSave,
}: EditNoteModalProps) {
  const [noteBookTitle, setNoteBookTitle] = useState('');
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [noteQuote, setNoteQuote] = useState('');
  const [noteReflection, setNoteReflection] = useState('');
  const [noteTags, setNoteTags] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (note && isOpen) {
      setNoteBookTitle(note.title || '');
      const resId =
        note.resource && typeof note.resource === 'object'
          ? note.resource._id
          : typeof note.resource === 'string'
            ? note.resource
            : '';
      setSelectedResourceId(resId || '');
      setNoteQuote(note.quote || '');
      setNoteReflection(note.content || '');
      setNoteTags(note.tags ? note.tags.join(', ') : '');
      setSubmitError(null);
    }
  }, [note, isOpen]);

  if (!isOpen || !note) return null;

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

    const trimmedQuote = noteQuote.trim();
    const trimmedReflection = noteReflection.trim();

    if (!trimmedQuote && !trimmedReflection) {
      setSubmitError('Please provide a quote or personal reflection.');
      return;
    }

    const effectiveTitle = noteBookTitle.trim();
    if (!effectiveTitle && !selectedResourceId) {
      setSubmitError('Please provide a source title or select a book.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(note._id, {
        title: effectiveTitle,
        quote: trimmedQuote,
        reflection: trimmedReflection,
        tags: noteTags.trim(),
        resourceId: selectedResourceId || undefined,
      });

      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update note.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalLayer
      canDismiss={!isSubmitting}
      onClose={onClose}
      className="fixed inset-0 z-[10000] grid place-items-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-note-title"
        className="flex max-h-[90vh] w-full max-w-[708px] flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
      >
        {/* Header */}
        <div className="relative shrink-0 border-b border-[var(--border-subtle)] px-5 pb-4 pt-5 sm:px-7 sm:pb-4 sm:pt-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)]">
            Edit Note
          </p>
          <h3
            id="edit-note-title"
            className="mt-1 truncate pr-14 text-xl font-medium tracking-tight text-[var(--text)]"
          >
            {note.title || 'Note & Quote'}
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
            className="border-b border-red-200 bg-red-50 px-5 py-3 text-xs text-red-700 sm:px-7"
          >
            {submitError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-7">
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
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </ModalLayer>
  );
}
