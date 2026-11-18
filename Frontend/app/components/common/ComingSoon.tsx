import { Link } from 'react-router';

export default function ComingSoon() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-2 py-10 text-center sm:gap-10 sm:py-14">
      <div className="flex max-w-xl flex-col items-center gap-4">
        <div className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--canvas-2)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-2)]">
          <span
            className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]"
            aria-hidden="true"
          />
          Under construction
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
          This workspace page is still being built
        </h1>

        <p className="text-sm leading-relaxed text-[var(--text-2)] sm:text-base">
          Journal, Timeline, and Insights are next. Habits and Library are ready
          while we finish the rest of Growth OS.
        </p>
      </div>

      <div className="w-full max-w-xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left sm:p-5">
        <div className="mb-3 flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
          <span className="font-mono text-[11px] text-[var(--text-3)]">
            terminal_log.js
          </span>
          <span className="font-mono text-[11px] text-[var(--text-3)]">
            status: in progress
          </span>
        </div>
        <div className="space-y-1.5 font-mono text-xs text-[var(--text-2)] sm:text-sm">
          <p className="text-[var(--text-3)]">// Developer status report:</p>
          <p>
            <span className="text-[var(--accent-text)]">const</span> habits ={' '}
            <span className="text-[var(--text)]">'live'</span>;
          </p>
          <p>
            <span className="text-[var(--accent-text)]">const</span> library ={' '}
            <span className="text-[var(--text)]">'live'</span>;
          </p>
          <p>
            console.log(
            <span className="text-[var(--text-3)]">
              'Shipping the next surface soon'
            </span>
            );
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link to="/dashboard" className="button primary no-underline">
          Back to Today
        </Link>
        <Link to="/habits" className="button no-underline">
          Open Habits
        </Link>
        <Link to="/library" className="button no-underline">
          Open Library
        </Link>
      </div>
    </section>
  );
}
