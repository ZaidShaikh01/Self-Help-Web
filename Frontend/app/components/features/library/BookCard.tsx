import type { Resource } from '~/lib/library';
import type { LibraryViewMode } from './LibraryToolbar';

interface BookCardProps {
  book: Resource;
  viewMode: LibraryViewMode;
  onClick: () => void;
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

export default function BookCard({ book, viewMode, onClick }: BookCardProps) {
  const progress = getProgress(book);

  return (
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
  );
}
