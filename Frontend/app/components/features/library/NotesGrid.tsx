import { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import NoteCard from './NoteCard';
import type { Note } from '~/lib/library';
import type { LibraryViewMode } from './LibraryToolbar';
import type { NewNoteData } from '~/components/common/AddModal';
import { DEMO_NOTE_PREVIEWS, DEMO_NOTES } from './demoLibrary';

interface NotesGridProps {
  notes: Note[];
  viewMode: LibraryViewMode;
  isFiltered?: boolean;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onAddDemo: (note: NewNoteData) => Promise<void>;
}

export default function NotesGrid({
  notes,
  viewMode,
  isFiltered = false,
  onEdit,
  onDelete,
  onAddDemo,
}: NotesGridProps) {
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [demoError, setDemoError] = useState('');

  if (notes.length === 0) {
    if (!isFiltered) {
      return (
        <div className="library-demo-showcase">
          <div className="library-demo-showcase__intro">
            <span>EXAMPLE NOTES</span>
            <p>Save an example to make it part of your own collection.</p>
          </div>
          <div className={`library-note-grid${viewMode === 'list' ? ' is-list' : ''}`}>
            {DEMO_NOTE_PREVIEWS.map((note, index) => (
              <article className="library-note-card library-note-card--demo" key={note._id}>
                <div className="library-note-card__source">DEMO · {note.title}</div>
                <p className="library-note-card__content">{note.content}</p>
                <div className="library-note-card__footer">
                  <span className="library-note-card__tag">
                    {note.tags.map((tag) => `#${tag}`).join(' ')}
                  </span>
                  <button
                    type="button"
                    className="library-note-card__action"
                    disabled={savingIndex !== null}
                    onClick={async () => {
                      setSavingIndex(index);
                      setDemoError('');
                      try {
                        await onAddDemo(DEMO_NOTES[index]);
                      } catch (error) {
                        setDemoError(
                          error instanceof Error
                            ? error.message
                            : 'The example note could not be saved.',
                        );
                      } finally {
                        setSavingIndex(null);
                      }
                    }}
                  >
                    <Plus size={13} />
                    {savingIndex === index ? 'Saving…' : 'Save example'}
                  </button>
                </div>
              </article>
            ))}
          </div>
          {demoError && <p className="library-inline-error" role="alert">{demoError}</p>}
        </div>
      );
    }

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
