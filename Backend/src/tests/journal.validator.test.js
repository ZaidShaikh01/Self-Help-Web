import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createJournalSchema,
  updateJournalSchema,
} from '../validators/journal.validator.js';
import { updatePreferencesSchema } from '../validators/auth.validator.js';

test('journal create validates and preserves editor metadata', () => {
  const result = createJournalSchema.safeParse({
    title: 'A reflection',
    content: '',
    date: '2026-11-20',
    time: '21:15',
    kind: 'Reading / practice',
    tags: ['reading'],
    related: [{ id: 'habit-reading', title: 'Reading', kind: 'habit' }],
    prompt: 'What did I learn?',
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.content, '');
    assert.deepEqual(result.data.tags, ['reading']);
    assert.equal(result.data.related[0].kind, 'habit');
  }
});

test('journal update rejects invalid editor metadata', () => {
  const result = updateJournalSchema.safeParse({ kind: 'Unrecognized' });
  assert.equal(result.success, false);
});

test('preferences updates accept only supported local UI preferences', () => {
  assert.equal(
    updatePreferencesSchema.safeParse({
      theme: 'dark',
      sidebarCollapsed: true,
    }).success,
    true,
  );
  assert.equal(
    updatePreferencesSchema.safeParse({ sidebarCollapsed: 'yes' }).success,
    false,
  );
});
