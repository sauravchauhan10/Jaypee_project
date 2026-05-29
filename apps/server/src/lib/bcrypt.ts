// apps/server/src/lib/bcrypt.ts
// Password hashing helpers — bcrypt with configurable cost factor

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // NIST recommendation for production

// ── Hash a plaintext password ──────────────────────────────────
export const hashPassword = async (plaintext: string): Promise<string> => {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
};

// ── Compare plaintext against stored hash ─────────────────────
export const comparePassword = async (
  plaintext: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(plaintext, hash);
};
