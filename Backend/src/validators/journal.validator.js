import { z } from 'zod';
import { paginationQuerySchema, atLeastOneField } from './common.validator.js';

const MOODS = ['Productive', 'Calm', 'Stressed', 'Motivated', 'Reflective'];
const KINDS = [
  'Reflection',
  'Daily reflection',
  'Reading / practice',
  'Learning / study',
  'Weekly reflection',
];

const journalFields = {
  title: z.string().trim().min(1, 'Journal title is required').max(200),
  content: z.string().trim().max(25000, 'Journal content is too long'),
  mood: z.enum(MOODS).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  kind: z.enum(KINDS).optional(),
  tags: z.array(z.string().trim().min(1).max(100)).max(10).optional(),
  related: z
    .array(
      z.object({
        id: z.string().min(1).max(200),
        title: z.string().trim().min(1).max(120),
        kind: z.enum(['habit', 'resource']),
      }),
    )
    .max(20)
    .optional(),
  prompt: z.string().max(2000).optional(),
  isPinned: z.boolean().optional(),
};

export const createJournalSchema = z.object(journalFields);

export const updateJournalSchema = createJournalSchema
  .partial()
  .refine(atLeastOneField, 'Provide at least one field to update');

export const journalQuerySchema = paginationQuerySchema;
