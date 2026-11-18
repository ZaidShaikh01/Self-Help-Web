import { Pencil, Quote, Trash2 } from 'lucide-react';
import type { Note } from '~/lib/library';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

function formatNoteDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const displayTitle =
    note.resource && typeof note.resource === 'object' && note.resource.title
      ? note.resource.title
      : note.title || 'Personal Reflection';

  return (
    <article className="library-note-card">
      <div className="space-y-3">
        <div className="flex justify-between items-center gap-2">
          <span className="library-note-card__source">
            {displayTitle}
          </span>
          <span className="library-note-card__date">
            {formatNoteDate(note.createdAt)}
          </span>
        </div>

        {note.quote && (
          <div className="library-note-card__quote">
            <Quote size={17} aria-hidden="true" />
            <p>
              "{note.quote}"
            </p>
          </div>
        )}

        {note.content && (
          <div className="space-y-1">
            <p className="library-note-card__label">
              Personal Reflection
            </p>
            <p className="library-note-card__content">
              {note.content}
            </p>
          </div>
        )}
      </div>

      <div className="library-note-card__footer">
        <div className="flex flex-wrap items-center gap-1.5">
          {note.tags && note.tags.length > 0 ? (
            note.tags.map((tag: string) => (
              <span key={tag} className="library-note-card__tag">
                #{tag}
              </span>
            ))
          ) : (
            <span className="library-note-card__tag">
              No tags
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(note)}
            aria-label={`Edit note for ${displayTitle}`}
            className="library-note-card__action"
          >
            <Pencil className="w-3 h-3" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(note)}
            aria-label={`Delete note for ${displayTitle}`}
            className="library-note-card__action is-danger"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </article>
  );
}
