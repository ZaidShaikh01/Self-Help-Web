import { z } from 'zod';
import { isValidDateString } from '../utils/HabitDate.js';
import { EXPENSE_CATEGORIES } from '../constants.js';
import { atLeastOneField } from './common.validator.js';

const dateString = z.string().refine(isValidDateString, {
  message: 'Date must be a real date in YYYY-MM-DD format',
});

const expenseFields = {
  title: z.string().trim().min(1, 'Expense title is required').max(120),
  amountCents: z.number().int().min(1).max(100_000_000),
  category: z.enum(EXPENSE_CATEGORIES),
  date: dateString,
  note: z.string().trim().max(300).optional(),
};

export const createExpenseSchema = z.object(expenseFields);
export const createExpensesSchema = z
  .array(createExpenseSchema)
  .min(1, 'At least one expense is required')
  .max(25, 'A maximum of 25 expenses can be created at once');

export const updateExpenseSchema = createExpenseSchema
  .partial()
  .refine(atLeastOneField, 'Provide at least one field to update');

export const expenseQuerySchema = z
  .object({
    from: dateString.optional(),
    to: dateString.optional(),
    category: z.enum(EXPENSE_CATEGORIES).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(100),
  })
  .refine(({ from, to }) => !from || !to || from <= to, {
    message: 'Start date must be on or before end date',
    path: ['from'],
  });
