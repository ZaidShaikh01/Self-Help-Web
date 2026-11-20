import { api } from './api';

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Home',
  'Health',
  'Learning',
  'Leisure',
  'Bills',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense {
  _id: string;
  title: string;
  amountCents: number;
  category: ExpenseCategory;
  date: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCategoryTotal {
  category: ExpenseCategory;
  totalCents: number;
  count: number;
}

export interface ExpenseSummary {
  totalCents: number;
  transactionCount: number;
  categoryTotals: ExpenseCategoryTotal[];
}

export interface ExpenseListResponse {
  expenses: Expense[];
  totalPages: number;
  currentPage: number;
  totalExpenses: number;
  summary: ExpenseSummary;
}

export interface ExpenseInput {
  title: string;
  amountCents: number;
  category: ExpenseCategory;
  date: string;
  note?: string;
}

export function getMonthDateRange(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, date.getMonth() + 1, 0).getDate();

  return {
    from: `${year}-${month}-01`,
    to: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

export function formatMoney(amountCents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountCents / 100);
}

export function fetchExpenses(params: {
  from: string;
  to: string;
  page?: number;
  limit?: number;
}): Promise<ExpenseListResponse> {
  const query = new URLSearchParams({
    from: params.from,
    to: params.to,
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 100),
  });
  return api<ExpenseListResponse>(`/expenses?${query.toString()}`);
}

export function createExpense(input: ExpenseInput) {
  return api<Expense>('/expenses', { method: 'POST', body: input });
}

export function createExpenses(inputs: ExpenseInput[]) {
  return api<Expense[]>('/expenses/bulk', { method: 'POST', body: inputs });
}

export function updateExpense(id: string, input: ExpenseInput) {
  return api<Expense>(`/expenses/${id}`, { method: 'PATCH', body: input });
}

export function deleteExpense(id: string) {
  return api<Record<string, never>>(`/expenses/${id}`, { method: 'DELETE' });
}
