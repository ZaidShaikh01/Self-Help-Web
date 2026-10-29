import { Icon } from '~/components/ui/Icon';
import type { Habit, TodayHabit } from '~/lib/habits';
import type { ProgressChange } from '~/hooks/useHabits';

interface HabitRowProps {
  habit: Habit;
  todayRecord?: TodayHabit;
  showArchived: boolean;
  isUpdating: boolean;
  onEdit: (habit: Habit) => void;
  onViewHistory: (habit: Habit) => void;
  onProgress: (item: TodayHabit) => void;
  onAdjustProgress: (item: TodayHabit, change: ProgressChange) => void;
  onManage: (
    habit: Habit,
    action: 'archive' | 'restore' | 'delete',
  ) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getScheduleLabel(habit: Habit) {
  if (habit.schedule.type === 'daily') return 'Every day';
  if (habit.schedule.type === 'weekdays') return 'Weekdays';

  return habit.schedule.daysOfWeek
    .map((day) => DAYS[day])
    .filter(Boolean)
    .join(', ');
}

export default function HabitRow({
  habit,
  todayRecord,
  showArchived,
  isUpdating,
  onEdit,
  onViewHistory,
  onProgress,
  onAdjustProgress,
  onManage,
}: HabitRowProps) {
  const isDueToday = Boolean(todayRecord) && !showArchived;
  const isCompleted = todayRecord?.completed ?? false;

  const progress = todayRecord
    ? Math.min(
        100,
        Math.round(
          (todayRecord.value / Math.max(todayRecord.target, 1)) * 100,
        ),
      )
    : 0;

  function handleManage(action: 'archive' | 'restore' | 'delete') {
    const messages = {
      archive: `Archive "${habit.title}"?`,
      restore: `Restore "${habit.title}"?`,
      delete: `Permanently delete "${habit.title}" and its progress history? This cannot be undone.`,
    };

    if (action !== 'restore' && !window.confirm(messages[action])) {
      return;
    }

    onManage(habit, action);
  }

  return (
    <article className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 transition-colors hover:bg-[var(--canvas-2)]">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className="mt-1 h-10 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: habit.color }}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words font-semibold text-[var(--text)]">
              {habit.title}
            </h3>

            {isCompleted && (
              <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider text-[var(--accent-text)]">
                Completed
              </span>
            )}
          </div>

          {habit.description && (
            <p className="mt-1 break-words text-xs text-[var(--text-3)]">
              {habit.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-[var(--text-3)]">
            <span>{getScheduleLabel(habit)}</span>
            <span>
              Target: {habit.target.count} {habit.target.unit}
            </span>

            {habit.currentStreak > 0 && (
              <span className="inline-flex items-center gap-1 text-[var(--accent)] font-medium">
                ★ {habit.currentStreak}-day streak
              </span>
            )}
          </div>

          {habit.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {habit.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-[var(--border-subtle)] bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-3)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {isDueToday && todayRecord && (
            <div className="mt-3 max-w-sm">
              <div className="mb-1.5 flex justify-between font-mono text-[10px] text-[var(--text-3)]">
                <span>Today's progress</span>
                <span>
                  {todayRecord.value}/{todayRecord.target}
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border-subtle)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {!showArchived && !isDueToday && (
            <p className="mt-2 text-[11px] font-mono text-[var(--text-3)]">
              Not scheduled today
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => onViewHistory(habit)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider text-[var(--text-2)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)] disabled:opacity-50"
        >
          <Icon name="timeline" size={14} />
          History
        </button>

        {showArchived ? (
          <>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleManage('restore')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider text-[var(--text-2)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)] disabled:opacity-50"
            >
              <Icon name="undo" size={14} />
              Restore
            </button>

            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleManage('delete')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50"
            >
              <Icon name="close" size={14} />
              Delete
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onEdit(habit)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider text-[var(--text-2)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)] disabled:opacity-50"
            >
              <Icon name="edit" size={14} />
              Edit
            </button>

            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleManage('archive')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider text-[var(--text-2)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)] disabled:opacity-50"
            >
              <Icon name="archive" size={14} />
              Archive
            </button>

            {isDueToday && todayRecord ? (
              todayRecord.target > 1 ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={`Decrease ${habit.title} progress`}
                    disabled={isUpdating || todayRecord.value <= 0}
                    onClick={() => onAdjustProgress(todayRecord, -1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] font-mono text-sm text-[var(--text-2)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)] disabled:opacity-40"
                  >
                    -
                  </button>

                  <button
                    type="button"
                    aria-label={`Add one ${habit.target.unit} to ${habit.title}`}
                    disabled={isUpdating || todayRecord.completed}
                    onClick={() => onAdjustProgress(todayRecord, 1)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                      todayRecord.completed
                        ? 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text-3)]'
                        : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
                    }`}
                  >
                    <Icon name={todayRecord.completed ? 'check' : 'plus'} size={14} />
                    {todayRecord.completed ? 'Goal reached' : '+1'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onProgress(todayRecord)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                    isCompleted
                      ? 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] hover:border-[var(--border-strong)]'
                      : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
                  }`}
                >
                  <Icon name={isCompleted ? 'undo' : 'check'} size={14} />
                  {isCompleted ? 'Undo' : 'Mark complete'}
                </button>
              )
            ) : (
              <span className="inline-flex rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-2)] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-3)]">
                Rest day
              </span>
            )}
          </>
        )}
      </div>
    </article>
  );
}
