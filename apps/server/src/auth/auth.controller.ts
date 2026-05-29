// apps/server/src/auth/auth.controller.ts
// HTTP layer — parse request, call service, return response
// No business logic here; all logic lives in auth.service.ts

import type { Request, Response, NextFunction } from 'express';

import { writeAudit, extractRequestMeta } from '../lib/audit.js';
import { sendSuccess } from '../lib/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

import { registerSchema, loginSchema, refreshSchema } from './auth.schema.js';
import * as authService from './auth.service.js';

// ── POST /api/auth/register ───────────────────────────────────
export const registerHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const input = registerSchema.parse(req.body);
    const { ipAddress, userAgent } = extractRequestMeta(req);

    const result = await authService.register(input, ipAddress, userAgent);

    writeAudit({
      userId: result.user.id,
      action: 'USER_REGISTERED',
      resourceType: 'User',
      resourceId: result.user.id,
      metadata: { role: result.user.role, email: result.user.email },
      ipAddress,
      userAgent,
    });

    sendSuccess(res, result, 201);
  },
);

// ── POST /api/auth/login ──────────────────────────────────────
export const loginHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const input = loginSchema.parse(req.body);
    const { ipAddress, userAgent } = extractRequestMeta(req);

    const result = await authService.login(input, ipAddress, userAgent);

    writeAudit({
      userId: result.user.id,
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: result.user.id,
      metadata: { role: result.user.role },
      ipAddress,
      userAgent,
    });

    sendSuccess(res, result);
  },
);

// ── POST /api/auth/refresh ────────────────────────────────────
export const refreshHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    const { ipAddress, userAgent } = extractRequestMeta(req);

    const result = await authService.refresh(refreshToken, ipAddress, userAgent);

    sendSuccess(res, result);
  },
);

// ── POST /api/auth/logout ─────────────────────────────────────
export const logoutHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    const userId = req.user!.id; // Set by authenticate middleware

    await authService.logout(refreshToken, userId);

    writeAudit({
      userId,
      action: 'USER_LOGOUT',
      resourceType: 'User',
      resourceId: userId,
      ...extractRequestMeta(req),
    });

    sendSuccess(res, { message: 'Logged out successfully' });
  },
);

// ── POST /api/auth/logout-all ─────────────────────────────────
export const logoutAllHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user!.id;

    await authService.logoutAll(userId);

    writeAudit({
      userId,
      action: 'USER_LOGOUT',
      resourceType: 'User',
      resourceId: userId,
      metadata: { logoutAll: true },
      ...extractRequestMeta(req),
    });

    sendSuccess(res, { message: 'All sessions terminated successfully' });
  },
);

// ── GET /api/auth/me ──────────────────────────────────────────
export const getMeHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await authService.getMe(req.user!.id);
    sendSuccess(res, { user });
  },
);
