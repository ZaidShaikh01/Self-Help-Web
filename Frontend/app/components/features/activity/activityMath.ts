import { toLocalDateInput } from '~/components/features/journal/journalUtils';
import type { GrowthActivityEvent } from './types';

export function getActivityDate(value: string) {
  return toLocalDateInput(new Date(value));
}

export function countActivityByDate(events: GrowthActivityEvent[]) {
  const counts = new Map<string, number>();
  for (const event of events) {
    const date = getActivityDate(event.occurredAt);
    counts.set(date, (counts.get(date) ?? 0) + event.activityCount);
  }
  return counts;
}

export function totalActivity(events: GrowthActivityEvent[]) {
  return events.reduce((total, event) => total + event.activityCount, 0);
}
