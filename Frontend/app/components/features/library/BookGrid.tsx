import { BookOpen } from 'lucide-react';
import BookCard from './BookCard';
import type { Resource } from '~/lib/library';
import type { LibraryViewMode } from './LibraryToolbar';

interface BookGridProps {
  books: Resource[];
  demoBooks?: Resource[];
  onSelectBook: (book: Resource) => void;
  onTogglePin: (book: Resource) => Promise<unknown>;
  viewMode: LibraryViewMode;
  isFiltered?: boolean;
}

export default function BookGrid({
  books,
  demoBooks = [],
  onSelectBook,
  onTogglePin,
  viewMode,
  isFiltered = false,
}: BookGridProps) {
  if (books.length === 0) {
    if (!isFiltered && demoBooks.length > 0) {
      return (
        <div className="library-demo-showcase">
          <div className="library-demo-showcase__intro">
            <span>START WITH A DEMO</span>
            <p>These examples are previews. Add one to save it to your library.</p>
          </div>
          <div className={`library-resource-grid${viewMode === 'list' ? ' is-list' : ''}`}>
            {demoBooks.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                viewMode={viewMode}
                onClick={() => onSelectBook(book)}
                onTogglePin={async () => {}}
              />
            ))}
          </div>
        </div>
      );
    }

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
          onTogglePin={() => onTogglePin(book)}
        />
      ))}
    </div>
  );
}
