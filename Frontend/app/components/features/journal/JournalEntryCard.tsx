import { Link } from 'react-router';
import { Icon } from '~/components/ui/Icon';
import type { JournalEntry } from './types';
import { formatDay, formatTime } from './journalUtils';

interface JournalEntryCardProps {
  entry: JournalEntry;
}

export default function JournalEntryCard({ entry }: JournalEntryCardProps) {
  const preview = entry.body
    .replace(/^\s*>\s?/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <article className="journal-entry-row">
      <div className="journal-entry-date" aria-label={formatDay(entry.date)}>
        <strong>{new Date(`${entry.date}T12:00:00`).getDate()}</strong>
        <span>
          {new Date(`${entry.date}T12:00:00`)
            .toLocaleDateString(undefined, { month: 'short' })
            .toUpperCase()}
        </span>
      </div>
      <Link
        className="journal-entry-link"
        to={`/journal/${encodeURIComponent(entry.id)}`}
        aria-label={`Open ${entry.title || 'Untitled reflection'}`}
      >
        <div className="journal-entry-meta">
          <span>{formatTime(entry.time)}</span>
          <span aria-hidden="true">·</span>
          <span>{entry.kind}</span>
        </div>
        <h3>{entry.title || 'Untitled reflection'}</h3>
        <p>{preview || 'No reflection text yet.'}</p>
        {entry.tags.length > 0 && (
          <div className="journal-entry-tags">
            {entry.tags.map((tag) => (
              <span key={tag}>
                <Icon name="link" size={12} />
                {tag}
              </span>
            ))}
          </div>
        )}
        <Icon
          name="chevron"
          size={17}
          className="journal-entry-arrow"
        />
      </Link>
    </article>
  );
}
