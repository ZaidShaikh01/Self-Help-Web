import React from 'react';
import { BookOpen } from 'lucide-react';
import BookCard from './BookCard';
import type { Resource } from '~/lib/library';

interface BookGridProps {
  books: Resource[];
  onSelectBook: (book: Resource) => void;
  isFiltered?: boolean;
}

export default function BookGrid({
  books,
  onSelectBook,
  isFiltered = false,
}: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="py-16 text-center space-y-2 bg-white rounded-xl border border-[#EEEEEE]">
        <BookOpen className="w-8 h-8 text-[#5C5E62] mx-auto opacity-50" />
        <p className="text-sm font-medium text-[#171A20]">
          {isFiltered ? 'No books found' : 'Your book library is empty'}
        </p>
        <p className="text-xs text-[#5C5E62]">
          {isFiltered
            ? 'Try adjusting your search query or category filter.'
            : 'Click "Add New Item" to save your first book.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <BookCard
          key={book._id}
          book={book}
          onClick={() => onSelectBook(book)}
        />
      ))}
    </div>
  );
}
