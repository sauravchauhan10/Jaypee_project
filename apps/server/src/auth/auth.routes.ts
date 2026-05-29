// apps/server/src/auth/auth.routes.ts
// Auth router — wires middleware + handlers to endpoints

import { Router } from 'express';

import { authenticate } from '../middleware/authenticate.js';
import { authRateLimiter, refreshRateLimiter } from '../middleware/rateLimiter.js';

import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  logoutAllHandler,
  getMeHandler,
} from './auth.controller.js';

const router: import('express').Router = Router();

// ── Public routes (rate limited) ──────────────────────────────

/**
 * POST /api/auth/register
 * Body: RegisterInput
 * Response: { user, tokens }
 */
router.post('/register', authRateLimiter, registerHandler);

/**
 * POST /api/auth/login
 * Body: LoginInput
 * Response: { user, tokens }
 */
router.post('/login', authRateLimiter, loginHandler);

/**
 * POST /api/auth/refresh
 * Body: { refreshToken }
 * Response: { tokens }
 */
router.post('/refresh', refreshRateLimiter, refreshHandler);

// ── Protected routes (require valid access token) ─────────────

/**
 * POST /api/auth/logout
 * Headers: Authorization: Bearer <accessToken>
 * Body: { refreshToken }
 * Response: { message }
 */
router.post('/logout', authenticate, logoutHandler);

/**
 * POST /api/auth/logout-all
 * Headers: Authorization: Bearer <accessToken>
 * Response: { message }
 * Revokes ALL active sessions for this user
 */
router.post('/logout-all', authenticate, logoutAllHandler);

/**
 * GET /api/auth/me
 * Headers: Authorization: Bearer <accessToken>
 * Response: { user }
 */
router.get('/me', authenticate, getMeHandler);

export { router as authRouter };
