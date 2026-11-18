import type { ReactNode } from 'react';

interface LibraryHeaderProps {
  actions?: ReactNode;
}

export default function LibraryHeader({ actions }: LibraryHeaderProps) {
  return (
    <header className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        <p className="eyebrow text-[var(--accent-text)]">Knowledge Base</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text)] sm:text-2xl">
          Library &amp; Notes
        </h1>
        <p className="mt-1 text-xs text-[var(--text-3)] sm:text-sm">
          Manage your active reads, summaries, and personal reflections.
        </p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
