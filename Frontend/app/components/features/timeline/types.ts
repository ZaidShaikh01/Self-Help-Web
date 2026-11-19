import type { GrowthActivityType } from '../activity/types';

export type { GrowthActivityEvent as TimelineEvent } from '../activity/types';
export type TimelineFilter = 'all' | GrowthActivityType;

export interface TimelineEventGroup {
  date: string;
  title: string;
  events: import('../activity/types').GrowthActivityEvent[];
}
