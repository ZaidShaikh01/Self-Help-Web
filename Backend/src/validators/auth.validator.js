import { z } from 'zod';

const fullnameSchema = z
  .string({ error: 'Full name is required' })
  .trim()
  .min(2, 'Name is too short')
  .max(60, 'Name is too long')
  // letters of any language, plus space . ' -   (Anne-Marie, O'Neil, A. Kumar)
  .regex(/^\p{L}[\p{L} .'-]*$/u, 'Name contains invalid characters');
const emailSchema = z
  .string({ error: 'Email is required' })
  .trim()
  .toLowerCase()
  .pipe(z.email('Invalid email'));

const passwordSchema = z
  .string({ error: 'password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password at most be 72 characters')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/\d/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character')
  .regex(/^\S*$/, 'Password must not contain whitespace'); //fdeeAD443@!

const usernameSchema = z
  .string({ error: 'Username is required' })
  .trim()
  .min(3, 'Username must be at least 3 characters long')
  .max(30, 'Username must be at most 30 characters long')
  .regex(
    /^[a-zA-Z0-9_\.]+$/,
    'Username can only contain alphanumeric characters, underscores, and periods',
  );

const registerSchema = z.object({
  fullname: fullnameSchema,
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
  //   Username can contain alphanumeric characters, underscores, and periods. It must be between 3 and 30 characters long.
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

const updateFullNameSchema = z.object({
  fullname: fullnameSchema,
});

const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: passwordSchema,
});

const updatePreferencesSchema = z
  .object({
    theme: z.enum(['light', 'dark']).optional(),
    sidebarCollapsed: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Provide a preference to update');

export {
  registerSchema,
  loginSchema,
  updateFullNameSchema,
  updatePasswordSchema,
  updatePreferencesSchema,
};
