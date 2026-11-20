import { z } from 'zod';
import {
  paginationQuerySchema,
  atLeastOneField,
  objectIdSchema,
} from './common.validator.js';

const tagsSchema = z
  .array(z.string().trim().min(1).max(20))
  .max(10, 'At most 10 tags');

export const createNoteSchema = z
  .object({
    title: z.string().trim().max(200).optional(),
    content: z.string().trim().max(20000).optional(),
    quote: z.string().trim().max(1000).optional(),
    tags: tagsSchema.optional(),
    resourceId: objectIdSchema.optional(),
    habitId: objectIdSchema.optional(),
  })
  .refine((n) => n.content || n.quote, 'Add a quote or some content');

export const updateNoteSchema = z
  .object({
    title: z.string().trim().max(200).optional(),
    content: z.string().trim().max(20000).optional(),
    quote: z.string().trim().max(1000).optional(),
    tags: tagsSchema.optional(),
    resourceId: objectIdSchema.optional(),
    habitId: objectIdSchema.optional(),
  })
  .refine(atLeastOneField, 'Provide at least one field to update');

export const noteQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().min(1).max(100).optional(),
  resourceId: objectIdSchema.optional(),
  habitId: objectIdSchema.optional(),
  tag: z.string().trim().toLowerCase().optional(),
});
