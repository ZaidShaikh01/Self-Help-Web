import { api } from './api';
import type { JournalEntryKind } from '~/components/features/journal/types';

export interface PinnedHabit {
  _id: string;
  title: string;
  description: string;
  isArchived: boolean;
  updatedAt: string;
}

export interface PinnedBook {
  _id: string;
  title: string;
  author?: string;
  category?: string;
  updatedAt: string;
}

export interface PinnedJournal {
  _id: string;
  title: string;
  content: string;
  date?: string;
  kind?: JournalEntryKind;
  updatedAt: string;
}

export interface PinnedItems {
  habits: PinnedHabit[];
  books: PinnedBook[];
  journals: PinnedJournal[];
}

export function fetchPinnedItems() {
  return api<PinnedItems>('/pinned');
}
