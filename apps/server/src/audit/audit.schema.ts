import { z } from 'zod';
import { AuditAction } from '@prescribeflow/db';

export const auditQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  action: z.string().optional(),
  userId: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type AuditQueryInput = z.infer<typeof auditQuerySchema>;
