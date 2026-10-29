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
      className="group relative bg-white border border-[#EEEEEE] rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#D0D1D2] transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4"
    >
      {/* Top Meta */}
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E6AE1] bg-[#3E6AE1]/10 px-2 py-0.5 rounded">
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
          <Bookmark className="w-4 h-4 text-[#5C5E62] group-hover:text-[#171A20] transition-colors" />
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
          <h3 className="font-semibold text-base text-[#171A20] group-hover:text-[#3E6AE1] transition-colors truncate">
            {book.title}
          </h3>
          {book.author && (
            <p className="text-xs text-[#5C5E62] truncate">{book.author}</p>
          )}
          {book.summary && (
            <p className="text-[11px] text-[#393C41] line-clamp-2 mt-1">
              {book.summary}
            </p>
          )}
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="space-y-1.5 pt-2 border-t border-[#EEEEEE]">
        <div className="flex justify-between text-xs text-[#5C5E62]">
          <span>Reading Progress</span>
          <span className="font-medium text-[#171A20]">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full bg-[#EEEEEE] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#171A20] h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
