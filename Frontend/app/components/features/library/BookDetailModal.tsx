import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Resource } from '~/lib/library';

interface BookDetailModalProps {
  book: Resource | null;
  onClose: () => void;
}

export default function BookDetailModal({
  book,
  onClose,
}: BookDetailModalProps) {
  useEffect(() => {
    if (!book) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [book, onClose]);

  if (!book) return null;

  const totalPages = book.pages || 0;
  const currentPage = book.currentPage || 0;
  const progressPercent = typeof book.progress === 'number'
    ? book.progress
    : totalPages > 0
      ? Math.min(100, Math.round((currentPage / totalPages) * 100))
      : 0;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-detail-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-[#EEEEEE]"
      >
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E6AE1] bg-[#3E6AE1]/10 px-2 py-0.5 rounded">
              {book.category || 'Book'}
            </span>
            <h2
              id="book-detail-title"
              className="text-xl font-bold text-[#171A20] mt-1 break-words"
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
            className="p-1.5 bg-[#F4F4F4] hover:bg-[#EEEEEE] rounded-full transition-all text-[#171A20]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {book.summary && (
          <div className="space-y-2 bg-[#F4F4F4] p-4 rounded-xl">
            <h4 className="text-xs font-bold text-[#5C5E62] uppercase tracking-wider">
              Book Summary
            </h4>
            <p className="text-sm text-[#393C41] leading-relaxed">
              {book.summary}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[#5C5E62]">
            <span>
              {totalPages > 0
                ? `Pages read (${currentPage} / ${totalPages})`
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

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#F4F4F4] hover:bg-[#EEEEEE] text-[#171A20] rounded-lg text-sm font-medium transition-all"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              window.alert(`Opening reading view for ${book.title}`);
              onClose();
            }}
            className="px-4 py-2 bg-[#171A20] hover:bg-[#393C41] text-white rounded-lg text-sm font-medium transition-all"
          >
            Continue Reading
          </button>
        </div>
      </div>
    </div>
  );
}
