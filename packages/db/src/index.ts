// packages/db/src/index.ts
// Public API of the db package

export { prisma } from './client';
export { Prisma, PrismaClient } from '@prisma/client';
export type {
  User,
  DoctorProfile,
  PatientProfile,
  Prescription,
  PrescriptionMedicine,
  Medicine,
  MedicalHistory,
  AuditLog,
  Notification,
  RefreshToken,
  AdherenceLog,
  Role,
  Gender,
  PrescriptionStatus,
  MedicationTiming,
  NotificationType,
  AuditAction,
} from '@prisma/client';
