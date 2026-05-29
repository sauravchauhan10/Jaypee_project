// apps/server/src/lib/audit.ts
// Audit log writer — call after every significant server action

import { prisma } from '@prescribeflow/db';
import type { Prisma, AuditAction } from '@prescribeflow/db';

interface WriteAuditParams {
  userId: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Fire-and-forget audit write — never block the response
export const writeAudit = (params: WriteAuditParams): void => {
  prisma.auditLog
    .create({
      data: {
        userId: params.userId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId ?? null,
        metadata: (params.metadata as Prisma.InputJsonValue) ?? null,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      },
    })
    .catch((err: unknown) => {
      // Audit failures must never crash the main flow
      console.error('[AuditLog] Failed to write audit entry:', err);
    });
};

// Extract request metadata for audit context
export const extractRequestMeta = (
  req: { ip?: string; headers: Record<string, string | string[] | undefined> },
): { ipAddress: string; userAgent: string } => ({
  ipAddress: (req.headers['x-forwarded-for'] as string) ?? req.ip ?? 'unknown',
  userAgent: (req.headers['user-agent'] as string) ?? 'unknown',
});
