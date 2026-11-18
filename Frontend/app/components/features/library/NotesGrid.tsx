import React from 'react';
import { FileText } from 'lucide-react';
import NoteCard from './NoteCard';
import type { Note } from '~/lib/library';
import type { LibraryViewMode } from './LibraryToolbar';

interface NotesGridProps {
  notes: Note[];
  viewMode: LibraryViewMode;
  isFiltered?: boolean;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export default function NotesGrid({
  notes,
  viewMode,
  isFiltered = false,
  onEdit,
  onDelete,
}: NotesGridProps) {
  if (notes.length === 0) {
    return (
      <div className="library-empty">
        <FileText size={24} aria-hidden="true" />
        <p>
          {isFiltered ? 'No notes or quotes found' : 'Your notes collection is empty'}
        </p>
        <span>
          {isFiltered
            ? 'Try a different search term.'
            : 'Add a resource and choose notes to save a reflection or quote.'}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`library-note-grid ${
        viewMode === 'list' ? 'is-list' : ''
      }`}
    >
      {notes.map((note) => (
        <NoteCard
          key={note._id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
