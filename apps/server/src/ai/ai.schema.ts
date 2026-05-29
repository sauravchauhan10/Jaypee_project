import { z } from 'zod';

export const aiQuerySchema = z.object({
  query: z.string().min(1, "Please provide a question or topic").max(500, "Query is too long"),
});

export type AiQueryInput = z.infer<typeof aiQuerySchema>;
