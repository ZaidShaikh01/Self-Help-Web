import type {
  Habit,
  HabitWeeklySummary,
} from '~/lib/habits';
import type {
  Note,
  Resource,
} from '~/lib/library';
import type { JournalEntry } from '~/components/features/journal/types';

export type GrowthActivityType =
  | 'habit'
  | 'journal'
  | 'resource'
  | 'milestone';

export interface GrowthActivityEvent {
  id: string;
  type: GrowthActivityType;
  title: string;
  description: string;
  occurredAt: string;
  sourceTitle: string;
  sourceHref: string;
  activityCount: number;
  isSample: boolean;
}

export interface GrowthActivitySnapshot {
  from: string;
  to: string;
  fetchedAt: string;
  habits: Habit[];
  habitSummary: HabitWeeklySummary;
  resources: Resource[];
  notes: Note[];
  journalEntries: JournalEntry[];
  events: GrowthActivityEvent[];
}
