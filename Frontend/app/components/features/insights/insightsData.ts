import { getActivityDate, totalActivity } from '../activity/activityMath';
import type { GrowthActivitySnapshot } from '../activity/types';
import { toLocalDateInput } from '~/components/features/journal/journalUtils';

export const INSIGHT_RANGES = [7, 30, 90] as const;
export type InsightRange = (typeof INSIGHT_RANGES)[number];

export interface InsightRangeData {
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
  rangeLabel: string;
  scheduledActions: number;
  completedActions: number;
  completionRate: number;
  previousCompletionRate: number;
  journalEntries: number;
  journalDays: number;
  previousJournalEntries: number;
  learningActivity: number;
  previousLearningActivity: number;
  timelineEvents: number;
  previousTimelineEvents: number;
  activeDays: number;
  habitDays: Array<{
    date: string;
    weekday: string;
    completed: number;
    scheduled: number;
  }>;
  periodEvents: GrowthActivitySnapshot['events'];
  previousEvents: GrowthActivitySnapshot['events'];
}

function shiftDate(value: string, days: number) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalDateInput(date);
}

function isWithinRange(value: string, from: string, to: string) {
  const date = getActivityDate(value);
  return date >= from && date <= to;
}

function formatRangeLabel(from: string, to: string) {
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  const sameMonth =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth();

  if (sameMonth) {
    return `${start.toLocaleDateString(undefined, { month: 'short' })} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}–${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`;
}

function getRangeSummary(
  snapshot: GrowthActivitySnapshot,
  from: string,
  to: string,
) {
  const habitDays = snapshot.habitSummary.days.filter(
    (day) => day.date >= from && day.date <= to,
  );
  const scheduledActions = habitDays.reduce(
    (total, day) => total + day.scheduled,
    0,
  );
  const completedActions = habitDays.reduce(
    (total, day) => total + day.completed,
    0,
  );
  const periodEvents = snapshot.events.filter((event) =>
    isWithinRange(event.occurredAt, from, to),
  );
  const journalEntries = snapshot.journalEntries.filter((entry) =>
    isWithinRange(entry.createdAt, from, to),
  );
  const learningActivity = snapshot.resources.filter(
    (resource) =>
      isWithinRange(resource.updatedAt, from, to) ||
      isWithinRange(resource.createdAt, from, to),
  ).length + snapshot.notes.filter((note) =>
    isWithinRange(note.createdAt, from, to),
  ).length;

  return {
    scheduledActions,
    completedActions,
    completionRate: scheduledActions
      ? Math.round((completedActions / scheduledActions) * 100)
      : 0,
    journalEntries,
    journalDays: new Set(
      journalEntries.map((entry) => getActivityDate(entry.createdAt)),
    ).size,
    learningActivity,
    timelineEvents: totalActivity(periodEvents),
    activeDays: new Set(periodEvents.map((event) => getActivityDate(event.occurredAt)))
      .size,
    periodEvents,
  };
}

export function getInsightRangeData(
  snapshot: GrowthActivitySnapshot,
  range: InsightRange,
): InsightRangeData {
  const to = toLocalDateInput(new Date());
  const from = shiftDate(to, -(range - 1));
  const previousTo = shiftDate(from, -1);
  const previousFrom = shiftDate(previousTo, -range + 1);
  const current = getRangeSummary(snapshot, from, to);
  const previous = getRangeSummary(snapshot, previousFrom, previousTo);
  const sevenDaysAgo = shiftDate(to, -6);
  const habitDays = snapshot.habitSummary.days.filter(
    (day) => day.date >= sevenDaysAgo && day.date <= to,
  );
  const dayByDate = new Map(habitDays.map((day) => [day.date, day]));

  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = shiftDate(sevenDaysAgo, index);
    const day = dayByDate.get(date);
    return {
      date,
      weekday: new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
        weekday: 'short',
      }),
      completed: day?.completed ?? 0,
      scheduled: day?.scheduled ?? 0,
    };
  });

  return {
    from,
    to,
    previousFrom,
    previousTo,
    rangeLabel: formatRangeLabel(from, to),
    scheduledActions: current.scheduledActions,
    completedActions: current.completedActions,
    completionRate: current.completionRate,
    previousCompletionRate: previous.completionRate,
    journalEntries: current.journalEntries.length,
    journalDays: current.journalDays,
    previousJournalEntries: previous.journalEntries.length,
    learningActivity: current.learningActivity,
    previousLearningActivity: previous.learningActivity,
    timelineEvents: current.timelineEvents,
    previousTimelineEvents: previous.timelineEvents,
    activeDays: current.activeDays,
    habitDays: lastSevenDays,
    periodEvents: current.periodEvents,
    previousEvents: previous.periodEvents,
  };
}
