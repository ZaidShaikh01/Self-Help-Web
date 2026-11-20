import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowUpRight, BookOpen, Check, Pin, X } from 'lucide-react';
import ModalLayer from '~/components/common/ModalLayer';
import { fetchPinnedItems, type PinnedItems } from '~/lib/pinned';

interface PinnedItemsDialogProps {
  onClose: () => void;
}

interface PinnedRow {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  updatedAt: string;
}

const EMPTY_ITEMS: PinnedItems = {
  habits: [],
  books: [],
  journals: [],
};

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '';
}

export default function PinnedItemsDialog({ onClose }: PinnedItemsDialogProps) {
  const navigate = useNavigate();
  const [items, setItems] = useState<PinnedItems>(EMPTY_ITEMS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchPinnedItems()
      .then((response) => {
        if (active) setItems(response);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : 'Pinned items could not be loaded.',
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const groups: {
    title: string;
    icon: typeof Check;
    rows: PinnedRow[];
  }[] = [
    {
      title: 'Habits',
      icon: Check,
      rows: items.habits.map((habit) => ({
        id: habit._id,
        title: habit.title,
        subtitle: habit.description || 'Pinned routine',
        href: `/habits?focus=${encodeURIComponent(habit._id)}${habit.isArchived ? '&archived=true' : ''}`,
        updatedAt: habit.updatedAt,
      })),
    },
    {
      title: 'Books',
      icon: BookOpen,
      rows: items.books.map((book) => ({
        id: book._id,
        title: book.title,
        subtitle: book.author || book.category || 'Pinned book',
        href: `/library?resource=${encodeURIComponent(book._id)}`,
        updatedAt: book.updatedAt,
      })),
    },
    {
      title: 'Journal',
      icon: Pin,
      rows: items.journals.map((entry) => ({
        id: entry._id,
        title: entry.title || 'Untitled reflection',
        subtitle: entry.kind || 'Reflection',
        href: `/journal/${encodeURIComponent(entry._id)}`,
        updatedAt: entry.updatedAt,
      })),
    },
  ];
  const total = groups.reduce((count, group) => count + group.rows.length, 0);

  return (
    <ModalLayer
      onClose={onClose}
      className="fixed inset-0 z-[11000] grid place-items-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="pinned-items-title"
        className="route-enter w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-5 py-5 sm:px-6">
          <div>
            <p className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              <Pin size={13} />
              Your focus
            </p>
            <h2 id="pinned-items-title" className="mt-1 text-xl font-semibold">
              Pinned items
            </h2>
            <p className="mt-1 text-xs text-[var(--text-3)]">
              {isLoading ? 'Loading your saved focus…' : `${total} item${total === 1 ? '' : 's'} to return to`}
            </p>
          </div>
          <button
            type="button"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--border)] text-[var(--text-2)] transition-colors hover:bg-[var(--canvas-2)]"
            onClick={onClose}
            aria-label="Close pinned items"
          >
            <X size={16} />
          </button>
        </header>

        <div className="max-h-[min(65vh,520px)] overflow-y-auto px-5 py-4 sm:px-6">
          {error ? (
            <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-600">
              Pinned items could not be loaded: {error}
            </p>
          ) : isLoading ? (
            <p role="status" className="py-8 text-center text-sm text-[var(--text-3)]">
              Loading pinned items…
            </p>
          ) : total === 0 ? (
            <div className="py-9 text-center">
              <Pin size={23} className="mx-auto text-[var(--accent)]" />
              <h3 className="mt-3 text-sm font-semibold">Nothing pinned yet</h3>
              <p className="mt-1 text-xs text-[var(--text-3)]">
                Pin a habit, book, or journal entry to keep it close.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {groups.filter((group) => group.rows.length > 0).map((group) => {
                const GroupIcon = group.icon;
                return (
                  <section key={group.title} aria-label={`Pinned ${group.title.toLowerCase()}`}>
                    <h3 className="mb-2 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
                      <GroupIcon size={13} />
                      {group.title}
                      <span className="text-[var(--text-3)]">/{group.rows.length}</span>
                    </h3>
                    <ul className="divide-y divide-[var(--border-subtle)] overflow-hidden rounded-xl border border-[var(--border-subtle)]">
                      {group.rows.map((row) => (
                        <li key={row.id}>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              navigate(row.href);
                            }}
                            className="group flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-[var(--canvas-2)]"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">{row.title}</span>
                              <span className="mt-0.5 block truncate text-xs text-[var(--text-3)]">{row.subtitle}</span>
                            </span>
                            <time className="shrink-0 font-mono text-[9px] text-[var(--text-3)]">
                              {formatUpdatedAt(row.updatedAt)}
                            </time>
                            <ArrowUpRight size={14} className="shrink-0 text-[var(--text-3)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </ModalLayer>
  );
}
