import { useEffect } from 'react';
import { Icon } from '~/components/ui/Icon';
import { useHabitStats, type HabitStatsRange } from '~/hooks/useHabitStats';
import type { Habit } from '~/lib/habits';

interface HabitHistoryModalProps {
  habit: Habit;
  onClose: () => void;
}

const RANGE_OPTIONS: { label: string; value: HabitStatsRange }[] = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

const statCardClass =
  'rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4';

export default function HabitHistoryModal({
  habit,
  onClose,
}: HabitHistoryModalProps) {
  const { stats, range, setRange, isLoading, error } = useHabitStats(habit._id);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const completionPercent = stats
    ? Math.round(stats.completionRate * 100)
    : 0;

  const days = stats ? [...stats.days].reverse() : [];

  return (
    <div
      className="fixed inset-0 z-[110] grid place-items-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="habit-history-title"
        className="my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:p-7"
      >
        <header className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="mt-1 h-10 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: habit.color }}
            />

            <div className="min-w-0">
              <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[var(--accent)]">
                Habit analytics
              </p>

              <h2
                id="habit-history-title"
                className="mt-1 break-words text-xl font-medium tracking-tight text-[var(--text)]"
              >
                {habit.title}
              </h2>

              <p className="mt-0.5 text-xs text-[var(--text-3)]">
                Progress history and consistency.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close habit history"
            className="rounded-lg p-1.5 text-[var(--text-3)] hover:bg-[var(--canvas-2)] hover:text-[var(--text)]"
          >
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--text-2)]">
            History period
          </p>

          <div
            className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--canvas-2)] p-0.5"
            aria-label="Select history period"
          >
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={range === option.value}
                onClick={() => setRange(option.value)}
                className={`rounded-md px-3 py-1 font-mono text-xs transition-colors ${
                  range === option.value
                    ? 'bg-[var(--surface)] text-[var(--text)] font-semibold shadow-sm'
                    : 'text-[var(--text-3)] hover:text-[var(--text)]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--text-3)]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            Loading habit history…
          </div>
        ) : error ? (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600"
          >
            {error}
          </div>
        ) : stats ? (
          <div className="mt-4 space-y-5">
            <p className="font-mono text-[10px] text-[var(--text-3)]">
              Period: {formatDate(stats.from)} to {formatDate(stats.to)}
            </p>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <article className={statCardClass}>
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-[var(--text-3)]">
                  <Icon name="check" size={13} />
                  Completion
                </div>
                <p className="mt-2 font-mono text-2xl font-medium tracking-tight text-[var(--text)]">
                  {completionPercent}%
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-[var(--text-3)]">
                  {stats.completedDays} of {stats.scheduledDays} days
                </p>
              </article>

              <article className={statCardClass}>
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-[var(--text-3)]">
                  <Icon name="today" size={13} />
                  Scheduled
                </div>
                <p className="mt-2 font-mono text-2xl font-medium tracking-tight text-[var(--text)]">
                  {stats.scheduledDays}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-[var(--text-3)]">
                  Days due in period
                </p>
              </article>

              <article className={statCardClass}>
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-[var(--text-3)]">
                  <Icon name="focus" size={13} />
                  Current streak
                </div>
                <p className="mt-2 font-mono text-2xl font-medium tracking-tight text-[var(--accent)]">
                  {stats.currentStreak}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-[var(--text-3)]">
                  Consecutive days
                </p>
              </article>

              <article className={statCardClass}>
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-[var(--text-3)]">
                  <Icon name="focus" size={13} />
                  Best streak
                </div>
                <p className="mt-2 font-mono text-2xl font-medium tracking-tight text-[var(--text)]">
                  {stats.longestStreak}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-[var(--text-3)]">
                  Longest record
                </p>
              </article>
            </div>

            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                <div>
                  <h3 className="text-xs font-semibold tracking-tight text-[var(--text)]">
                    Daily history
                  </h3>
                  <p className="font-mono text-[10px] text-[var(--text-3)]">
                    Target: {habit.target.count} {habit.target.unit} per scheduled day
                  </p>
                </div>
                <span className="font-mono text-[10px] text-[var(--text-3)]">
                  Latest first
                </span>
              </div>

              <div className="mt-3 max-h-72 space-y-2.5 overflow-y-auto pr-1">
                {days.length === 0 ? (
                  <p className="py-6 text-center text-xs text-[var(--text-3)]">
                    No history available for this habit yet.
                  </p>
                ) : (
                  days.map((day) => {
                    const progress = day.scheduled
                      ? Math.min(
                          100,
                          Math.round(
                            (day.value /
                              Math.max(habit.target.count, 1)) *
                              100,
                          ),
                        )
                      : 0;

                    const status = !day.scheduled
                      ? 'Not scheduled'
                      : day.completed
                        ? 'Completed'
                        : 'Not completed';

                    return (
                      <article
                        key={day.date}
                        className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-2.5 last:border-0 last:pb-0"
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            !day.scheduled
                              ? 'bg-[var(--canvas-2)] text-[var(--text-3)]'
                              : day.completed
                                ? 'bg-[var(--accent-soft)] text-[var(--accent-text)]'
                                : 'bg-red-500/10 text-red-600'
                          }`}
                        >
                          <Icon
                            name={
                              day.completed && day.scheduled
                                ? 'check'
                                : 'today'
                            }
                            size={15}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-mono text-xs font-medium text-[var(--text)]">
                              {formatShortDate(day.date)}
                            </p>
                            <span className="font-mono text-[10px] text-[var(--text-3)]">
                              {status}
                            </span>
                          </div>

                          {day.scheduled && (
                            <>
                              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--border-subtle)]">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${progress}%`,
                                    backgroundColor: habit.color,
                                  }}
                                />
                              </div>
                              <p className="mt-1 font-mono text-[10px] text-[var(--text-3)]">
                                {day.value} of {habit.target.count}{' '}
                                {habit.target.unit}
                              </p>
                            </>
                          )}
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </div>
  );
}
