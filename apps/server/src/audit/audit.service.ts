import { prisma } from '@prescribeflow/db';
import type { Prisma } from '@prescribeflow/db';
import type { AuditQueryInput } from './audit.schema.js';

export const findLogs = async (query: AuditQueryInput) => {
  const { page, limit, action, userId, resourceType, resourceId, startDate, endDate } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.AuditLogWhereInput = {};

  if (action) where.action = action as import('@prescribeflow/db').AuditAction;
  if (userId) where.userId = userId;
  if (resourceType) where.resourceType = resourceType;
  if (resourceId) where.resourceId = resourceId;
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, role: true },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
