import type { Note, Resource } from '~/lib/library';
import type { NewNoteData } from '~/components/common/AddModal';

const demoCreatedAt = '2026-10-18T09:00:00.000Z';

export const DEMO_BOOKS: Resource[] = [
  {
    _id: 'demo-atomic-habits',
    title: 'Atomic Habits',
    type: 'Book',
    author: 'James Clear',
    status: 'In Progress',
    category: 'Productivity',
    pages: 320,
    currentPage: 112,
    summary:
      'A practical guide to building repeatable systems, making good actions easier to begin, and noticing small improvements over time.',
    progress: 35,
    isPinned: false,
    createdAt: demoCreatedAt,
    updatedAt: demoCreatedAt,
  },
  {
    _id: 'demo-deep-work',
    title: 'Deep Work',
    type: 'Book',
    author: 'Cal Newport',
    status: 'Plan to Do',
    category: 'Focus',
    pages: 304,
    currentPage: 0,
    summary:
      'Ideas for protecting focused time and producing meaningful work in a distracted environment.',
    progress: 0,
    isPinned: false,
    createdAt: demoCreatedAt,
    updatedAt: demoCreatedAt,
  },
  {
    _id: 'demo-your-money-or-your-life',
    title: 'Your Money or Your Life',
    type: 'Book',
    author: 'Vicki Robin',
    status: 'Completed',
    category: 'Finance',
    pages: 368,
    currentPage: 368,
    summary:
      'A values-led framework for understanding spending, time, and the choices that shape financial well-being.',
    progress: 100,
    isPinned: false,
    createdAt: demoCreatedAt,
    updatedAt: demoCreatedAt,
  },
];

export const DEMO_NOTES: NewNoteData[] = [
  {
    bookTitle: 'Atomic Habits',
    quote: '',
    reflection:
      'Make the next useful action visible, then make it small enough to begin without negotiating with myself.',
    tags: 'systems, practice',
  },
  {
    bookTitle: 'Deep Work',
    quote: '',
    reflection:
      'A protected block of attention is more useful than a long list of interrupted intentions.',
    tags: 'focus, attention',
  },
];

export const DEMO_NOTE_PREVIEWS: Note[] = DEMO_NOTES.map((note, index) => ({
  _id: `demo-note-${index + 1}`,
  title: note.bookTitle,
  content: note.reflection,
  tags: note.tags.split(',').map((tag) => tag.trim()),
  createdAt: demoCreatedAt,
  updatedAt: demoCreatedAt,
}));
