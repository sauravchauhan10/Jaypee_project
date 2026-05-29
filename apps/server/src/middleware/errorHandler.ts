// apps/server/src/middleware/errorHandler.ts
// Global error handling middleware — final Express error handler

import type { Request, Response, NextFunction } from 'express';

import { ApiError } from '../lib/apiError.js';
import { sendError } from '../lib/response.js';

// ── Zod-specific error shape ───────────────────────────────────
interface ZodError {
  name: string;
  errors: Array<{ path: (string | number)[]; message: string }>;
}

function isZodError(err: unknown): err is ZodError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    (err as { name: string }).name === 'ZodError'
  );
}

// ── Global error handler ──────────────────────────────────────
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Known operational error
  if (err instanceof ApiError) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  // Zod validation error
  if (isZodError(err)) {
    const details: Record<string, string[]> = {};
    for (const issue of err.errors) {
      const field = issue.path.join('.');
      if (!details[field]) details[field] = [];
      details[field]!.push(issue.message);
    }
    sendError(res, 400, 'VALIDATION_ERROR', 'Validation failed', details);
    return;
  }

  // Prisma known request errors
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as { code: unknown }).code === 'string'
  ) {
    const prismaErr = err as { code: string; meta?: { target?: string[] } };

    if (prismaErr.code === 'P2002') {
      // Unique constraint violation
      const field = prismaErr.meta?.target?.[0] ?? 'field';
      sendError(res, 409, 'CONFLICT', `${field} already exists`);
      return;
    }

    if (prismaErr.code === 'P2025') {
      // Record not found
      sendError(res, 404, 'NOT_FOUND', 'Record not found');
      return;
    }
  }

  // Unknown / unexpected errors — do not leak internals
  const isDev = process.env.NODE_ENV !== 'production';
  const message = isDev && err instanceof Error ? err.message : 'Internal server error';

  console.error('[UnhandledError]', err);
  sendError(res, 500, 'INTERNAL_ERROR', message);
};

// ── Async handler wrapper — eliminates try/catch in every route ─
export const asyncHandler =
  <T>(fn: (req: Request, res: Response, next: NextFunction) => Promise<T>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
