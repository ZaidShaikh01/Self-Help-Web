import { z } from 'zod';

export const globalSearchQuerySchema = z.object({
  q: z.string().trim().min(2, 'Search must be at least 2 characters').max(100),
});
