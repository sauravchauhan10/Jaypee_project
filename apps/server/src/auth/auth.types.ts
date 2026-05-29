// apps/server/src/auth/auth.types.ts
// Auth-specific response types (separate from shared @prescribeflow/types)

import type { Role } from '@prescribeflow/db';

export interface AuthUserResponse {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone: string | null;
  avatarUrl: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until access token expires
}

export interface AuthResponse {
  user: AuthUserResponse;
  tokens: TokenPair;
}
