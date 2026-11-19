import { countActivityByDate } from '../activity/activityMath';
import type { GrowthActivityEvent } from '../activity/types';
import type { TimelineEvent } from './types';
import { toLocalDateInput } from '~/components/features/journal/journalUtils';

export function createActivitySeries(
  events: GrowthActivityEvent[],
  days = 7,
) {
  const counts = countActivityByDate(events);

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - index - 1));
    const key = toLocalDateInput(date);
    return {
      date: key,
      weekday: date.toLocaleDateString(undefined, { weekday: 'short' }),
      day: String(date.getDate()).padStart(2, '0'),
      count: counts.get(key) ?? 0,
    };
  });
}

export function getTimelineTypeLabel(type: TimelineEvent['type']) {
  switch (type) {
    case 'habit':
      return 'Habit completed';
    case 'journal':
      return 'Journal entry';
    case 'resource':
      return 'Resource activity';
    case 'milestone':
      return 'Milestone';
  }
}
