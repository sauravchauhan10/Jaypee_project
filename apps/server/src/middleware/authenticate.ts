// apps/server/src/middleware/authenticate.ts
// JWT access token verification middleware
// Reads Bearer token from Authorization header, verifies, attaches user to req

import type { Request, Response, NextFunction } from 'express';

import { ApiError } from '../lib/apiError.js';
import { verifyAccessToken } from '../lib/jwt.js';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('No access token provided'));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next(ApiError.unauthorized('Malformed authorization header'));
    }

    const payload = await verifyAccessToken(token);

    // Attach user to request — available in all downstream handlers
    req.user = {
      id: payload.sub!,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    // Map jose errors to friendly messages
    const message =
      error instanceof Error && error.message.includes('expired')
        ? 'Access token has expired'
        : 'Invalid access token';

    next(ApiError.unauthorized(message));
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
};
