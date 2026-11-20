import { Plus, Wallet } from 'lucide-react';
import { Link } from 'react-router';
import { formatMoney, type Expense } from '~/lib/expenses';

interface ExpensePreviewProps {
  expenses: Expense[];
  totalCents: number;
  monthLabel?: string;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  onAddExpense?: () => void;
}

export default function ExpensePreview({
  expenses,
  totalCents,
  monthLabel = 'This month',
  isLoading = false,
  error = '',
  onRetry,
  onAddExpense,
}: ExpensePreviewProps) {
  return (
    <section className="dashboard-panel space-y-5">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-md bg-[var(--canvas-2)] p-2">
            <Wallet className="h-5 w-5 text-[var(--text)]" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-[var(--text)] sm:text-lg">
              Expenses
            </h2>
            <p className="text-xs text-[var(--text-3)]">{monthLabel}</p>
          </div>
        </div>

        {onAddExpense && (
          <button
            type="button"
            onClick={onAddExpense}
            aria-label="Add expense"
            className="rounded-md bg-[var(--canvas-2)] p-1.5 transition-colors hover:bg-[var(--border-subtle)]"
          >
            <Plus className="h-4 w-4 text-[var(--text)]" />
          </button>
        )}
      </div>

      <div className="space-y-1 rounded-lg bg-[var(--granite-strong)] p-4 text-[var(--on-accent)]">
        <p className="text-xs text-white/70">Recorded spending</p>
        <p className="text-2xl font-bold tracking-tight">{isLoading ? '…' : formatMoney(totalCents)}</p>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">
          Recent transactions
        </p>
        <ul className="divide-y divide-[var(--border-subtle)]">
          {expenses.slice(0, 4).map((item) => (
            <li
              key={item._id}
              className="flex items-center justify-between gap-3 py-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-[var(--text)]">
                  {item.title}
                </p>
                <p className="text-xs text-[var(--text-3)]">
                  {new Date(`${item.date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {item.category}
                </p>
              </div>
              <span className="shrink-0 font-semibold text-[var(--text)]">
                -{formatMoney(item.amountCents)}
              </span>
            </li>
          ))}
        </ul>
        {!expenses.length && (
          <p className="py-2 text-xs text-[var(--text-3)]">
            {isLoading ? 'Loading your expense timeline…' : 'No expenses yet. Add your first entry to start a timeline.'}
          </p>
        )}
        {error && (
          <div className="flex items-center justify-between gap-2 py-2 text-xs text-[var(--text-3)]" role="alert">
            <span>{error}</span>
            {onRetry && <button type="button" className="font-semibold text-[var(--accent)]" onClick={onRetry}>Retry</button>}
          </div>
        )}
        <Link to="/expenses" className="inline-flex items-center gap-1 pt-2 text-xs font-semibold text-[var(--accent)]">
          Open expense timeline <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
