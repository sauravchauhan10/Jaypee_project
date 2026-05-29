import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  timeRange: z.enum(['7d', '30d', '90d']).default('30d'),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
