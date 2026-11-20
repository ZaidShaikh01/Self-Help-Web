import { api } from './api';
import type { JournalEntry, JournalEntryInput } from '~/components/features/journal/types';

interface JournalDocument {
  _id: string;
  title: string;
  content: string;
  date?: string;
  time?: string;
  kind?: JournalEntry['kind'];
  tags?: string[];
  related?: JournalEntry['related'];
  prompt?: string;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface JournalsResponse {
  journals: JournalDocument[];
  totalPages: number;
}

function toEntry(document: JournalDocument): JournalEntry {
  const createdAt = new Date(document.createdAt);
  const date = document.date ?? [
    createdAt.getFullYear(),
    String(createdAt.getMonth() + 1).padStart(2, '0'),
    String(createdAt.getDate()).padStart(2, '0'),
  ].join('-');

  return {
    id: document._id,
    title: document.title,
    body: document.content,
    date,
    time:
      document.time ??
      `${String(createdAt.getHours()).padStart(2, '0')}:${String(createdAt.getMinutes()).padStart(2, '0')}`,
    kind: document.kind ?? 'Reflection',
    tags: document.tags ?? [],
    related: document.related ?? [],
    prompt: document.prompt,
    isPinned: document.isPinned ?? false,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

function toPayload(input: JournalEntryInput) {
  return {
    title: input.title,
    content: input.body,
    date: input.date,
    time: input.time,
    kind: input.kind,
    tags: input.tags,
    related: input.related,
    prompt: input.prompt,
    ...(input.isPinned === undefined ? {} : { isPinned: input.isPinned }),
  };
}

export async function fetchJournalEntries(): Promise<JournalEntry[]> {
  const firstPage = await api<JournalsResponse>('/journals?page=1&limit=50');
  const remaining = await Promise.all(
    Array.from({ length: Math.max(0, firstPage.totalPages - 1) }, (_, index) =>
      api<JournalsResponse>(`/journals?page=${index + 2}&limit=50`),
    ),
  );
  return [firstPage, ...remaining]
    .flatMap((page) => page.journals)
    .map(toEntry);
}

export async function createJournalEntry(input: JournalEntryInput) {
  const created = await api<JournalDocument>('/journals', {
    method: 'POST',
    body: toPayload(input),
  });
  return toEntry(created);
}

export async function updateJournalEntry(
  id: string,
  input: JournalEntryInput,
) {
  const updated = await api<JournalDocument>(`/journals/${id}`, {
    method: 'PATCH',
    body: toPayload(input),
  });
  return toEntry(updated);
}

export function deleteJournalEntry(id: string) {
  return api(`/journals/${id}`, { method: 'DELETE' });
}
