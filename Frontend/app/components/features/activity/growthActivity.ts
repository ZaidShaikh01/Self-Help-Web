import {
  getHabits,
  getHabitWeeklySummary,
  type HabitWeeklySummaryDay,
} from '~/lib/habits';
import {
  fetchNotes,
  fetchResources,
  type Note,
  type Resource,
} from '~/lib/library';
import {
  readJournalEntries,
  JOURNAL_STORAGE_KEY,
} from '~/components/features/journal/journalStorage';
import { toLocalDateInput } from '~/components/features/journal/journalUtils';
import type { JournalEntry } from '~/components/features/journal/types';
import type {
  GrowthActivityEvent,
  GrowthActivitySnapshot,
} from './types';

const HISTORY_DAYS = 91;
const PAGE_SIZE = 50;

function dateOffset(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getHistoryRange() {
  const today = new Date();
  const to = toLocalDateInput(today);
  const from = toLocalDateInput(dateOffset(today, -(HISTORY_DAYS - 1)));
  return { from, to };
}

async function fetchAllResources() {
  const firstPage = await fetchResources({ page: 1, limit: PAGE_SIZE });
  const pageCount = Math.max(1, firstPage.totalPages || 1);
  const remainingPages = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) =>
      fetchResources({ page: index + 2, limit: PAGE_SIZE }),
    ),
  );
  return [firstPage, ...remainingPages].flatMap((page) => page.resources);
}

async function fetchAllNotes() {
  const firstPage = await fetchNotes({ page: 1, limit: PAGE_SIZE });
  const pageCount = Math.max(1, firstPage.totalPages || 1);
  const remainingPages = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) =>
      fetchNotes({ page: index + 2, limit: PAGE_SIZE }),
    ),
  );
  return [firstPage, ...remainingPages].flatMap((page) => page.notes);
}

function ensureTimestamp(value: string, label: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new Error(`Activity record "${label}" has an invalid date.`);
  }
  return new Date(timestamp).toISOString();
}

function createJournalEvent(entry: JournalEntry): GrowthActivityEvent {
  const occurredAt = ensureTimestamp(entry.createdAt, entry.id);
  const body = entry.body.replace(/\s+/g, ' ').trim();
  const excerpt = body.length > 200 ? `${body.slice(0, 197)}...` : body;

  return {
    id: `journal-${entry.id}`,
    type: 'journal',
    title: entry.title || 'Untitled reflection',
    description: excerpt
      ? `Journal entry created · ${excerpt}`
      : 'Journal entry created',
    occurredAt,
    sourceTitle: entry.title || 'Untitled reflection',
    sourceHref: `/journal/${encodeURIComponent(entry.id)}`,
    activityCount: 1,
    isSample: entry.id.startsWith('example-'),
  };
}

function createHabitEvents(days: HabitWeeklySummaryDay[]) {
  return days
    .filter((day) => day.completed > 0)
    .map((day): GrowthActivityEvent => {
      const occurredAt = ensureTimestamp(
        `${day.date}T12:00:00`,
        `habit activity ${day.date}`,
      );
      const completed = day.completed;

      return {
        id: `habit-${day.date}`,
        type: 'habit',
        title: `${completed} habit ${completed === 1 ? 'completion' : 'completions'}`,
        description: `${completed} of ${day.scheduled} scheduled actions completed`,
        occurredAt,
        sourceTitle: 'Practice history',
        sourceHref: '/habits',
        activityCount: completed,
        isSample: false,
      };
    });
}

function createResourceEvent(resource: Resource): GrowthActivityEvent {
  const createdAt = ensureTimestamp(resource.createdAt, resource.title);
  const updatedAt = ensureTimestamp(resource.updatedAt, resource.title);
  const wasUpdated = updatedAt !== createdAt;
  const occurredAt = wasUpdated ? updatedAt : createdAt;

  return {
    id: `resource-${resource._id}`,
    type: 'resource',
    title: wasUpdated
      ? `${resource.title} progress updated`
      : `${resource.title} added to library`,
    description: `${resource.status} · ${resource.type}`,
    occurredAt,
    sourceTitle: resource.title,
    sourceHref: `/library?resource=${encodeURIComponent(resource._id)}`,
    activityCount: 1,
    isSample: false,
  };
}

function createNoteEvent(note: Note): GrowthActivityEvent {
  const occurredAt = ensureTimestamp(note.createdAt, note.title || note._id);
  const sourceTitle =
    note.resource && typeof note.resource === 'object'
      ? note.resource.title
      : 'Library note';
  const text = note.content || note.quote || '';
  const excerpt = text.replace(/\s+/g, ' ').trim();
  const description =
    excerpt.length > 160 ? `${excerpt.slice(0, 157)}...` : excerpt;
  const relatedResourceId =
    note.resource && typeof note.resource === 'object'
      ? note.resource._id
      : '';

  return {
    id: `note-${note._id}`,
    type: 'resource',
    title: note.title || 'Learning note saved',
    description: description || 'A note was added to your library',
    occurredAt,
    sourceTitle,
    sourceHref: relatedResourceId
      ? `/library?resource=${encodeURIComponent(relatedResourceId)}`
      : '/library?tab=notes',
    activityCount: 1,
    isSample: false,
  };
}

function createEvents(
  habitDays: HabitWeeklySummaryDay[],
  resources: Resource[],
  notes: Note[],
  journalEntries: JournalEntry[],
): GrowthActivityEvent[] {
  return [
    ...createHabitEvents(habitDays),
    ...resources.map(createResourceEvent),
    ...notes.map(createNoteEvent),
    ...journalEntries.map(createJournalEvent),
  ].sort(
    (left, right) =>
      Date.parse(right.occurredAt) - Date.parse(left.occurredAt),
  );
}

export async function loadGrowthActivity(): Promise<GrowthActivitySnapshot> {
  const { from, to } = getHistoryRange();
  const journalEntriesPromise = Promise.resolve().then(() =>
    readJournalEntries(),
  );

  const [habits, habitSummary, resources, notes, journalEntries] =
    await Promise.all([
      getHabits(),
      getHabitWeeklySummary(from, to),
      fetchAllResources(),
      fetchAllNotes(),
      journalEntriesPromise,
    ]);

  return {
    from,
    to,
    fetchedAt: new Date().toISOString(),
    habits,
    habitSummary,
    resources,
    notes,
    journalEntries,
    events: createEvents(
      habitSummary.days,
      resources,
      notes,
      journalEntries,
    ),
  };
}

export { JOURNAL_STORAGE_KEY };
