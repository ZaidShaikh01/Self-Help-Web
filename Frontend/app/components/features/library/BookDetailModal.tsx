import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Pencil,
  Trash2,
  CheckCircle2,
  ChevronDown,
  BookOpen,
  FileText,
  Upload,
  RefreshCw,
  AlertCircle,
  Bookmark,
} from 'lucide-react';
import type { Resource, ResourceStatus } from '~/lib/library';

interface BookDetailModalProps {
  book: Resource | null;
  onClose: () => void;
  onEdit: (book: Resource) => void;
  onDelete: (book: Resource) => void;
  onUpdateProgress: (
    id: string,
    currentPage: number,
    status?: ResourceStatus,
  ) => Promise<void>;
  onUploadAttachment: (id: string, file: File) => Promise<void>;
  onRemoveAttachment: (id: string) => Promise<void>;
  onOpenPdfReader: (book: Resource) => void;
  onOpenEpubReader: (book: Resource) => void;
}

const STATUSES: ResourceStatus[] = ['Plan to Do', 'In Progress', 'Completed'];

function formatFileSize(bytes?: number) {
  if (!bytes || bytes <= 0) return '0 B';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

export default function BookDetailModal({
  book,
  onClose,
  onEdit,
  onDelete,
  onUpdateProgress,
  onUploadAttachment,
  onRemoveAttachment,
  onOpenPdfReader,
  onOpenEpubReader,
}: BookDetailModalProps) {
  const [currentPageInput, setCurrentPageInput] = useState<number>(0);
  const [statusInput, setStatusInput] = useState<ResourceStatus>('Plan to Do');
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [progressSuccess, setProgressSuccess] = useState(false);

  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (book) {
      setCurrentPageInput(book.currentPage || 0);
      setStatusInput(book.status || 'Plan to Do');
      setProgressError(null);
      setProgressSuccess(false);
      setAttachmentError(null);
    }
  }, [book]);

  useEffect(() => {
    if (!book) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isUpdatingProgress && !isUploadingAttachment) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [book, onClose, isUpdatingProgress, isUploadingAttachment]);

  if (!book) return null;

  const totalPages = book.pages || 0;
  const progressPercent =
    typeof book.progress === 'number'
      ? book.progress
      : totalPages > 0
        ? Math.min(
            100,
            Math.round(((book.currentPage || 0) / totalPages) * 100),
          )
        : 0;

  const hasAttachment = Boolean(
    book.attachment &&
      (book.attachment.fileName || book.attachment.mimeType),
  );

  const isEpub = Boolean(
    hasAttachment &&
      (book.attachment?.mimeType === 'application/epub+zip' ||
        book.attachment?.fileName?.toLowerCase().endsWith('.epub')),
  );

  const handleStatusChange = (newStatus: ResourceStatus) => {
    setStatusInput(newStatus);
    if (newStatus === 'Completed' && totalPages > 0) {
      setCurrentPageInput(totalPages);
    }
  };

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    setProgressError(null);
    setProgressSuccess(false);

    const pageNum = Number(currentPageInput);
    if (!Number.isInteger(pageNum) || pageNum < 0) {
      setProgressError('Current page must be a positive number or zero.');
      return;
    }

    if (totalPages > 0 && pageNum > totalPages) {
      setProgressError(
        `Current page cannot exceed total pages (${totalPages}).`,
      );
      return;
    }

    let resolvedStatus = statusInput;
    if (
      totalPages > 0 &&
      pageNum >= totalPages &&
      resolvedStatus !== 'Completed'
    ) {
      resolvedStatus = 'Completed';
      setStatusInput('Completed');
    } else if (pageNum > 0 && resolvedStatus === 'Plan to Do') {
      resolvedStatus = 'In Progress';
      setStatusInput('In Progress');
    }

    setIsUpdatingProgress(true);

    try {
      await onUpdateProgress(book._id, pageNum, resolvedStatus);
      setProgressSuccess(true);
      setTimeout(() => setProgressSuccess(false), 2500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update progress.';
      setProgressError(message);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachmentError(null);

    const ext = file.name.toLowerCase();
    const hasValidExt = ext.endsWith('.pdf') || ext.endsWith('.epub');

    if (!hasValidExt) {
      setAttachmentError('Please select a valid PDF (.pdf) or EPUB (.epub) file.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setAttachmentError('File size exceeds the 50 MB maximum limit.');
      return;
    }

    setIsUploadingAttachment(true);
    try {
      await onUploadAttachment(book._id, file);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to upload attachment.';
      setAttachmentError(message);
    } finally {
      setIsUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to remove this attachment? The book record and your notes will remain intact.',
    );
    if (!confirmed) return;

    setAttachmentError(null);
    setIsUploadingAttachment(true);
    try {
      await onRemoveAttachment(book._id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to remove attachment.';
      setAttachmentError(message);
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  return (
    <div
      onClick={() => {
        if (!isUpdatingProgress && !isUploadingAttachment) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-detail-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-[#EEEEEE] max-h-[90vh] overflow-y-auto"
      >
        {/* Top Header */}
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E6AE1] bg-[#3E6AE1]/10 px-2 py-0.5 rounded">
                {book.category || 'Book'}
              </span>
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                {book.status}
              </span>
            </div>
            <h2
              id="book-detail-title"
              className="text-xl font-bold text-[#171A20] mt-1.5 break-words"
            >
              {book.title}
            </h2>
            {book.author && (
              <p className="text-xs text-[#5C5E62]">By {book.author}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close book details"
            disabled={isUpdatingProgress || isUploadingAttachment}
            className="p-1.5 bg-[#F4F4F4] hover:bg-[#EEEEEE] rounded-full transition-all text-[#171A20] disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary */}
        {book.summary && (
          <div className="space-y-1.5 bg-[#F4F4F4] p-4 rounded-xl">
            <h4 className="text-xs font-bold text-[#5C5E62] uppercase tracking-wider">
              Book Summary
            </h4>
            <p className="text-sm text-[#393C41] leading-relaxed">
              {book.summary}
            </p>
          </div>
        )}

        {/* EBOOK ATTACHMENT SECTION (PDF & EPUB) */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#3E6AE1]" />
              <span>Book Attachment</span>
            </h4>
            {hasAttachment && (
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isEpub
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {isEpub ? 'EPUB' : 'PDF'}
                </span>
                <span className="text-[11px] font-mono text-neutral-500">
                  {formatFileSize(book.attachment?.size)}
                </span>
              </div>
            )}
          </div>

          {attachmentError && (
            <div
              role="alert"
              className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{attachmentError}</span>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.epub,application/pdf,application/epub+zip"
            className="hidden"
            disabled={isUploadingAttachment}
          />

          {hasAttachment ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-neutral-200">
                <div className="flex items-center gap-2.5 min-w-0">
                  <BookOpen className="w-4 h-4 text-[#3E6AE1] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-neutral-900 truncate">
                      {book.attachment?.fileName || 'Attached Book'}
                    </p>
                    {isEpub && book.attachment?.epubProgress ? (
                      <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <Bookmark className="w-3 h-3" />
                        <span>
                          {book.attachment.epubProgress.percentage}% read (saved
                          position)
                        </span>
                      </p>
                    ) : (
                      <p className="text-[10px] text-neutral-500">
                        Uploaded to private vault
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      isEpub ? onOpenEpubReader(book) : onOpenPdfReader(book)
                    }
                    disabled={isUploadingAttachment}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#171A20] hover:bg-[#393C41] px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{isEpub ? 'Read EPUB' : 'Read PDF'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAttachment}
                  className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-900 font-medium cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3 h-3" /> Replace file
                </button>

                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  disabled={isUploadingAttachment}
                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-medium cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" /> Remove file
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 border border-dashed border-neutral-300 rounded-lg bg-white text-center space-y-2">
              <Upload className="w-5 h-5 text-neutral-400" />
              <div>
                <p className="text-xs font-semibold text-neutral-800">
                  No ebook attached
                </p>
                <p className="text-[11px] text-neutral-500">
                  Attach a PDF or EPUB (up to 50 MB) to read and track progress
                  inside Growth OS.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAttachment}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                {isUploadingAttachment ? 'Uploading…' : 'Attach PDF or EPUB'}
              </button>
            </div>
          )}

          {isUploadingAttachment && (
            <div className="flex items-center justify-center gap-2 text-xs text-[#3E6AE1] font-medium py-1">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#3E6AE1] border-t-transparent" />
              <span>Processing secure vault storage…</span>
            </div>
          )}
        </div>

        {/* Reading Progress Visual */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[#5C5E62]">
            <span>
              {totalPages > 0
                ? `Pages read (${book.currentPage || 0} / ${totalPages})`
                : 'Reading progress'}
            </span>
            <span className="font-semibold text-[#171A20]">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-[#EEEEEE] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#171A20] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Reading Progress Update Form */}
        <form
          onSubmit={handleSaveProgress}
          className="rounded-xl border border-neutral-200 bg-[#FAF9F8] p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
              Update Reading Progress
            </h4>
            {progressSuccess && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Progress updated
              </span>
            )}
          </div>

          {progressError && (
            <p
              role="alert"
              className="text-xs text-red-600 bg-red-50 p-2 rounded"
            >
              {progressError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="reading-current-page"
                className="block text-[11px] font-semibold text-neutral-700 mb-1"
              >
                Current page
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="reading-current-page"
                  type="number"
                  min={0}
                  max={totalPages || 100000}
                  value={currentPageInput}
                  onChange={(e) => setCurrentPageInput(Number(e.target.value))}
                  disabled={isUpdatingProgress}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-900 outline-none focus:border-neutral-500 disabled:opacity-50"
                />
                {totalPages > 0 && (
                  <span className="text-xs text-neutral-500 whitespace-nowrap">
                    / {totalPages}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="reading-status"
                className="block text-[11px] font-semibold text-neutral-700 mb-1"
              >
                Reading status
              </label>
              <div className="relative">
                <select
                  id="reading-status"
                  value={statusInput}
                  onChange={(e) =>
                    handleStatusChange(e.target.value as ResourceStatus)
                  }
                  disabled={isUpdatingProgress}
                  className="w-full cursor-pointer appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-1.5 pr-8 text-sm text-neutral-900 outline-none focus:border-neutral-500 disabled:opacity-50"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isUpdatingProgress}
              className="rounded-lg bg-[#171A20] hover:bg-[#393C41] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isUpdatingProgress ? 'Saving…' : 'Save progress'}
            </button>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EEEEEE]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isUpdatingProgress || isUploadingAttachment}
              onClick={() => {
                onClose();
                onEdit(book);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit book
            </button>

            <button
              type="button"
              disabled={isUpdatingProgress || isUploadingAttachment}
              onClick={() => onDelete(book)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#F4F4F4] hover:bg-[#EEEEEE] text-[#171A20] rounded-lg text-sm font-medium transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
