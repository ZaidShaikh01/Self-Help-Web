import { BookOpen } from 'lucide-react';
import BookCard from './BookCard';
import type { Resource } from '~/lib/library';
import type { LibraryViewMode } from './LibraryToolbar';

interface BookGridProps {
  books: Resource[];
  onSelectBook: (book: Resource) => void;
  viewMode: LibraryViewMode;
  isFiltered?: boolean;
}

export default function BookGrid({
  books,
  onSelectBook,
  viewMode,
  isFiltered = false,
}: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="library-empty">
        <BookOpen size={24} aria-hidden="true" />
        <p>
          {isFiltered ? 'No books found' : 'Your book library is empty'}
        </p>
        <span>
          {isFiltered
            ? 'Try adjusting your search query or category filter.'
            : 'Add a resource to start your personal archive.'}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`library-resource-grid ${
        viewMode === 'list' ? 'is-list' : ''
      }`}
    >
      {books.map((book) => (
        <BookCard
          key={book._id}
          book={book}
          viewMode={viewMode}
          onClick={() => onSelectBook(book)}
        />
      ))}
    </div>
  );
}
