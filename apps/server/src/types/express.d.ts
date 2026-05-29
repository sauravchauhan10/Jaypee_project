// apps/server/src/types/express.d.ts
// Augment Express Request to carry authenticated user data

import type { Role } from '@prescribeflow/db';

declare global {
  namespace Express {
    interface Request {
      // Populated by authenticate middleware after JWT verification
      user?: {
        id: string;
        email: string;
        role: Role;
      };
    }
  }
}

export {};
