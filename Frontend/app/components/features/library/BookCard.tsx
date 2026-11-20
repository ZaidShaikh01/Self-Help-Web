import { useState } from 'react';
import { Pin } from 'lucide-react';
import type { Resource } from '~/lib/library';
import type { LibraryViewMode } from './LibraryToolbar';

interface BookCardProps {
  book: Resource;
  viewMode: LibraryViewMode;
  onClick: () => void;
  onTogglePin: () => Promise<unknown>;
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function getProgress(book: Resource) {
  if (typeof book.progress === 'number') {
    return Math.max(0, Math.min(100, Math.round(book.progress)));
  }
  if (!book.pages || book.pages <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((book.currentPage / book.pages) * 100)));
}

export default function BookCard({
  book,
  viewMode,
  onClick,
  onTogglePin,
}: BookCardProps) {
  const [pinError, setPinError] = useState('');
  const progress = getProgress(book);

  async function handleTogglePin() {
    try {
      await onTogglePin();
      setPinError('');
    } catch (error) {
      setPinError(
        error instanceof Error ? error.message : 'Pinned status could not be updated.',
      );
    }
  }

  return (
    <div className="library-resource-item">
      <button
        type="button"
        className={`library-resource-card ${viewMode === 'list' ? 'is-list' : ''}`}
        onClick={onClick}
        aria-label={`Open ${book.title}`}
      >
        <span className="library-resource-cover" aria-hidden="true">
          <span className="library-resource-cover__code">
            {getInitials(book.author || book.type)}
          </span>
          {book._id.startsWith('demo-') && (
            <span className="library-resource-cover__demo">DEMO</span>
          )}
          <span className="library-resource-cover__marker" />
          <strong>{book.title}</strong>
          <span className="library-resource-cover__meta">
            <span>
              {book.pages
                ? `${book.currentPage} / ${book.pages} PAGES`
                : `${book.type.toUpperCase()} / ${progress}%`}
            </span>
            <span className="library-resource-cover__lines" />
          </span>
        </span>

        <span className="library-resource-details">
          <span className="library-resource-details__status">
            {book.type.toUpperCase()} <span>·</span> {book.status.toUpperCase()}
          </span>
          <strong>{book.title}</strong>
          <span className="library-resource-details__author">
            {book.author || book.category || 'Personal archive'}
          </span>
          <span className="library-resource-details__progress">
            <span style={{ width: `${progress}%` }} />
          </span>
        </span>
      </button>
      {!book._id.startsWith('demo-') && (
        <button
          type="button"
          className="library-resource-pin"
          onClick={() => void handleTogglePin()}
          aria-label={`${book.isPinned ? 'Unpin' : 'Pin'} ${book.title}`}
          aria-pressed={book.isPinned}
          title={book.isPinned ? 'Unpin book' : 'Pin book'}
        >
          <Pin size={15} fill={book.isPinned ? 'currentColor' : 'none'} />
        </button>
      )}
      {pinError && <span className="library-pin-error" role="alert">{pinError}</span>}
    </div>
  );
}
