import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV:             z.enum(['development', 'production', 'test']).default('development'),
  PORT:                 z.string().default('4000'),
  DATABASE_URL:         z.string(),
  REDIS_URL:            z.string(),
  ANTHROPIC_API_KEY:    z.string().optional(),
  OPENAI_API_KEY:       z.string().optional(),
  GOOGLE_API_KEY:       z.string().optional(),
  CORS_ORIGIN:          z.string().default('http://localhost:3000'),
  LOG_BATCH_SIZE:       z.string().default('10'),
  LOG_FLUSH_INTERVAL_MS: z.string().default('2000'),
  PII_REDACTION_ENABLED: z.string().default('true'),
});

export const env = EnvSchema.parse(process.env);