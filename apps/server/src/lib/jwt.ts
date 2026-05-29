// apps/server/src/lib/jwt.ts
// JWT helpers — sign, verify, and rotate access + refresh tokens
// Uses the `jose` library for RSA/HMAC signing (no secret exposure in bundles)

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

import type { Role } from '@prescribeflow/db';

// ── Types ─────────────────────────────────────────────────────
export interface AccessTokenPayload extends JWTPayload {
  sub: string;    // userId
  role: Role;
  email: string;
  type: 'access';
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string;    // userId
  tokenId: string; // RefreshToken.id in DB (for revocation lookup)
  type: 'refresh';
}

// ── Secrets ───────────────────────────────────────────────────
const getSecret = (key: string): Uint8Array => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return new TextEncoder().encode(value);
};

// ── Sign access token (short-lived: 15m) ──────────────────────
export const signAccessToken = async (
  payload: Omit<AccessTokenPayload, 'type' | 'iat' | 'exp'>,
): Promise<string> => {
  const expiry = process.env.JWT_ACCESS_EXPIRY ?? '15m';

  return new SignJWT({ ...payload, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .setIssuer('prescribeflow')
    .setAudience('prescribeflow:api')
    .sign(getSecret('JWT_ACCESS_SECRET'));
};

// ── Sign refresh token (long-lived: 7d) ───────────────────────
export const signRefreshToken = async (
  payload: Omit<RefreshTokenPayload, 'type' | 'iat' | 'exp'>,
): Promise<string> => {
  const expiry = process.env.JWT_REFRESH_EXPIRY ?? '7d';

  return new SignJWT({ ...payload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .setIssuer('prescribeflow')
    .setAudience('prescribeflow:refresh')
    .sign(getSecret('JWT_REFRESH_SECRET'));
};

// ── Verify access token ───────────────────────────────────────
export const verifyAccessToken = async (
  token: string,
): Promise<AccessTokenPayload> => {
  const { payload } = await jwtVerify(token, getSecret('JWT_ACCESS_SECRET'), {
    issuer: 'prescribeflow',
    audience: 'prescribeflow:api',
    algorithms: ['HS256'],
  });

  if (payload['type'] !== 'access') {
    throw new Error('Invalid token type');
  }

  return payload as AccessTokenPayload;
};

// ── Verify refresh token ──────────────────────────────────────
export const verifyRefreshToken = async (
  token: string,
): Promise<RefreshTokenPayload> => {
  const { payload } = await jwtVerify(token, getSecret('JWT_REFRESH_SECRET'), {
    issuer: 'prescribeflow',
    audience: 'prescribeflow:refresh',
    algorithms: ['HS256'],
  });

  if (payload['type'] !== 'refresh') {
    throw new Error('Invalid token type');
  }

  return payload as RefreshTokenPayload;
};

// ── Parse expiry string to Date ───────────────────────────────
export const getExpiryDate = (expiry: string): Date => {
  const units: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match?.[1] || !match?.[2]) throw new Error(`Invalid expiry format: ${expiry}`);
  const amount = parseInt(match[1], 10);
  const unit = units[match[2]] ?? 1000;
  return new Date(Date.now() + amount * unit);
};
