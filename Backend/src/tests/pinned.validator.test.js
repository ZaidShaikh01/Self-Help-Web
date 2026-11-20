import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createHabitSchema,
  updateHabitSchema,
} from '../validators/habit.validator.js';
import {
  createResourceSchema,
  updateResourceSchema,
} from '../validators/resource.validator.js';
import {
  createJournalSchema,
  updateJournalSchema,
} from '../validators/journal.validator.js';
import { globalSearchQuerySchema } from '../validators/search.validator.js';

test('habit, resource, and journal validators accept boolean pin updates', () => {
  assert.equal(createHabitSchema.safeParse({ title: 'Walk', isPinned: true }).success, true);
  assert.equal(updateHabitSchema.safeParse({ isPinned: false }).success, true);
  assert.equal(
    createResourceSchema.safeParse({
      title: 'A book',
      type: 'Book',
      isPinned: true,
    }).success,
    true,
  );
  assert.equal(updateResourceSchema.safeParse({ isPinned: true }).success, true);
  assert.equal(
    createJournalSchema.safeParse({
      title: 'Today',
      content: '',
      kind: 'Daily reflection',
      isPinned: true,
    }).success,
    true,
  );
  assert.equal(updateJournalSchema.safeParse({ isPinned: false }).success, true);
});

test('pin fields reject non-boolean values', () => {
  assert.equal(updateHabitSchema.safeParse({ isPinned: 'true' }).success, false);
  assert.equal(updateResourceSchema.safeParse({ isPinned: 1 }).success, false);
  assert.equal(updateJournalSchema.safeParse({ isPinned: 'false' }).success, false);
});

test('global search requires a trimmed query with a bounded length', () => {
  assert.deepEqual(globalSearchQuerySchema.safeParse({ q: '  habits  ' }).data, {
    q: 'habits',
  });
  assert.equal(globalSearchQuerySchema.safeParse({ q: 'x' }).success, false);
  assert.equal(
    globalSearchQuerySchema.safeParse({ q: 'x'.repeat(101) }).success,
    false,
  );
});
