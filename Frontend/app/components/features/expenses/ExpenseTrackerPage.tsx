import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Plus,
  ReceiptText,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { Link } from 'react-router';
import { toLocalDateInput } from '~/components/features/journal/journalUtils';
import { useExpenses } from '~/hooks/useExpenses';
import {
  EXPENSE_CATEGORIES,
  formatMoney,
  getMonthDateRange,
  type Expense,
  type ExpenseCategory,
  type ExpenseInput,
} from '~/lib/expenses';

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: 'food',
  Transport: 'transport',
  Home: 'home',
  Health: 'health',
  Learning: 'learning',
  Leisure: 'leisure',
  Bills: 'bills',
  Other: 'other',
};

function monthLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function ExpenseForm({
  expense,
  date,
  isSaving,
  error,
  onClose,
  onSave,
}: {
  expense: Expense | null;
  date: string;
  isSaving: boolean;
  error: string;
  onClose: () => void;
  onSave: (input: ExpenseInput) => void;
}) {
  const [title, setTitle] = useState(expense?.title ?? '');
  const [amount, setAmount] = useState(
    expense ? (expense.amountCents / 100).toFixed(2) : '',
  );
  const [category, setCategory] = useState<ExpenseCategory>(
    expense?.category ?? 'Other',
  );
  const [expenseDate, setExpenseDate] = useState(expense?.date ?? date);
  const [note, setNote] = useState(expense?.note ?? '');

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amountCents = Math.round(Number(amount) * 100);
    if (!Number.isSafeInteger(amountCents) || amountCents < 1) return;
    onSave({ title: title.trim(), amountCents, category, date: expenseDate, note });
  }

  return (
    <div className="expense-modal-backdrop" onMouseDown={onClose}>
      <section
        className="expense-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="expense-modal-header">
          <div>
            <p className="expense-kicker">{expense ? 'UPDATE RECORD' : 'NEW RECORD'}</p>
            <h2 id="expense-form-title">{expense ? 'Edit expense' : 'Add an expense'}</h2>
          </div>
          <button type="button" className="expense-icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <form className="expense-form" onSubmit={submit}>
          {error && <p className="expense-form-error" role="alert">{error}</p>}
          <label>
            <span>Description</span>
            <input
              autoFocus
              required
              maxLength={120}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What did you spend on?"
            />
          </label>
          <div className="expense-form-row">
            <label>
              <span>Amount (USD)</span>
              <div className="expense-amount-input">
                <span>$</span>
                <input
                  type="number"
                  required
                  min="0.01"
                  max="1000000"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.00"
                />
              </div>
            </label>
            <label>
              <span>Date</span>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(event) => setExpenseDate(event.target.value)}
              />
            </label>
          </div>
          <label>
            <span>Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as ExpenseCategory)}
            >
              {EXPENSE_CATEGORIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Note <small>(optional)</small></span>
            <textarea
              maxLength={300}
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="A little context for later"
            />
          </label>
          <footer className="expense-form-actions">
            <button type="button" className="expense-secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="expense-primary-button" disabled={isSaving}>
              {isSaving ? 'Saving…' : expense ? 'Save changes' : 'Save expense'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function makeSampleInputs(date: string): ExpenseInput[] {
  return [
    { title: 'Coffee & breakfast', amountCents: 1280, category: 'Food', date },
    { title: 'Metro pass', amountCents: 650, category: 'Transport', date },
    { title: 'Notebook', amountCents: 899, category: 'Learning', date },
  ];
}

export default function ExpenseTrackerPage() {
  const [month, setMonth] = useState(() => new Date());
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'All'>('All');
  const [editing, setEditing] = useState<Expense | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const range = useMemo(() => getMonthDateRange(month), [month]);
  const { expenses, summary, isLoading, isSaving, error, save, saveMany, remove, reload } =
    useExpenses(range.from, range.to);

  const filteredExpenses = useMemo(
    () => expenses.filter((item) => categoryFilter === 'All' || item.category === categoryFilter),
    [categoryFilter, expenses],
  );
  const groupedExpenses = useMemo(() => {
    const groups = new Map<string, Expense[]>();
    filteredExpenses.forEach((expense) => {
      const current = groups.get(expense.date) ?? [];
      current.push(expense);
      groups.set(expense.date, current);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredExpenses]);

  const today = toLocalDateInput(new Date());
  const formDate = range.from <= today && range.to >= today
    ? today
    : range.from;

  async function handleSave(input: ExpenseInput) {
    if (await save(input, editing || undefined)) setEditing(undefined);
  }

  async function addSamples() {
    await saveMany(makeSampleInputs(formDate));
  }

  return (
    <div className="expense-page">
      <header className="expense-page-header">
        <div>
          <p className="expense-kicker">YOUR MONEY, IN CONTEXT</p>
          <h1>Spending, made visible.</h1>
          <p className="expense-page-subtitle">
            A calm record of where your money goes, one day at a time.
          </p>
        </div>
        <button type="button" className="expense-primary-button" onClick={() => setEditing(null)}>
          <Plus size={16} /> Add expense
        </button>
      </header>

      <section className="expense-overview" aria-label="Monthly expense summary">
        <div className="expense-overview-main">
          <div className="expense-overview-top">
            <div className="expense-overview-icon"><Wallet size={19} /></div>
            <span>MONTHLY TOTAL</span>
          </div>
          <p className="expense-total">{formatMoney(summary.totalCents)}</p>
          <p className="expense-overview-caption">
            {summary.transactionCount} {summary.transactionCount === 1 ? 'transaction' : 'transactions'} recorded
          </p>
        </div>
        <div className="expense-category-summary">
          <p className="expense-kicker">BY CATEGORY</p>
          {summary.categoryTotals.length ? summary.categoryTotals.slice(0, 4).map((item) => (
            <div className="expense-category-total" key={item.category}>
              <span><i className={`expense-category-dot category-${CATEGORY_COLORS[item.category]}`} />{item.category}</span>
              <strong>{formatMoney(item.totalCents)}</strong>
            </div>
          )) : (
            <p className="expense-no-category">Category totals appear as you add expenses.</p>
          )}
        </div>
      </section>

      <section className="expense-timeline-panel">
        <div className="expense-timeline-toolbar">
          <div className="expense-month-control">
            <CalendarDays size={16} />
            <h2>{monthLabel(month)}</h2>
            <button
              type="button"
              onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
              aria-label="Previous month"
            ><ArrowLeft size={16} /></button>
            <button
              type="button"
              onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
              aria-label="Next month"
            ><ArrowRight size={16} /></button>
          </div>
          <label className="expense-filter">
            <span className="sr-only">Filter expenses by category</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as ExpenseCategory | 'All')}>
              <option value="All">All categories</option>
              {EXPENSE_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>

        {error && (
          <div className="expense-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={reload}>Retry</button>
          </div>
        )}

        {isLoading ? (
          <div className="expense-loading" role="status">Loading your spending history…</div>
        ) : groupedExpenses.length ? (
          <div className="expense-days">
            {groupedExpenses.map(([date, items]) => (
              <section className="expense-day" key={date}>
                <div className="expense-day-marker" aria-hidden="true"><i /></div>
                <header className="expense-day-header">
                  <div>
                    <h3>{new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                    <span>{items.length} {items.length === 1 ? 'entry' : 'entries'}</span>
                  </div>
                  <strong>{formatMoney(items.reduce((total, item) => total + item.amountCents, 0))}</strong>
                </header>
                <div className="expense-day-entries">
                  {items.map((expense) => (
                    <article className="expense-entry" key={expense._id}>
                      <div className={`expense-entry-symbol category-${CATEGORY_COLORS[expense.category]}`}>
                        <ReceiptText size={17} />
                      </div>
                      <div className="expense-entry-copy">
                        <h4>{expense.title}</h4>
                        <span>{expense.category}{expense.note ? ` · ${expense.note}` : ''}</span>
                      </div>
                      <strong>{formatMoney(expense.amountCents)}</strong>
                      <button type="button" onClick={() => setEditing(expense)} aria-label={`Edit ${expense.title}`} title="Edit expense">
                        <span className="sr-only">Edit</span><Plus size={15} />
                      </button>
                      <button type="button" onClick={() => setDeleting(expense)} aria-label={`Delete ${expense.title}`} title="Delete expense">
                        <Trash2 size={15} />
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="expense-empty">
            <div><Wallet size={23} /></div>
            <p className="expense-kicker">{categoryFilter === 'All' ? 'A FRESH PAGE' : categoryFilter.toUpperCase()}</p>
            <h3>{expenses.length ? 'No entries in this category.' : 'Your timeline starts here.'}</h3>
            <p>{expenses.length ? 'Choose another category to see its entries.' : 'Add a purchase as it happens, or create a few clearly labeled sample records to explore the tracker.'}</p>
            {expenses.length ? (
              <button type="button" className="expense-secondary-button" onClick={() => setCategoryFilter('All')}>Show all categories</button>
            ) : (
              <div className="expense-empty-actions">
                <button type="button" className="expense-primary-button" onClick={() => setEditing(null)}><Plus size={15} /> Add first expense</button>
                <button type="button" className="expense-secondary-button" disabled={isSaving} onClick={() => void addSamples()}>
                  {isSaving ? 'Adding samples…' : 'Add sample expenses'}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <footer className="expense-page-footer">
        <span>Amounts are stored as exact cents, never rounded floats.</span>
        <Link to="/dashboard">Back to today <ArrowRight size={14} /></Link>
      </footer>

      {editing !== undefined && (
        <ExpenseForm
          key={editing?._id ?? 'new'}
          expense={editing}
          date={formDate}
          isSaving={isSaving}
          error={error}
          onClose={() => setEditing(undefined)}
          onSave={(input) => void handleSave(input)}
        />
      )}
      {deleting && (
        <div className="expense-modal-backdrop" onMouseDown={() => setDeleting(null)}>
          <section className="expense-modal expense-delete-modal" role="dialog" aria-modal="true" aria-labelledby="expense-delete-title" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="expense-icon-button expense-delete-close" onClick={() => setDeleting(null)} aria-label="Close"><X size={18} /></button>
            <p className="expense-kicker">REMOVE RECORD</p>
            <h2 id="expense-delete-title">Delete this expense?</h2>
            <p><strong>{deleting.title}</strong> · {formatMoney(deleting.amountCents)}. This cannot be undone.</p>
            {error && <p className="expense-form-error" role="alert">{error}</p>}
            <footer className="expense-form-actions">
              <button type="button" className="expense-secondary-button" onClick={() => setDeleting(null)}>Keep it</button>
              <button type="button" className="expense-danger-button" disabled={isSaving} onClick={() => void remove(deleting).then((success) => success && setDeleting(null))}>
                {isSaving ? 'Deleting…' : 'Delete expense'}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
