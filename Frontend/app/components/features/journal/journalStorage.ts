import type { JournalEntry } from './types';
import { toLocalDateInput } from './journalUtils';

export const JOURNAL_STORAGE_KEY = 'growth-os.journal.entries.v1';
export const JOURNAL_UPDATED_EVENT = 'growth-os:journal-updated';

function isJournalEntry(value: unknown): value is JournalEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<JournalEntry>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.title === 'string' &&
    typeof entry.body === 'string' &&
    typeof entry.date === 'string' &&
    typeof entry.time === 'string' &&
    typeof entry.kind === 'string' &&
    Array.isArray(entry.tags) &&
    entry.tags.every((tag) => typeof tag === 'string') &&
    Array.isArray(entry.related) &&
    typeof entry.createdAt === 'string' &&
    typeof entry.updatedAt === 'string'
  );
}

function sampleEntry(
  daysAgo: number,
  time: string,
  title: string,
  body: string,
  kind: JournalEntry['kind'],
  tags: string[],
  related: JournalEntry['related'],
): JournalEntry {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const dateValue = toLocalDateInput(date);
  const timestamp = new Date(`${dateValue}T${time}:00`).toISOString();

  return {
    id: `example-${daysAgo}`,
    title,
    body,
    date: dateValue,
    time,
    kind,
    tags,
    related,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createStarterEntries(): JournalEntry[] {
  return [
    sampleEntry(
      1,
      '20:04',
      'What stayed with me',
      'The most useful idea from today’s reading was not to chase motivation. It was to make the beginning of a practice obvious. I moved the book to the small table by the window. That change feels almost too simple, which may be the point.\\n\\n> Keep the evidence of what you are learning close enough to return to.\\n\\nThe note does not need to resolve anything. It only needs to keep the thread visible.',
      'Reading / practice',
      ['Reading', 'Practice'],
      [
        { id: 'reading', title: 'Reading', kind: 'habit' },
        { id: 'atomic-habits', title: 'Atomic Habits', kind: 'resource' },
      ],
    ),
    sampleEntry(
      3,
      '20:30',
      'A better way to review',
      'I tried to recall the main ideas before opening my notes. The gaps were useful evidence, not a verdict. Tomorrow I want to start with questions rather than highlighting.',
      'Learning / study',
      ['Study', 'Learning course'],
      [{ id: 'study', title: 'Study', kind: 'habit' }],
    ),
    sampleEntry(
      5,
      '18:40',
      'The week had more space',
      'The walks made the mornings feel less compressed. Reading happened on four of the seven scheduled days, and that was enough to keep the thread alive. I want to carry that gentler rhythm into next week.',
      'Weekly reflection',
      ['Walk', 'Reading'],
      [
        { id: 'walking', title: 'Walk', kind: 'habit' },
        { id: 'reading', title: 'Reading', kind: 'habit' },
      ],
    ),
  ];
}

export function readJournalEntries() {
  const saved = window.localStorage.getItem(JOURNAL_STORAGE_KEY);
  if (saved === null) return createStarterEntries();

  const parsed: unknown = JSON.parse(saved);
  if (
    !Array.isArray(parsed) ||
    !parsed.every(isJournalEntry)
  ) {
    throw new Error('Saved journal entries have an invalid format.');
  }
  return parsed;
}
