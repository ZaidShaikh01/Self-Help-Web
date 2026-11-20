import { Pin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Icon } from '~/components/ui/Icon';
import type { JournalEntry } from './types';
import { formatDay, formatTime, parseInlineContent } from './journalUtils';

interface JournalEntryDetailProps {
  entry: JournalEntry;
  storageError: string;
  onDelete: (id: string) => Promise<void>;
  onTogglePin: (id: string) => Promise<JournalEntry | undefined>;
}

export default function JournalEntryDetail({
  entry,
  storageError,
  onDelete,
  onTogglePin,
}: JournalEntryDetailProps) {
  const navigate = useNavigate();
  const actionsRef = useRef<HTMLDivElement>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [isPinning, setIsPinning] = useState(false);

  async function togglePin() {
    setIsPinning(true);
    const updated = await onTogglePin(entry.id);
    if (updated) setNotice(updated.isPinned ? 'Entry pinned.' : 'Entry unpinned.');
    setIsPinning(false);
  }

  useEffect(() => {
    if (!actionsOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!actionsRef.current?.contains(event.target as Node)) {
        setActionsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActionsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [actionsOpen]);

  async function copyEntry() {
    try {
      await navigator.clipboard.writeText(`${entry.title}\n\n${entry.body}`);
      setNotice('Entry copied to clipboard.');
    } catch (error) {
      setNotice(
        error instanceof Error
          ? `Could not copy this entry: ${error.message}`
          : 'Could not copy this entry.',
      );
    }
    setActionsOpen(false);
  }

  async function deleteEntry() {
    const confirmed = window.confirm(
      `Delete “${entry.title || 'Untitled reflection'}”? This cannot be undone.`,
    );
    if (!confirmed) return;
    await onDelete(entry.id);
  }

  const paragraphs = entry.body.split(/\n{2,}/).filter(Boolean);

  return (
    <article className="journal-page journal-detail-page route-enter">
      <header className="journal-detail-toolbar">
        <button
          type="button"
          className="journal-back-link"
          onClick={() => navigate('/journal')}
        >
          <Icon name="arrow" size={14} className="journal-arrow-left" />
          Journal
        </button>
        <div className="journal-detail-actions">
          <button
            type="button"
            className="journal-quiet-button"
            onClick={() => void togglePin()}
            disabled={isPinning}
            aria-pressed={entry.isPinned}
          >
            <Pin size={14} fill={entry.isPinned ? 'currentColor' : 'none'} />
            {entry.isPinned ? 'Unpin' : 'Pin'}
          </button>
          <button
            type="button"
            className="journal-quiet-button"
            onClick={() =>
              navigate(`/journal/${encodeURIComponent(entry.id)}/edit`)
            }
          >
            <Icon name="edit" size={14} />
            Edit
          </button>
          <div className="journal-more-wrap" ref={actionsRef}>
            <button
              type="button"
              className="journal-icon-button"
              aria-label="More entry actions"
              aria-haspopup="menu"
              aria-expanded={actionsOpen}
              onClick={() => setActionsOpen((open) => !open)}
            >
              <Icon name="more" size={17} />
            </button>
            {actionsOpen && (
              <div className="journal-more-menu" role="menu">
                <button type="button" role="menuitem" onClick={copyEntry}>
                  <Icon name="link" size={14} />
                  Copy entry
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="is-danger"
                  onClick={deleteEntry}
                >
                  <Icon name="close" size={14} />
                  Delete entry
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {(storageError || notice) && (
        <p className="journal-storage-alert" role="status">
          {notice || storageError}
        </p>
      )}

      <div className="journal-detail-content">
        <div className="journal-detail-date">
          {formatDay(entry.date)} · {formatTime(entry.time)}
        </div>
        <p className="journal-detail-kind">{entry.kind}</p>
        <h1>{entry.title || 'Untitled reflection'}</h1>

        {entry.prompt && (
          <aside className="journal-detail-prompt">
            <span>Prompt</span>
            <p>{entry.prompt}</p>
          </aside>
        )}

        <div className="journal-detail-body">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => {
              const lines = paragraph.split('\n');
              const isQuote = lines.every((line) => line.trimStart().startsWith('>'));
              const content = lines.map((line) =>
                line.replace(/^\s*>\s?/, ''),
              );
              const children = content.map((line, lineIndex) => (
                <span key={lineIndex}>
                  {parseInlineContent(line)}
                  {lineIndex < content.length - 1 && <br />}
                </span>
              ));
              return isQuote ? (
                <blockquote key={index}>{children}</blockquote>
              ) : (
                <p key={index}>{children}</p>
              );
            })
          ) : (
            <p className="journal-detail-empty">This entry has no reflection text.</p>
          )}
        </div>

        <footer className="journal-detail-metadata">
          <div className="journal-entry-tags">
            {entry.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <p>
            Created {new Date(entry.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            <span aria-hidden="true"> · </span>
            Updated {new Date(entry.updatedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </footer>

        {entry.related.length > 0 && (
          <section className="journal-related" aria-labelledby="journal-related-title">
            <h2 id="journal-related-title">Related objects</h2>
            <div className="journal-related-list">
              {entry.related.map((related) => (
                <button
                  type="button"
                  key={`${related.kind}-${related.id}`}
                  onClick={() =>
                    navigate(related.kind === 'habit' ? '/habits' : '/library')
                  }
                >
                  <Icon
                    name={related.kind === 'habit' ? 'check' : 'book'}
                    size={16}
                  />
                  <span>
                    <strong>{related.title}</strong>
                    <small>{related.kind === 'habit' ? 'Habit' : 'Library resource'}</small>
                  </span>
                  <Icon name="arrow" size={15} />
                </button>
              ))}
            </div>
          </section>
        )}

        <button
          type="button"
          className="journal-timeline-button"
          onClick={() =>
            navigate(`/timeline?date=${encodeURIComponent(entry.date)}`)
          }
        >
          View in timeline
          <Icon name="arrow" size={15} />
        </button>
      </div>
    </article>
  );
}
