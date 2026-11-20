import { Button } from '~/components/ui/Button';
import { Icon } from '~/components/ui/Icon';
import Skeleton from '~/components/ui/Skeleton';
import HabitRow from './HabitRow';
import type { Habit, TodayHabit } from '~/lib/habits';
import type { ProgressChange } from '~/hooks/useHabits';

interface HabitListProps {
  habits: Habit[];
  todayHabits: TodayHabit[];
  isLoading: boolean;
  showArchived: boolean;
  search: string;
  selectedTag: string;
  totalHabits: number;
  updatingId: string | null;
  onEdit: (habit: Habit) => void;
  onViewHistory: (habit: Habit) => void;
  onTogglePin: (habit: Habit) => void;
  onProgress: (item: TodayHabit) => void;
  onAdjustProgress: (item: TodayHabit, change: ProgressChange) => void;
  onManage: (
    habit: Habit,
    action: 'archive' | 'restore' | 'delete',
  ) => void;
  onCreate: () => void;
}

export default function HabitList({
  habits,
  todayHabits,
  isLoading,
  showArchived,
  search,
  selectedTag,
  totalHabits,
  updatingId,
  onEdit,
  onViewHistory,
  onTogglePin,
  onProgress,
  onAdjustProgress,
  onManage,
  onCreate,
}: HabitListProps) {
  const todayById = new Map(
    todayHabits.map((item) => [item.habit._id, item]),
  );

  const noFilters = !search.trim() && selectedTag === 'all';

  return (
    <>
      {isLoading ? (
        <div
          className="divide-y divide-[var(--border-subtle)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
          role="status"
          aria-label="Loading habits"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex items-center gap-4 px-4 py-4 sm:px-5">
              <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-2/5" />
                <Skeleton className="h-3 w-3/5" />
              </div>
              <Skeleton className="hidden h-8 w-20 sm:block" />
              <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
            </div>
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icon name="focus" size={22} />
          </div>

          <h3 className="mt-4 text-base font-semibold text-[var(--text)]">
            {!noFilters
              ? 'No matching habits'
              : showArchived
                ? 'No archived habits'
                : 'Start with one small habit'}
          </h3>

          <p className="mx-auto mt-1.5 max-w-sm text-xs text-[var(--text-3)]">
            {!noFilters
              ? 'Try changing your search or tag filter.'
              : showArchived
                ? 'Habits you archive will appear here.'
                : 'Create your first habit and begin building a routine that works for you.'}
          </p>

          {!showArchived && noFilters && (
            <div className="mt-5">
              <Button variant="primary" onClick={onCreate}>
                <Icon name="plus" size={16} />
                Create your first habit
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-subtle)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {habits.map((habit) => (
            <HabitRow
              key={habit._id}
              habit={habit}
              todayRecord={showArchived ? undefined : todayById.get(habit._id)}
              showArchived={showArchived}
              isUpdating={updatingId === habit._id}
              onEdit={onEdit}
              onViewHistory={onViewHistory}
              onTogglePin={onTogglePin}
              onProgress={onProgress}
              onAdjustProgress={onAdjustProgress}
              onManage={onManage}
            />
          ))}
        </div>
      )}

      {!isLoading && totalHabits > 0 && (
        <p className="text-right font-mono text-[10px] text-[var(--text-3)]">
          Showing {habits.length} of {totalHabits}{' '}
          {showArchived ? 'archived habits' : 'habits'}
        </p>
      )}
    </>
  );
}
