import React from 'react';
import { Bookmark } from 'lucide-react';
import type { Resource } from '~/lib/library';

interface BookCardProps {
  book: Resource;
  onClick: () => void;
}

export function getBookCoverColor(category?: string): string {
  switch (category) {
    case 'Productivity':
      return 'bg-[#171A20]';
    case 'Focus':
      return 'bg-[#393C41]';
    case 'Finance':
      return 'bg-[#5C5E62]';
    case 'Philosophy':
      return 'bg-[#2D58CC]';
    default:
      return 'bg-[#171A20]';
  }
}

export default function BookCard({ book, onClick }: BookCardProps) {
  const coverColor = getBookCoverColor(book.category);
  const progressPercent = typeof book.progress === 'number'
    ? book.progress
    : book.pages && book.pages > 0
      ? Math.min(100, Math.round(((book.currentPage || 0) / book.pages) * 100))
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

  return (
    <div
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col justify-between space-y-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-[var(--border)]"
    >
      {/* Top Meta */}
      <div className="flex justify-between items-start">
        <span className="rounded bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent-text)]">
          {book.category || 'Book'}
        </span>
        <div className="flex items-center gap-1.5">
          {hasAttachment && (
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                isEpub
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {isEpub ? 'EPUB' : 'PDF'}
            </span>
          )}
          <Bookmark className="h-4 w-4 text-[var(--text-3)] transition-colors group-hover:text-[var(--text)]" />
        </div>
      </div>

      {/* 3D Interactive Book Graphic Simulation */}
      <div className="flex items-center gap-4 py-2">
        <div
          className={`w-16 h-22 ${coverColor} rounded-r-md rounded-l-sm shadow-md flex items-center justify-center p-2 text-white text-center transform group-hover:-rotate-y-12 group-hover:scale-105 transition-transform duration-500 perspective-1000 relative border-l-2 border-white/20 shrink-0`}
        >
          <span className="text-[9px] font-bold leading-tight line-clamp-3">
            {book.title}
          </span>
        </div>
        <div className="space-y-1 flex-1 min-w-0">
          <h3 className="truncate text-base font-semibold text-[var(--text)] transition-colors group-hover:text-[var(--accent-text)]">
            {book.title}
          </h3>
          {book.author && (
            <p className="truncate text-xs text-[var(--text-3)]">{book.author}</p>
          )}
          {book.summary && (
            <p className="mt-1 line-clamp-2 text-[11px] text-[var(--text-2)]">
              {book.summary}
            </p>
          )}
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="space-y-1.5 border-t border-[var(--border-subtle)] pt-2">
        <div className="flex justify-between text-xs text-[var(--text-3)]">
          <span>Reading Progress</span>
          <span className="font-medium text-[var(--text)]">
            {progressPercent}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-inset)]">
          <div
            className="h-full rounded-full bg-[var(--text)] transition-[width] duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
