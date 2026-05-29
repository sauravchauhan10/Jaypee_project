import { z } from 'zod';

export const medicineQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const interactionCheckSchema = z.object({
  medicineIds: z.array(z.string().cuid()).min(2, 'Provide at least two medicines to check interactions'),
});

export type MedicineQueryInput = z.infer<typeof medicineQuerySchema>;
export type InteractionCheckInput = z.infer<typeof interactionCheckSchema>;
