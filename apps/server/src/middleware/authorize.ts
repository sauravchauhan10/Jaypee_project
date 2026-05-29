// apps/server/src/middleware/authorize.ts
// Role-based authorization middleware factory
// Usage: router.get('/admin', authenticate, authorize('ADMIN'), handler)
//        router.get('/mixed', authenticate, authorize('DOCTOR', 'ADMIN'), handler)

import type { Request, Response, NextFunction } from 'express';

import type { Role } from '@prescribeflow/db';

import { ApiError } from '../lib/apiError.js';

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // authenticate must run before authorize
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
        ),
      );
    }

    next();
  };
};

// ── Convenience role guards ────────────────────────────────────
export const doctorOnly = authorize('DOCTOR');
export const patientOnly = authorize('PATIENT');
export const adminOnly = authorize('ADMIN');
export const doctorOrAdmin = authorize('DOCTOR', 'ADMIN');
export const allRoles = authorize('DOCTOR', 'PATIENT', 'ADMIN');
