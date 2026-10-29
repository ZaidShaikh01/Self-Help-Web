import 'dotenv/config';
import { z } from 'zod';

const schema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().default(8000),
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),
    ACCESS_TOKEN_SECRET: z.string().min(32, 'must be at least 32 chars'),
    ACCESS_TOKEN_EXPIRY: z
      .string()
      .regex(/^\d+[smhd]$/, 'use e.g. 15m, 12h, 7d')
      .default('15m'),
    REFRESH_TOKEN_SECRET: z.string().min(32, 'must be at least 32 chars'),
    REFRESH_TOKEN_EXPIRY: z
      .string()
      .regex(/^\d+[smhd]$/, 'use e.g. 15m, 12h, 7d')
      .default('7d'),

       // Cloudflare R2 (make these required after Cloudflare setup)
    R2_ACCOUNT_ID: z.string().optional(),
    R2_BUCKET_NAME: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),

    // S3-compatible Object Storage (e.g. RustFS, MinIO, AWS S3)
    OBJECT_STORAGE_ENDPOINT: z.string().optional(),
    OBJECT_STORAGE_REGION: z.string().optional().default('us-east-1'),
    OBJECT_STORAGE_BUCKET: z.string().optional(),
    OBJECT_STORAGE_ACCESS_KEY_ID: z.string().optional(),
    OBJECT_STORAGE_SECRET_ACCESS_KEY: z.string().optional(),
    OBJECT_STORAGE_FORCE_PATH_STYLE: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((val) => val === true || val === 'true' || val === '1'),
    OBJECT_STORAGE_MAX_FILE_BYTES: z.coerce
      .number()
      .optional()
      .default(50 * 1024 * 1024),
    VAPID_PUBLIC_KEY: z.string().min(1).optional(),
    VAPID_PRIVATE_KEY: z.string().min(1).optional(),
    VAPID_SUBJECT: z.string().min(1).optional(),
  })

  .refine((e) => e.ACCESS_TOKEN_SECRET !== e.REFRESH_TOKEN_SECRET, {
    message: 'ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must differ',
    path: ['REFRESH_TOKEN_SECRET'],
  });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
