export type JournalEntryKind =
  | 'Reflection'
  | 'Daily reflection'
  | 'Reading / practice'
  | 'Learning / study'
  | 'Weekly reflection';

export interface JournalRelatedObject {
  id: string;
  title: string;
  kind: 'habit' | 'resource';
}

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  date: string;
  time: string;
  kind: JournalEntryKind;
  tags: string[];
  related: JournalRelatedObject[];
  prompt?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type JournalEntryInput = Omit<
  JournalEntry,
  'id' | 'createdAt' | 'updatedAt' | 'isPinned'
> & { isPinned?: boolean };
