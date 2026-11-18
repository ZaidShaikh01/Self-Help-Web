import { useState } from 'react';
import {
  ArrowUpRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Plus,
  Wallet,
} from 'lucide-react';
import AddModal, {
  type NewBookData,
  type NewNoteData,
} from '~/components/common/AddModal';
import PrimaryButton from '~/components/common/PrimaryButton';
import SecoundaryButton from '~/components/common/SecoundaryButton';

export default function Dashboard() {
  const [books] = useState([
    { id: 1, title: 'Atomic Habits', author: 'James Clear', progress: 85, category: 'Productivity' },
    { id: 2, title: 'Deep Work', author: 'Cal Newport', progress: 40, category: 'Focus' },
    { id: 3, title: 'The Psychology of Money', author: 'Morgan Housel', progress: 100, category: 'Finance' },
  ]);
  const [expenses] = useState([
    { id: 1, title: 'Audible Subscription', amount: 14.99, date: 'Today', category: 'Learning' },
    { id: 2, title: 'Gym Membership', amount: 45, date: 'Yesterday', category: 'Health' },
    { id: 3, title: 'Coffee & Journaling', amount: 6.5, date: 'Oct 14', category: 'Lifestyle' },
  ]);
  const [modalTab, setModalTab] = useState<'book' | 'note' | null>(null);

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

  const handleSaveBook = (data: NewBookData) => {
    console.log('New book submitted:', data);
  };

  const handleSaveNote = (data: NewNoteData) => {
    console.log('New note submitted:', data);
  };

  return (
    <div className="route-enter mx-auto max-w-7xl space-y-8 rounded-xl bg-[var(--canvas)] p-4 font-sans text-[var(--text)] sm:p-6 md:p-8">
      <section className="flex flex-col items-start justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 md:flex-row md:items-center">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">Daily Thought</p>
          <p className="text-lg font-medium md:text-xl">
            "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
          </p>
          <p className="text-sm text-[var(--text-3)]">- Will Durant</p>
        </div>
        <PrimaryButton content="New Quote" onClick={() => setModalTab('note')} />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-[var(--canvas-2)] p-2">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Library &amp; Notes</h2>
                <p className="text-xs text-[var(--text-3)]">Track active reads, quotes &amp; book summaries</p>
              </div>
            </div>
            <SecoundaryButton content="Add Note" onClick={() => setModalTab('note')} addPlus />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {books.map((book) => (
              <article
                key={book.id}
                className="space-y-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-2)] p-4 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--border)]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent-text)]">
                      {book.category}
                    </span>
                    <h3 className="mt-2 font-semibold">{book.title}</h3>
                    <p className="text-xs text-[var(--text-3)]">{book.author}</p>
                  </div>
                  <Bookmark className="h-4 w-4 text-[var(--text-3)]" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[var(--text-3)]">
                    <span>Progress</span>
                    <span>{book.progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-inset)]">
                    <div
                      className="h-full rounded-full bg-[var(--text)] transition-[width] duration-500"
                      style={{ width: `${book.progress}%` }}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-1 pt-2 text-xs font-semibold text-[var(--accent-text)] hover:underline"
          >
            View All Books &amp; Notes <ChevronRight className="h-3 w-3" />
          </button>
        </section>

        <section className="space-y-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-[var(--canvas-2)] p-2">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Expenses</h2>
                <p className="text-xs text-[var(--text-3)]">Monthly overview</p>
              </div>
            </div>
            <button type="button" className="rounded-md bg-[var(--canvas-2)] p-1.5" aria-label="Add expense">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1 rounded-lg bg-[var(--granite-strong)] p-4 text-[var(--surface)]">
            <p className="text-xs opacity-75">Total Spent (Oct)</p>
            <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)]">Recent Transactions</p>
            {expenses.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-[var(--border-subtle)] py-2 text-sm last:border-0">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-[var(--text-3)]">{item.date} - {item.category}</p>
                </div>
                <span className="font-semibold">-${item.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <button type="button" className="flex w-full items-center justify-center gap-1 pt-2 text-xs font-semibold text-[var(--accent-text)] hover:underline">
            Full Expense Logs <ChevronRight className="h-3 w-3" />
          </button>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[
          { title: 'Habit Tracker', detail: 'Track daily routines, streaks, and personal consistency metrics.', status: 'BUILDING NEXT', icon: CheckCircle2 },
          { title: 'Clips & Reels Vault', detail: 'Save inspiring video clips, reels, and media notes in one organized place.', status: 'PLANNED', icon: ArrowUpRight },
        ].map(({ title, detail, status, icon: Icon }) => (
          <article key={title} className="space-y-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 opacity-75">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-[var(--text-3)]" />
                <h3 className="font-bold">{title}</h3>
              </div>
              <span className="rounded bg-[var(--canvas-2)] px-2 py-0.5 font-mono text-[10px] text-[var(--text-3)]">{status}</span>
            </div>
            <p className="text-xs text-[var(--text-3)]">{detail}</p>
          </article>
        ))}
      </div>

      {modalTab && (
        <AddModal
          isOpen
          onClose={() => setModalTab(null)}
          onSaveBook={handleSaveBook}
          onSaveNote={handleSaveNote}
          defaultTab={modalTab}
        />
      )}
    </div>
  );
}
