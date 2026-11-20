import { z } from 'zod';
import { TIME_RE, isValidDateString } from '../utils/HabitDate.js';

const dateString = z.string().refine(isValidDateString, {
  message: 'Date must be a real date in YYYY-MM-DD format',
});

// Zod strips keys that aren't listed, so a client can never set
// user, currentStreak, longestStreak, etc. through these schemas.
export const createHabitSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(80, 'Title can be at most 80 characters'),
  description: z
    .string()
    .trim()
    .max(300, 'Description can be at most 300 characters')
    .optional(),
  tags: z
    .array(z.string().trim().min(1).max(20))
    .max(10, 'At most 10 tags')
    .optional(),
  schedule: z
    .object({
      type: z.enum(['daily', 'weekdays', 'custom']),
      daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
    })
    .optional(),
  target: z
    .object({
      count: z.number().int().min(1, 'Target must be at least 1'),
      unit: z.string().trim().max(20).optional(),
    })
    .optional(),
  timezone: z.string().min(1).optional(),
  startDate: dateString.optional(),
  endDate: dateString.optional(),
  reminder: z
    .object({
      enabled: z.boolean(),
      time: z.string().regex(TIME_RE, 'Reminder time must be HH:mm').optional(),
    })
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a hex value like #4f46e5')
    .optional(),
  isPinned: z.boolean().optional(),
});


export const updateHabitSchema = createHabitSchema
  .extend({
    schedule: createHabitSchema.shape.schedule.unwrap().partial().optional(),
    target: createHabitSchema.shape.target.unwrap().partial().optional(),
    reminder: createHabitSchema.shape.reminder.unwrap().partial().optional(),
    endDate: dateString.nullable().optional(),
  })
  .partial();

export const logSchema = z.object({
  value: z.number().positive('Value must be greater than 0').default(1),
  note: z
    .string()
    .trim()
    .max(200, 'Note can be at most 200 characters')
    .optional(),
});

export const statsQuerySchema = z.object({
  from: dateString.optional(),
  to: dateString.optional(),
});

export const listQuerySchema = z.object({
  tag: z.string().trim().toLowerCase().optional(),
  archived: z.enum(['true', 'false']).default('false'),
});
export const weeklySummaryQuerySchema = z.object({
  from: dateString,
  to: dateString,
});
