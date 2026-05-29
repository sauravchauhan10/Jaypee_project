// apps/server/src/middleware/rateLimiter.ts
// In-memory rate limiter using express-rate-limit
// Protects auth endpoints against brute-force attacks

import rateLimit from 'express-rate-limit';

// ── Auth endpoints: strict (5 requests / 15 minutes) ──────────
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many attempts. Please try again after 15 minutes.',
    },
  },
  skip: () => process.env.NODE_ENV === 'test',
});

// ── Refresh endpoint: more lenient (30 requests / 15 minutes) ─
export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many refresh attempts. Please log in again.',
    },
  },
  skip: () => process.env.NODE_ENV === 'test',
});

// ── General API: broad (100 requests / minute) ────────────────
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded.' },
  },
  skip: () => process.env.NODE_ENV === 'test',
});
