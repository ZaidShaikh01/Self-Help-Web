import { Icon } from '~/components/ui/Icon';
import type { HabitWeeklySummary, TodayHabit } from '~/lib/habits';

interface HabitOverviewProps {
  isLoading: boolean;
  todayHabits: TodayHabit[];
  weeklySummary: HabitWeeklySummary | null;
}

function formatWeekday(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
  });
}

export default function HabitOverview({
  isLoading,
  todayHabits,
  weeklySummary,
}: HabitOverviewProps) {
  const completedToday = todayHabits.filter((item) => item.completed).length;
  const weeklyPercent = Math.round((weeklySummary?.completionRate ?? 0) * 100);

  return (
    <div className="space-y-4">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--text-3)]">
            <Icon name="today" size={15} />
            Scheduled today
          </div>
          <p className="mt-3 font-mono text-3xl font-medium tracking-tight text-[var(--text)]">
            {isLoading ? '—' : todayHabits.length}
          </p>
          <p className="mt-1 text-[11px] text-[var(--text-3)]">
            Habits due today
          </p>
        </article>

        <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--text-3)]">
            <Icon name="check" size={15} />
            Completed today
          </div>
          <p className="mt-3 font-mono text-3xl font-medium tracking-tight text-[var(--text)]">
            {isLoading ? '—' : `${completedToday}/${todayHabits.length}`}
          </p>
          <p className="mt-1 text-[11px] text-[var(--text-3)]">
            {todayHabits.length
              ? `${Math.round(
                  (completedToday / todayHabits.length) * 100,
                )}% of today's habits`
              : 'Nothing scheduled yet'}
          </p>
        </article>

        <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--text-3)]">
            <Icon name="focus" size={15} />
            This week
          </div>
          <p className="mt-3 font-mono text-3xl font-medium tracking-tight text-[var(--text)]">
            {isLoading ? '—' : `${weeklyPercent}%`}
          </p>
          <p className="mt-1 text-[11px] text-[var(--text-3)]">
            {weeklySummary
              ? `${weeklySummary.completedActions} of ${weeklySummary.scheduledActions} scheduled actions`
              : 'Weekly summary unavailable'}
          </p>
        </article>
      </div>

      {/* Weekly Activity Bar Chart */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-[var(--text)]">
              Weekly activity
            </h2>
            <p className="text-[11px] text-[var(--text-3)]">
              Your progress from Monday through Sunday.
            </p>
          </div>
          <Icon name="today" size={18} className="text-[var(--text-3)]" />
        </div>

        {isLoading ? (
          <p className="py-6 text-center text-xs font-mono uppercase tracking-wider text-[var(--text-3)]">
            Loading weekly activity…
          </p>
        ) : weeklySummary ? (
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {weeklySummary.days.map((day) => {
              const percentage =
                day.scheduled > 0
                  ? Math.round((day.completed / day.scheduled) * 100)
                  : 0;

              const height =
                day.scheduled > 0
                  ? Math.max(10, Math.round((percentage / 100) * 44))
                  : 4;

              return (
                <div
                  key={day.date}
                  title={`${day.completed} completed of ${day.scheduled} scheduled`}
                  className="flex min-w-0 flex-col items-center gap-2"
                >
                  <span className="font-mono text-[10px] text-[var(--text-3)]">
                    {formatWeekday(day.date)}
                  </span>
                  <div className="flex h-12 w-full items-end justify-center">
                    <div
                      className="w-full max-w-8 rounded-t bg-[var(--accent)] transition-all"
                      style={{
                        height: `${height}px`,
                        opacity:
                          day.scheduled === 0
                            ? 0.18
                            : 0.35 + percentage / 140,
                      }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-[var(--text-2)]">
                    {day.scheduled
                      ? `${day.completed}/${day.scheduled}`
                      : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-3)]">
            Weekly activity is unavailable.
          </p>
        )}
      </section>
    </div>
  );
}
