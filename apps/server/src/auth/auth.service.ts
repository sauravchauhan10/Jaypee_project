// apps/server/src/auth/auth.service.ts
// Auth business logic — pure functions, no HTTP concerns
// All DB interaction happens here; controllers call these functions

import crypto from 'node:crypto';

import { prisma } from '@prescribeflow/db';

import { comparePassword, hashPassword } from '../lib/bcrypt.js';
import { ApiError } from '../lib/apiError.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getExpiryDate,
} from '../lib/jwt.js';

import type { RegisterInput, LoginInput } from './auth.schema.js';
import type { AuthResponse, AuthUserResponse, TokenPair } from './auth.types.js';

// ── Helpers ───────────────────────────────────────────────────

// Hash a raw token before storing in DB (never store raw tokens)
const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

// Strip sensitive fields from user for response
const toAuthUserResponse = (user: {
  id: string;
  email: string;
  name: string;
  role: import('@prescribeflow/db').Role;
  phone: string | null;
  avatarUrl: string | null;
}): AuthUserResponse => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  phone: user.phone,
  avatarUrl: user.avatarUrl,
});

// Generate a token pair and persist the refresh token in DB
const generateTokenPair = async (
  user: AuthUserResponse,
  ipAddress?: string,
  userAgent?: string,
): Promise<{ tokens: TokenPair; refreshTokenId: string }> => {
  // Create DB record first (we need its id for the refresh token payload)
  const dbRefreshToken = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: 'pending', // Placeholder — updated below
      expiresAt: getExpiryDate(process.env.JWT_REFRESH_EXPIRY ?? '7d'),
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    },
  });

  // Sign tokens (refresh payload includes DB id for revocation lookup)
  const [accessToken, rawRefreshToken] = await Promise.all([
    signAccessToken({ sub: user.id, role: user.role, email: user.email }),
    signRefreshToken({ sub: user.id, tokenId: dbRefreshToken.id }),
  ]);

  // Update DB record with hashed token (never store raw JWT)
  await prisma.refreshToken.update({
    where: { id: dbRefreshToken.id },
    data: { tokenHash: hashToken(rawRefreshToken) },
  });

  const accessExpirySeconds = (() => {
    const expiry = process.env.JWT_ACCESS_EXPIRY ?? '15m';
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match?.[1] || !match?.[2]) return 900;
    const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return parseInt(match[1], 10) * (units[match[2]] ?? 60);
  })();

  return {
    tokens: {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: accessExpirySeconds,
    },
    refreshTokenId: dbRefreshToken.id,
  };
};

// ── Register ──────────────────────────────────────────────────
export const register = async (
  input: RegisterInput,
  ipAddress?: string,
  userAgent?: string,
): Promise<AuthResponse> => {
  // Check for duplicate email
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);

  // Create user + role-specific profile in a transaction
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
        role: input.role,
        phone: input.phone ?? null,
      },
    });

    if (input.role === 'DOCTOR') {
      await tx.doctorProfile.create({
        data: {
          userId: created.id,
          specialty: input.specialty!,
          licenseNumber: input.licenseNumber!,
          clinicName: input.clinicName ?? null,
          clinicAddress: input.clinicAddress ?? null,
        },
      });
    }

    if (input.role === 'PATIENT') {
      await tx.patientProfile.create({
        data: {
          userId: created.id,
          dob: new Date(input.dob!),
          gender: input.gender ?? 'PREFER_NOT_TO_SAY',
          bloodGroup: input.bloodGroup ?? null,
          allergies: [],
          conditions: [],
        },
      });
    }

    return created;
  });

  const userResponse = toAuthUserResponse(user);
  const { tokens } = await generateTokenPair(userResponse, ipAddress, userAgent);

  return { user: userResponse, tokens };
};

// ── Login ─────────────────────────────────────────────────────
export const login = async (
  input: LoginInput,
  ipAddress?: string,
  userAgent?: string,
): Promise<AuthResponse> => {
  // Find user by email and role (prevents role confusion attacks)
  const user = await prisma.user.findFirst({
    where: {
      email: input.email,
      role: input.role,
      deletedAt: null,
    },
  });

  // Use constant-time comparison even if user not found
  const passwordMatch = user
    ? await comparePassword(input.password, user.passwordHash)
    : await comparePassword(input.password, '$2b$12$invalidhashfortimingprotection00000');

  if (!user || !passwordMatch) {
    // Generic message — don't reveal whether email or password was wrong
    throw ApiError.unauthorized('Invalid email, password, or role');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated. Contact support.');
  }

  // Update last login timestamp (fire-and-forget)
  prisma.user
    .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    .catch(() => null);

  const userResponse = toAuthUserResponse(user);
  const { tokens } = await generateTokenPair(userResponse, ipAddress, userAgent);

  return { user: userResponse, tokens };
};

// ── Refresh token ──────────────────────────────────────────────
export const refresh = async (
  rawRefreshToken: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<{ tokens: TokenPair }> => {
  // 1. Verify JWT signature and expiry
  const payload = await verifyRefreshToken(rawRefreshToken).catch(() => {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  });

  // 2. Look up DB record by tokenId embedded in payload
  const storedToken = await prisma.refreshToken.findUnique({
    where: { id: payload.tokenId },
    include: { user: true },
  });

  if (
    !storedToken ||
    storedToken.revokedAt !== null ||
    storedToken.expiresAt < new Date()
  ) {
    // Token reuse detected — revoke ALL tokens for this user (compromise assumed)
    if (storedToken?.userId) {
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    throw ApiError.unauthorized('Refresh token is invalid or has been revoked');
  }

  // 3. Verify token hash matches (DB integrity check)
  const expectedHash = hashToken(rawRefreshToken);
  if (storedToken.tokenHash !== expectedHash) {
    throw ApiError.unauthorized('Token integrity check failed');
  }

  // 4. Check user is still active
  if (!storedToken.user.isActive || storedToken.user.deletedAt !== null) {
    throw ApiError.forbidden('Account is no longer active');
  }

  // 5. Rotation: revoke old token, issue new pair
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  const userResponse = toAuthUserResponse(storedToken.user);
  const { tokens } = await generateTokenPair(userResponse, ipAddress, userAgent);

  return { tokens };
};

// ── Logout ─────────────────────────────────────────────────────
export const logout = async (
  rawRefreshToken: string,
  userId: string,
): Promise<void> => {
  try {
    const payload = await verifyRefreshToken(rawRefreshToken);

    // Revoke only the specific token for this user
    await prisma.refreshToken.updateMany({
      where: {
        id: payload.tokenId,
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  } catch {
    // Even if token is invalid/expired, silently succeed — logout is idempotent
  }
};

// ── Logout all sessions ────────────────────────────────────────
export const logoutAll = async (userId: string): Promise<void> => {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

// ── Get current user profile ──────────────────────────────────
export const getMe = async (userId: string): Promise<AuthUserResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      avatarUrl: true,
    },
  });

  if (!user) throw ApiError.notFound('User');

  return toAuthUserResponse(user);
};
