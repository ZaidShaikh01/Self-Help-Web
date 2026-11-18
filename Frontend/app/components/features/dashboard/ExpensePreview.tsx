import { Plus, Wallet } from 'lucide-react';
import type { DashboardExpense } from './types';

interface ExpensePreviewProps {
  expenses: DashboardExpense[];
  monthLabel?: string;
  onAddExpense?: () => void;
}

export default function ExpensePreview({
  expenses,
  monthLabel = 'This month',
  onAddExpense,
}: ExpensePreviewProps) {
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

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
            <p className="text-xs text-[var(--text-3)]">Monthly overview</p>
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
        <p className="text-xs text-white/70">Total spent ({monthLabel})</p>
        <p className="text-2xl font-bold tracking-tight">
          ${totalSpent.toFixed(2)}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">
          Recent transactions
        </p>
        <ul className="divide-y divide-[var(--border-subtle)]">
          {expenses.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 py-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-[var(--text)]">
                  {item.title}
                </p>
                <p className="text-xs text-[var(--text-3)]">
                  {item.date} · {item.category}
                </p>
              </div>
              <span className="shrink-0 font-semibold text-[var(--text)]">
                -${item.amount.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
