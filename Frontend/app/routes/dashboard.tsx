import { useMemo, useState } from 'react';
import PromptReflectionCard from '~/components/common/PromptReflectionCard';
import {
  getActivityDate,
  totalActivity,
} from '~/components/features/activity/activityMath';
import useGrowthActivity from '~/components/features/activity/useGrowthActivity';
import TodayAside from '~/components/features/dashboard/TodayAside';
import DailyIntention from '~/components/features/dashboard/DailyIntention';
import TodayHero from '~/components/features/dashboard/TodayHero';
import TodayPractices, { type TodayPractice } from '~/components/features/dashboard/TodayPractices';
import TodayTicker from '~/components/features/dashboard/TodayTicker';
import useJournalEntries from '~/components/features/journal/useJournalEntries';
import { toLocalDateInput } from '~/components/features/journal/journalUtils';
import { useHabits } from '~/hooks/useHabits';
import type { TodayHabit } from '~/lib/habits';
import type { IconName } from '~/components/ui/Icon';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getHabitIcon(title: string): IconName {
  const normalized = title.toLowerCase();
  if (normalized.includes('read')) return 'book';
  if (normalized.includes('walk') || normalized.includes('run')) return 'path';
  if (normalized.includes('focus') || normalized.includes('study')) return 'focus';
  if (normalized.includes('reflect') || normalized.includes('journal')) return 'edit';
  return 'habits';
}

function getHabitSchedule(habit: TodayHabit['habit']) {
  if (habit.schedule.type === 'daily') return 'Every day';
  if (habit.schedule.type === 'weekdays') return 'Weekdays';
  return habit.schedule.daysOfWeek.map((day) => DAYS[day]).filter(Boolean).join(', ');
}

function toTodayPractice(item: TodayHabit): TodayPractice {
  return {
    id: item.habit._id,
    title: item.habit.title,
    detail: item.habit.description || getHabitSchedule(item.habit),
    duration: `${item.value}/${item.target} ${item.habit.target.unit}`,
    icon: getHabitIcon(item.habit.title),
    completed: item.completed,
  };
}

export default function Dashboard() {
  const {
    todayHabits,
    isLoading: habitsLoading,
    updatingId,
    error: habitsError,
    notice: habitsNotice,
    loadData,
    toggleProgress,
  } = useHabits(false);
  const {
    data: activityData,
    isLoading: activityLoading,
    error: activityError,
    reload: reloadActivity,
  } = useGrowthActivity();
  const {
    createEntry,
    isReady: journalReady,
    storageError: journalStorageError,
  } = useJournalEntries();
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const practices = useMemo(
    () => todayHabits.map(toTodayPractice),
    [todayHabits],
  );
  const activityEvents = activityData?.events ?? [];
  const today = toLocalDateInput(new Date());
  const todayEvents = activityEvents.filter(
    (event) => getActivityDate(event.occurredAt) === today,
  );
  const latestActivity = todayEvents[0]?.title;
  const completed = practices.filter((practice) => practice.completed).length;

  const togglePractice = (id: string) => {
    const item = todayHabits.find((habit) => habit.habit._id === id);
    if (item) void toggleProgress(item).then(reloadActivity);
  };

  const saveReflection = (value: string) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    createEntry({
      title: 'What felt a little easier today?',
      body: value,
      date: today,
      time,
      kind: 'Reflection',
      tags: [],
      related: [],
      prompt: 'What felt a little easier today?',
    });
    setReflectionSaved(true);
  };

  return (
    <div className="today-dashboard">
      <TodayHero
        actionCount={totalActivity(todayEvents)}
        latestActivity={latestActivity}
        activityState={
          activityLoading ? 'loading' : activityError ? 'error' : 'ready'
        }
      />
      <TodayTicker />

      <div className="today-content-grid">
        <section className="today-main-column" aria-label="Today at a glance">
          <DailyIntention />
          <TodayPractices
            practices={practices}
            onToggle={togglePractice}
            isLoading={habitsLoading}
            error={habitsError}
            notice={habitsNotice}
            updatingId={updatingId}
            onRetry={() => void loadData()}
          />
          {journalReady ? (
            <PromptReflectionCard
              category="OPTIONAL REFLECTION"
              code="OBS / 07"
              title="WHAT FELT A LITTLE EASIER TODAY?"
              subtitle="A note for your history. Keep it short, or leave it for later."
              placeholder="Write one thing you noticed…"
              onSubmit={saveReflection}
              className="today-reflection"
            />
          ) : (
            <p className="today-reflection-status" role="status">
              Preparing your local journal…
            </p>
          )}
          {journalStorageError && (
            <p className="today-reflection-status is-error" role="alert">
              {journalStorageError}
            </p>
          )}
          {reflectionSaved && (
            <p className="today-reflection-status" role="status">
              Reflection added to your journal.
            </p>
          )}
        </section>

        <TodayAside
          completed={completed}
          total={practices.length}
          events={activityEvents}
          isActivityLoading={activityLoading}
          activityError={activityError}
          onRetryActivity={reloadActivity}
          nextPractice={practices.find((practice) => !practice.completed)?.title}
        />
      </div>
    </div>
  );
}
