import React, { useEffect, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import type {
  Resource,
  ResourceCategory,
  ResourceStatus,
  UpdateResourceInput,
} from '~/lib/library';

interface EditBookModalProps {
  isOpen: boolean;
  book: Resource | null;
  onClose: () => void;
  onSave: (id: string, data: UpdateResourceInput) => Promise<void>;
}

const CATEGORIES: ResourceCategory[] = [
  'Productivity',
  'Focus',
  'Finance',
  'Philosophy',
];

const STATUSES: ResourceStatus[] = ['Plan to Do', 'In Progress', 'Completed'];

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

export default function EditBookModal({
  isOpen,
  book,
  onClose,
  onSave,
}: EditBookModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('Productivity');
  const [status, setStatus] = useState<ResourceStatus>('Plan to Do');
  const [pages, setPages] = useState<number>(300);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [summary, setSummary] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (book && isOpen) {
      setTitle(book.title || '');
      setAuthor(book.author || '');
      setCategory(book.category || 'Productivity');
      setStatus(book.status || 'Plan to Do');
      setPages(book.pages || 300);
      setCurrentPage(book.currentPage || 0);
      setSummary(book.summary || '');
      setSubmitError(null);
    }
  }, [book, isOpen]);

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

  if (!isOpen || !book) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setSubmitError('Book title is required.');
      return;
    }

    const totalPages = Number(pages);
    if (!Number.isInteger(totalPages) || totalPages < 1) {
      setSubmitError('Total pages must be a whole number of at least 1.');
      return;
    }

    const curPage = Number(currentPage);
    if (!Number.isInteger(curPage) || curPage < 0) {
      setSubmitError('Current page must be a positive whole number or zero.');
      return;
    }

    if (curPage > totalPages) {
      setSubmitError('Current page cannot be greater than total pages.');
      return;
    }

    if (summary.length > 1000) {
      setSubmitError('Summary cannot exceed 1000 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: UpdateResourceInput = {
        title: cleanTitle,
        author: author.trim() || undefined,
        category,
        status,
        pages: totalPages,
        currentPage: curPage,
        summary: summary.trim() || undefined,
      };

      await onSave(book._id, payload);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update book.';
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
        aria-labelledby="edit-book-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[94vh] w-full max-w-[708px] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-[28px]"
      >
        {/* Header */}
        <div className="relative shrink-0 bg-[#434341] px-5 pb-6 pt-6 sm:px-7 sm:pb-8 sm:pt-7">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white">
            Edit Book
          </p>
          <h3
            id="edit-book-title"
            className="mt-3 pr-14 font-sans text-[28px] font-normal leading-tight text-white sm:text-[32px] truncate"
          >
            {book.title}
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
            <Field label="Book title" hint="Required">
              <input
                type="text"
                required
                maxLength={200}
                placeholder="e.g. Atomic Habits"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="Author" hint="Optional">
              <input
                type="text"
                maxLength={120}
                placeholder="e.g. James Clear"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Category">
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as ResourceCategory)
                    }
                    className={`${inputCls} cursor-pointer appearance-none pr-10`}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-800" />
                </div>
              </Field>

              <Field label="Reading Status">
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as ResourceStatus)
                    }
                    className={`${inputCls} cursor-pointer appearance-none pr-10`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-800" />
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Total pages" hint="Required">
                <input
                  type="number"
                  min={1}
                  max={100000}
                  required
                  value={pages}
                  onChange={(e) => setPages(Number(e.target.value))}
                  className={inputCls}
                />
              </Field>

              <Field label="Current page">
                <input
                  type="number"
                  min={0}
                  max={pages}
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Book Summary" hint="Optional">
              <textarea
                rows={3}
                maxLength={1000}
                placeholder="Brief summary or key takeaways..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className={`${inputCls} resize-none`}
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
