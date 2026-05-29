// apps/server/src/lib/response.ts
// Standardized API response helpers

import type { Response } from 'express';

import type { ApiMeta } from '@prescribeflow/types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: ApiMeta,
): void => {
  res.status(statusCode).json({
    success: true,
    data,
    error: null,
    ...(meta ? { meta } : {}),
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: Record<string, string[]>,
): void => {
  res.status(statusCode).json({
    success: false,
    data: null,
    error: { code, message, ...(details ? { details } : {}) },
  });
};
