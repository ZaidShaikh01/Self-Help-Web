import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowUpRight, BookOpen, Check, FileText, Search, X } from 'lucide-react';
import ModalLayer from '~/components/common/ModalLayer';
import {
  searchEverything,
  type GlobalSearchKind,
  type GlobalSearchResult,
} from '~/lib/search';

interface GlobalSearchDialogProps {
  onClose: () => void;
}

const KIND_LABELS: Record<GlobalSearchKind, string> = {
  habit: 'Habit',
  resource: 'Resource',
  journal: 'Journal',
  note: 'Note',
};

const KIND_ICONS = {
  habit: Check,
  resource: BookOpen,
  journal: FileText,
  note: FileText,
};

function getResultPath(result: GlobalSearchResult, query: string) {
  const id = encodeURIComponent(result.id);
  switch (result.kind) {
    case 'habit':
      return `/habits?focus=${id}`;
    case 'resource':
      return `/library?resource=${id}`;
    case 'journal':
      return `/journal/${id}`;
    case 'note':
      return `/library?tab=notes&query=${encodeURIComponent(query)}`;
  }
}

export default function GlobalSearchDialog({
  onClose,
}: GlobalSearchDialogProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    setResults([]);
    setActiveIndex(0);
    setError('');
    if (trimmed.length < 2) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const timeoutId = window.setTimeout(() => {
      setIsLoading(true);
      void searchEverything(trimmed)
        .then((items) => {
          if (active) setResults(items);
        })
        .catch((caught: unknown) => {
          if (active) {
            setError(
              caught instanceof Error
                ? caught.message
                : 'Search could not be completed.',
            );
          }
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, 220);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  function openResult(result: GlobalSearchResult) {
    const destination = getResultPath(result, query.trim());
    onClose();
    navigate(destination);
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' && results.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp' && results.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === 'Enter' && results[activeIndex]) {
      event.preventDefault();
      openResult(results[activeIndex]);
    }
  }

  const statusText =
    query.trim().length < 2
      ? 'Type at least 2 characters to search your workspace.'
      : isLoading
        ? 'Searching your workspace…'
        : error
          ? error
          : results.length
            ? `${results.length} matching result${results.length === 1 ? '' : 's'}`
            : 'No matches found. Try another search.';

  return (
    <ModalLayer
      onClose={onClose}
      className="fixed inset-0 z-[12000] flex items-start justify-center overflow-y-auto bg-black/45 p-3 pt-[12vh] backdrop-blur-sm sm:p-6 sm:pt-[14vh]"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-search-title"
        className="route-enter w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-2xl"
      >
        <h2 id="global-search-title" className="sr-only">
          Search your workspace
        </h2>
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 sm:px-5">
          <Search size={18} className="shrink-0 text-[var(--accent)]" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search habits, resources, journal…"
            aria-label="Search habits, resources, journal, and notes"
            aria-controls="global-search-results"
            aria-activedescendant={
              results[activeIndex] ? `global-search-result-${activeIndex}` : undefined
            }
            className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-3)]"
          />
          {isLoading && (
            <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-3)]">
              Searching
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-3)] transition-colors hover:bg-[var(--canvas-2)] hover:text-[var(--text)]"
          >
            <X size={15} />
          </button>
        </div>

        <div
          id="global-search-results"
          role="listbox"
          aria-label="Search results"
          className="max-h-[min(60vh,480px)] overflow-y-auto p-2"
        >
          {results.map((result, index) => {
            const ResultIcon = KIND_ICONS[result.kind];
            return (
              <button
                id={`global-search-result-${index}`}
                key={`${result.kind}-${result.id}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => openResult(result)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                  index === activeIndex
                    ? 'bg-[var(--canvas-2)]'
                    : 'hover:bg-[var(--canvas-2)]'
                }`}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-text)]">
                  <ResultIcon size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {result.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[var(--text-3)]">
                    {result.subtitle}
                  </span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-3)]">
                  {KIND_LABELS[result.kind]}
                </span>
                <ArrowUpRight
                  size={14}
                  className="shrink-0 text-[var(--text-3)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </button>
            );
          })}
          {!isLoading && results.length === 0 && (
            <p
              role={error ? 'alert' : 'status'}
              className={`px-4 py-8 text-center text-sm ${
                error ? 'text-red-600' : 'text-[var(--text-3)]'
              }`}
            >
              {statusText}
            </p>
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-[var(--border-subtle)] px-4 py-2.5 font-mono text-[9px] uppercase tracking-wider text-[var(--text-3)] sm:px-5">
          <span>Search all your content</span>
          <span>↑↓ navigate · Enter open · Esc close</span>
        </footer>
      </section>
    </ModalLayer>
  );
}
