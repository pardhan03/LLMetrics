import { z } from 'zod';

export const CreateSessionSchema = z.object({
  body: z.object({
    provider: z.enum([
      'anthropic',
      'openai',
      'google',
    ]),

    model: z.string(),

    title: z.string().optional(),

    isStreaming: z.boolean().optional(),
  }),
});

export const UpdateSessionSchema = z.object({
  body: z.object({
    title: z.string().optional(),

    status: z.enum([
      'active',
      'cancelled',
    ]).optional(),
  }),

  params: z.object({
    id: z.string().uuid(),
  }),
});