import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createExpenseSchema,
  createExpensesSchema,
  expenseQuerySchema,
  updateExpenseSchema,
} from '../validators/expense.validator.js';

const validExpense = {
  title: 'Coffee',
  amountCents: 525,
  category: 'Food',
  date: '2026-11-20',
};

test('expense creation accepts valid values and rejects invalid amounts or dates', () => {
  assert.equal(createExpenseSchema.safeParse(validExpense).success, true);
  assert.equal(
    createExpenseSchema.safeParse({ ...validExpense, amountCents: 5.25 }).success,
    false,
  );
  assert.equal(
    createExpenseSchema.safeParse({ ...validExpense, amountCents: 0 }).success,
    false,
  );
  assert.equal(
    createExpenseSchema.safeParse({ ...validExpense, date: '2026-02-30' })
      .success,
    false,
  );
});

test('expense updates require a field and list queries validate month ranges', () => {
  assert.equal(createExpensesSchema.safeParse([validExpense]).success, true);
  assert.equal(createExpensesSchema.safeParse([]).success, false);
  assert.equal(updateExpenseSchema.safeParse({}).success, false);
  assert.equal(updateExpenseSchema.safeParse({ category: 'Transport' }).success, true);
  assert.equal(
    expenseQuerySchema.safeParse({
      from: '2026-11-30',
      to: '2026-11-01',
    }).success,
    false,
  );
  assert.equal(
    expenseQuerySchema.safeParse({
      from: '2026-11-01',
      to: '2026-11-30',
    }).success,
    true,
  );
});
