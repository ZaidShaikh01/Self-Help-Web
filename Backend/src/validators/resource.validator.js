import { z } from 'zod';
import { paginationQuerySchema, atLeastOneField } from './common.validator.js';

import {
  RESOURCE_TYPES as TYPES,
  RESOURCE_STATUSES as STATUSES,
  RESOURCE_CATEGORIES as CATEGORIES,
} from '../constants.js';

const baseResourceSchema = z.object({
  title: z
    .string({ error: 'Title is required' })
    .trim()
    .min(1, 'Title is required')
    .max(200),
  type: z.enum(TYPES, {
    error: 'Type must be Book, Article, YouTube or Documentary',
  }),
  // http(s) only: blocks javascript: links that would become XSS when rendered as href
  link: z
    .url('Invalid link')
    .refine(
      (v) => /^https?:\/\//i.test(v),
      'Link must start with http:// or https://',
    )
    .optional(),
  author: z.string().trim().max(120).optional(),
  status: z.enum(STATUSES, { error: 'Invalid status' }).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  category: z.enum(CATEGORIES, { error: 'Invalid category' }).optional(),
  pages: z.number().int().min(1).max(100000).optional(),
  currentPage: z.number().int().min(0).max(100000).optional(),
  summary: z.string().trim().max(1000).optional(),
});

export const createResourceSchema = baseResourceSchema.refine(
  (r) =>
    r.pages === undefined ||
    r.currentPage === undefined ||
    r.currentPage <= r.pages,
  'Current page cannot be greater than total pages',
);

export const updateResourceSchema = baseResourceSchema
  .partial()
  .refine(atLeastOneField, 'Provide at least one field to update');

export const resourceQuerySchema = paginationQuerySchema.extend({
  type: z.enum(TYPES).optional(),
  status: z.enum(STATUSES).optional(),
  category: z.enum(CATEGORIES).optional(),
  q: z.string().trim().max(100).optional(), // search in title and author
});

export const updateEpubProgressSchema = z.object({
  cfi: z
    .string({ error: 'CFI is required' })
    .trim()
    .min(1, 'CFI is required')
    .max(500, 'CFI cannot exceed 500 characters'),
  percentage: z
    .number({ error: 'Percentage is required' })
    .min(0, 'Percentage must be at least 0')
    .max(100, 'Percentage cannot exceed 100'),
});
