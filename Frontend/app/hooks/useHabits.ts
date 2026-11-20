
import { useCallback, useEffect, useState } from 'react';

import {
  archiveHabit as archiveHabitRequest,
  createHabit,
  deleteHabit,
  getArchivedHabits,
  getHabits,
  getHabitWeeklySummary,
  getTodayHabits,
  removeHabitProgress,
  restoreHabit as restoreHabitRequest,
  setHabitProgress,
  updateHabit,
  type CreateHabitInput,
  type Habit,
  type HabitWeeklySummary,
  type TodayHabit,
} from '~/lib/habits';

export type HabitManagementAction = 'archive' | 'restore' | 'delete';
export type ProgressChange = -1 | 1;

export function useHabits(showArchived: boolean) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayHabits, setTodayHabits] = useState<TodayHabit[]>([]);
  const [weeklySummary, setWeeklySummary] =
    useState<HabitWeeklySummary | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadedArchivedView, setLoadedArchivedView] = useState<boolean | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadData = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);

      setError('');

      try {
        const now = new Date();
        const monday = new Date(now);

        monday.setDate(
          now.getDate() - ((now.getDay() + 6) % 7),
        );

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const [habitData, todayData] = await Promise.all([
          showArchived ? getArchivedHabits() : getHabits(),
          getTodayHabits(),
        ]);

        setHabits(habitData);
        setTodayHabits(todayData);
        setLoadedArchivedView(showArchived);

        try {
          const summary = await getHabitWeeklySummary(
            formatDate(monday),
            formatDate(sunday),
          );
          setWeeklySummary(summary);
        } catch {
          setWeeklySummary(null);
        }
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to load habits.',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [showArchived],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const saveHabit = useCallback(
    async (existingHabit: Habit | null, data: CreateHabitInput) => {
      setError('');
      setNotice('');
      setIsSaving(true);

      try {
        if (existingHabit) {
          await updateHabit(existingHabit._id, {
            ...data,
            endDate: data.endDate || null,
          });
          setNotice('Habit updated successfully.');
        } else {
          await createHabit(data);
          setNotice('Habit created successfully.');
        }

        await loadData(false);
        return true;
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to save habit.',
        );
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [loadData],
  );

  const toggleProgress = useCallback(
    async (item: TodayHabit) => {
      setError('');
      setNotice('');
      setUpdatingId(item.habit._id);

      try {
        if (item.completed) {
          await removeHabitProgress(item.habit._id, item.date);
          setNotice(`Completion removed for "${item.habit.title}".`);
        } else {
          await setHabitProgress(
            item.habit._id,
            item.date,
            item.target,
          );
          setNotice(`"${item.habit.title}" marked complete.`);
        }

        await loadData(false);
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to update progress.',
        );
      } finally {
        setUpdatingId(null);
      }
    },
    [loadData],
  );

  const adjustProgress = useCallback(
    async (item: TodayHabit, change: ProgressChange) => {
      const nextValue = item.value + change;

      if (
        nextValue < 0 ||
        nextValue > item.target ||
        nextValue === item.value
      ) {
        return;
      }

      setError('');
      setNotice('');
      setUpdatingId(item.habit._id);

      try {
        if (nextValue === 0) {
          await removeHabitProgress(item.habit._id, item.date);
          setNotice(`Progress reset for "${item.habit.title}".`);
        } else {
          await setHabitProgress(
            item.habit._id,
            item.date,
            nextValue,
          );

          setNotice(
            nextValue >= item.target
              ? `"${item.habit.title}" goal reached!`
              : `Progress updated: ${nextValue}/${item.target} ${item.habit.target.unit}.`,
          );
        }

        await loadData(false);
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to adjust progress.',
        );
      } finally {
        setUpdatingId(null);
      }
    },
    [loadData],
  );

  const manageHabit = useCallback(
    async (habit: Habit, action: HabitManagementAction) => {
      setError('');
      setNotice('');
      setUpdatingId(habit._id);

      try {
        if (action === 'archive') {
          await archiveHabitRequest(habit._id);
          setNotice(`"${habit.title}" archived.`);
        } else if (action === 'restore') {
          await restoreHabitRequest(habit._id);
          setNotice(`"${habit.title}" restored.`);
        } else {
          await deleteHabit(habit._id);
          setNotice(`"${habit.title}" and its history deleted.`);
        }

        await loadData(false);
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to manage this habit.',
        );
      } finally {
        setUpdatingId(null);
      }
    },
    [loadData],
  );

  const togglePinned = useCallback(async (habit: Habit) => {
    setError('');
    setNotice('');
    setUpdatingId(habit._id);

    try {
      const updated = await updateHabit(habit._id, {
        isPinned: !habit.isPinned,
      });
      setHabits((current) =>
        current.map((item) => (item._id === updated._id ? updated : item)),
      );
      setTodayHabits((current) =>
        current.map((item) =>
          item.habit._id === updated._id ? { ...item, habit: updated } : item,
        ),
      );
      setNotice(
        updated.isPinned
          ? `"${updated.title}" added to pinned items.`
          : `"${updated.title}" removed from pinned items.`,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to update pinned status.',
      );
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError('');
    setNotice('');
  }, []);

  return {
    habits,
    todayHabits,
    weeklySummary,
    isLoading,
    loadedArchivedView,
    isSaving,
    updatingId,
    error,
    notice,
    setError,
    setNotice,
    clearMessages,
    loadData,
    saveHabit,
    toggleProgress,
    adjustProgress,
    manageHabit,
    togglePinned,
  };
}
