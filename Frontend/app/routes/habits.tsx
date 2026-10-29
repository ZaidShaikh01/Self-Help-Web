import { useMemo, useState } from 'react';
import HabitFormModal from '~/components/features/habits/HabitFormModal';
import HabitHistoryModal from '~/components/features/habits/HabitHistoryModal';
import HabitOverview from '~/components/features/habits/HabitOverview';
import HabitFilters from '~/components/features/habits/HabitFilters';
import HabitList from '~/components/features/habits/HabitList';
import ReminderSettings from '~/components/features/habits/ReminderSettings';
import { Button } from '~/components/ui/Button';
import { Icon } from '~/components/ui/Icon';
import { useHabits } from '~/hooks/useHabits';
import type { Habit } from '~/lib/habits';

export default function HabitsPage() {
  const [showArchived, setShowArchived] = useState(false);
  const [selectedTag, setSelectedTag] = useState('all');
  const [search, setSearch] = useState('');

  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [historyHabit, setHistoryHabit] = useState<Habit | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    habits,
    todayHabits,
    weeklySummary,
    isLoading,
    isSaving,
    updatingId,
    error,
    notice,
    setError,
    setNotice,
    clearMessages,
    saveHabit,
    toggleProgress,
    adjustProgress,
    manageHabit,
  } = useHabits(showArchived);

  const availableTags = useMemo(
    () => [...new Set(habits.flatMap((habit) => habit.tags))].sort(),
    [habits],
  );

  const filteredHabits = useMemo(() => {
    const query = search.trim().toLowerCase();

    return habits.filter((habit) => {
      const matchesSearch = [
        habit.title,
        habit.description,
        ...habit.tags,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);

      const matchesTag =
        selectedTag === 'all' ||
        habit.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [habits, search, selectedTag]);

  function openCreateForm() {
    clearMessages();
    setEditingHabit(null);
    setIsFormOpen(true);
  }

  function openEditForm(habit: Habit) {
    clearMessages();
    setEditingHabit(habit);
    setIsFormOpen(true);
  }

  function openHistory(habit: Habit) {
    clearMessages();
    setHistoryHabit(habit);
  }

  function closeHistory() {
    setHistoryHabit(null);
  }

  function closeForm() {
    if (isSaving) return;

    setIsFormOpen(false);
    setEditingHabit(null);
  }

  async function handleSaveHabit(data: Parameters<typeof saveHabit>[1]) {
    const succeeded = await saveHabit(editingHabit, data);

    if (succeeded) {
      setIsFormOpen(false);
      setEditingHabit(null);
    }

    return succeeded;
  }

  function toggleArchivedView() {
    clearMessages();
    setSearch('');
    setSelectedTag('all');
    setShowArchived((current) => !current);
  }

  return (
    <section className="space-y-6 text-[var(--text)]">
      {/* Page Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[var(--border-subtle)] pb-5">
        <div>
          <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[var(--accent)]">
            {showArchived ? 'Your saved history' : 'Your daily practices'}
          </p>

          <h1 className="mt-1 text-2xl font-medium tracking-tight text-[var(--text)] sm:text-3xl">
            {showArchived ? 'Archived habits' : 'Habits'}
          </h1>

          <p className="mt-1 text-xs text-[var(--text-3)]">
            {showArchived
              ? 'Restore an old routine or permanently remove it.'
              : 'Build routines that support the life you want.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            type="button"
            onClick={toggleArchivedView}
          >
            <Icon name="archive" size={15} />
            {showArchived ? 'Active habits' : 'Archived habits'}
          </Button>

          {!showArchived && (
            <Button
              variant="primary"
              type="button"
              onClick={openCreateForm}
            >
              <Icon name="plus" size={15} />
              New habit
            </Button>
          )}
        </div>
      </header>

      {/* Global Alerts */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-600"
        >
          <div className="flex items-start justify-between gap-3">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError('')}
              aria-label="Dismiss error"
              className="font-mono text-sm leading-none text-red-600 hover:opacity-75"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-xs text-green-700"
        >
          <div className="flex items-start justify-between gap-3">
            <p>{notice}</p>
            <button
              type="button"
              onClick={() => setNotice('')}
              aria-label="Dismiss notification"
              className="font-mono text-sm leading-none text-green-700 hover:opacity-75"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Web Push Notification Settings */}
      <ReminderSettings />

      {/* Habits Analytics Overview */}
      {!showArchived && (
        <HabitOverview
          isLoading={isLoading}
          todayHabits={todayHabits}
          weeklySummary={weeklySummary}
        />
      )}

      {/* Habits List Section */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-[var(--text)]">
              {showArchived ? 'Archived habits' : 'Your habits'}
            </h2>

            <p className="text-[11px] text-[var(--text-3)]">
              {showArchived
                ? 'Restore habits or delete them permanently.'
                : 'Track progress, view history, and manage your habits.'}
            </p>
          </div>

          <HabitFilters
            search={search}
            onSearchChange={setSearch}
            availableTags={availableTags}
            selectedTag={selectedTag}
            onTagChange={setSelectedTag}
          />
        </div>

        <HabitList
          habits={filteredHabits}
          todayHabits={todayHabits}
          isLoading={isLoading}
          showArchived={showArchived}
          search={search}
          selectedTag={selectedTag}
          totalHabits={habits.length}
          updatingId={updatingId}
          onEdit={openEditForm}
          onViewHistory={openHistory}
          onProgress={(item) => void toggleProgress(item)}
          onAdjustProgress={(item, change) => void adjustProgress(item, change)}
          onManage={(habit, action) => {
            void manageHabit(habit, action);
          }}
          onCreate={openCreateForm}
        />
      </section>

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <HabitFormModal
          key={editingHabit?._id ?? 'new-habit'}
          habit={editingHabit}
          isSaving={isSaving}
          onClose={closeForm}
          onSave={handleSaveHabit}
        />
      )}

      {/* History Modal */}
      {historyHabit && (
        <HabitHistoryModal
          key={historyHabit._id}
          habit={historyHabit}
          onClose={closeHistory}
        />
      )}
    </section>
  );
}
