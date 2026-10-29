import React, { useEffect, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import type { Note } from '~/lib/library';
import type { AvailableBookOption } from '~/components/common/AddModal';

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
  'w-full rounded-xl border border-neutral-300 bg-[#f1f1ef] px-4 py-3 text-[14px] text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff3d00]/20';

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
      <span className="block text-[13px] font-semibold text-neutral-900">
        {label}
      </span>
      {hint && (
        <span className="mt-1.5 block text-[13px] text-neutral-400">
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

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose, isSubmitting]);

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
    <div
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-note-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[94vh] w-full max-w-[708px] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-[28px]"
      >
        {/* Header */}
        <div className="relative shrink-0 bg-[#434341] px-5 pb-6 pt-6 sm:px-7 sm:pb-8 sm:pt-7">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white">
            Edit Note
          </p>
          <h3
            id="edit-note-title"
            className="mt-3 pr-14 font-sans text-[28px] font-normal leading-tight text-white sm:text-[32px] truncate"
          >
            {note.title || 'Note & Quote'}
          </h3>
          <button
            type="button"
            aria-label="Close"
            disabled={isSubmitting}
            onClick={onClose}
            className="absolute right-5 top-5 grid h-11 w-11 cursor-pointer place-items-center rounded-xl border border-neutral-300 bg-white text-neutral-900 transition-colors hover:bg-neutral-100 disabled:opacity-50 sm:right-7 sm:top-7"
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
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-800" />
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
          <div className="shrink-0 border-t border-neutral-200 px-5 py-4 sm:mx-7 sm:px-0 sm:py-5">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="h-12 cursor-pointer rounded-xl border border-neutral-300 bg-white px-6 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-neutral-900 transition-colors hover:bg-neutral-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 cursor-pointer rounded-xl bg-[#ff3d00] px-6 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#e03600] disabled:opacity-50"
              >
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
