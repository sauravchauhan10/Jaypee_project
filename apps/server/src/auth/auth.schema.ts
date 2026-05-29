// apps/server/src/auth/auth.schema.ts
// Zod validation schemas for all auth endpoints

import { z } from 'zod';

// ── Register ──────────────────────────────────────────────────
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name too short').max(100, 'Name too long').trim(),
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum(['DOCTOR', 'PATIENT'], {
      errorMap: () => ({ message: 'Role must be DOCTOR or PATIENT' }),
    }),
    phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number').optional(),

    // Doctor fields (required when role === DOCTOR)
    specialty: z.string().min(2).max(100).trim().optional(),
    licenseNumber: z.string().min(3).max(50).trim().optional(),
    clinicName: z.string().max(150).trim().optional(),
    clinicAddress: z.string().max(300).trim().optional(),

    // Patient fields (required when role === PATIENT)
    dob: z.string().date('Invalid date — use YYYY-MM-DD').optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
    bloodGroup: z
      .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Confirm passwords match
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }

    // Doctor role requires specialty and license
    if (data.role === 'DOCTOR') {
      if (!data.specialty) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['specialty'],
          message: 'Specialty is required for doctors',
        });
      }
      if (!data.licenseNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['licenseNumber'],
          message: 'License number is required for doctors',
        });
      }
    }

    // Patient role requires DOB
    if (data.role === 'PATIENT') {
      if (!data.dob) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dob'],
          message: 'Date of birth is required for patients',
        });
      }
    }
  });

// ── Login ─────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['DOCTOR', 'PATIENT', 'ADMIN'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
});

// ── Refresh token ──────────────────────────────────────────────
export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ── Inferred types ────────────────────────────────────────────
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
