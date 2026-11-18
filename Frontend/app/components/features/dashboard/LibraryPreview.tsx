import { Link } from 'react-router';
import { BookOpen, Bookmark, ChevronRight } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { Icon } from '~/components/ui/Icon';
import type { DashboardBook } from './types';

interface LibraryPreviewProps {
  books: DashboardBook[];
  onAddNote?: () => void;
}

export default function LibraryPreview({
  books,
  onAddNote,
}: LibraryPreviewProps) {
  return (
    <section className="dashboard-panel space-y-5">
      <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-md bg-[var(--canvas-2)] p-2">
            <BookOpen className="h-5 w-5 text-[var(--text)]" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-[var(--text)] sm:text-lg">
              Library &amp; Notes
            </h2>
            <p className="text-xs text-[var(--text-3)]">
              Track active reads, quotes &amp; book summaries
            </p>
          </div>
        </div>

        {onAddNote && (
          <Button variant="primary" type="button" onClick={onAddNote}>
            <Icon name="plus" size={15} />
            Add note
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {books.map((book) => (
          <article
            key={book.id}
            className="space-y-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas)] p-4 transition-colors hover:border-[var(--border)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="inline-block rounded bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent-text)]">
                  {book.category}
                </span>
                <h3 className="mt-2 truncate text-sm font-semibold text-[var(--text)]">
                  {book.title}
                </h3>
                <p className="text-xs text-[var(--text-3)]">{book.author}</p>
              </div>
              <Bookmark
                className="h-4 w-4 shrink-0 text-[var(--text-3)]"
                aria-hidden="true"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[var(--text-3)]">
                <span>Progress</span>
                <span>{book.progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
                <div
                  className="h-full rounded-full bg-[var(--text)] transition-all"
                  style={{ width: `${book.progress}%` }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      <Link
        to="/library"
        className="flex items-center justify-center gap-1 pt-1 text-xs font-semibold text-[var(--accent-text)] hover:underline"
      >
        View all books &amp; notes
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
      </Link>
    </section>
  );
}
