import { useCallback, useEffect, useState } from 'react';
import {
  createExpense,
  createExpenses,
  deleteExpense,
  fetchExpenses,
  updateExpense,
  type Expense,
  type ExpenseInput,
  type ExpenseSummary,
} from '~/lib/expenses';

export function useExpenses(from: string, to: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary>({
    totalCents: 0,
    transactionCount: 0,
    categoryTotals: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);

  const reload = useCallback(() => {
    setReloadCount((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');

    async function load() {
      try {
        const firstPage = await fetchExpenses({ from, to });
        const otherPages = await Promise.all(
          Array.from(
            { length: Math.max(0, firstPage.totalPages - 1) },
            (_, index) =>
              fetchExpenses({ from, to, page: index + 2 }),
          ),
        );
        if (!active) return;
        setExpenses(
          [firstPage, ...otherPages].flatMap((page) => page.expenses),
        );
        setSummary(firstPage.summary);
      } catch (caught) {
        if (!active) return;
        setError(
          caught instanceof Error
            ? caught.message
            : 'Expenses could not be loaded.',
        );
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [from, to, reloadCount]);

  const save = useCallback(
    async (input: ExpenseInput, existing?: Expense) => {
      setIsSaving(true);
      setError('');
      try {
        if (existing) await updateExpense(existing._id, input);
        else await createExpense(input);
        reload();
        return true;
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Expense could not be saved.',
        );
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  const saveMany = useCallback(
    async (inputs: ExpenseInput[]) => {
      setIsSaving(true);
      setError('');
      try {
        await createExpenses(inputs);
        reload();
        return true;
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Expenses could not be saved.',
        );
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  const remove = useCallback(
    async (expense: Expense) => {
      setIsSaving(true);
      setError('');
      try {
        await deleteExpense(expense._id);
        reload();
        return true;
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Expense could not be deleted.',
        );
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  return {
    expenses,
    summary,
    isLoading,
    isSaving,
    error,
    reload,
    save,
    saveMany,
    remove,
  };
}
