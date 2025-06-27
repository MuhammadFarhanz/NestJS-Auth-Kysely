import { z } from 'zod';

export const envSchema = z.object({
  // App
  PORT: z.coerce.number().default(3000),

  // Database
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().min(1),
  DB_NAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
});

export type EnvConfig = z.infer<typeof envSchema>;
