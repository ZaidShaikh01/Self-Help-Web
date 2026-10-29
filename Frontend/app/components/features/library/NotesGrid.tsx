import React from 'react';
import { FileText } from 'lucide-react';
import NoteCard from './NoteCard';
import type { Note } from '~/lib/library';

interface NotesGridProps {
  notes: Note[];
  isFiltered?: boolean;
}

export default function NotesGrid({
  notes,
  isFiltered = false,
}: NotesGridProps) {
  if (notes.length === 0) {
    return (
      <div className="py-16 text-center space-y-2 bg-white rounded-xl border border-[#EEEEEE]">
        <FileText className="w-8 h-8 text-[#5C5E62] mx-auto opacity-50" />
        <p className="text-sm font-medium text-[#171A20]">
          {isFiltered ? 'No notes or quotes found' : 'Your notes collection is empty'}
        </p>
        <p className="text-xs text-[#5C5E62]">
          {isFiltered
            ? 'Try a different search term.'
            : 'Click "Add New Item" to save your first reflection or quote.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {notes.map((note) => (
        <NoteCard key={note._id} note={note} />
      ))}
    </div>
  );
}
