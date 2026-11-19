export type JournalEntryKind =
  | 'Reflection'
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
  createdAt: string;
  updatedAt: string;
}

export type JournalEntryInput = Omit<
  JournalEntry,
  'id' | 'createdAt' | 'updatedAt'
>;
