// ============================================================
// Shared Enums & Constants
// ============================================================

export type Role = 'DOCTOR' | 'PATIENT' | 'ADMIN';

export type PrescriptionStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type MedicationTiming = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'AS_NEEDED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export type NotificationType =
  | 'PRESCRIPTION_CREATED'
  | 'PRESCRIPTION_UPDATED'
  | 'PRESCRIPTION_CANCELLED'
  | 'MEDICATION_REMINDER'
  | 'APPOINTMENT_REMINDER'
  | 'SYSTEM';

export type AuditAction =
  | 'USER_REGISTERED'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'PRESCRIPTION_CREATED'
  | 'PRESCRIPTION_UPDATED'
  | 'PRESCRIPTION_CANCELLED'
  | 'PRESCRIPTION_DOWNLOADED'
  | 'PATIENT_RECORD_UPDATED'
  | 'MEDICINE_SEARCHED'
  | 'USER_DEACTIVATED';

// ============================================================
// Core Entity Types
// ============================================================

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: Role;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  doctorProfile?: DoctorProfile | null;
  patientProfile?: PatientProfile | null;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  specialty: string;
  licenseNumber: string;
  clinicName?: string | null;
  clinicAddress?: string | null;
  signatureUrl?: string | null;
}

export interface PatientProfile {
  id: string;
  userId: string;
  dob: Date;
  gender: Gender;
  bloodGroup?: string | null;
  allergies: string[];
  conditions: string[];
}

// ============================================================
// Prescription Types
// ============================================================

export interface Prescription extends BaseEntity {
  doctorId: string;
  patientId: string;
  diagnosis: string;
  symptoms?: string | null;
  notes?: string | null;
  status: PrescriptionStatus;
  pdfUrl?: string | null;
  qrToken: string;
  date: Date;
  expiresAt?: Date | null;
  medications: Medication[];
  doctor?: User;
  patient?: User;
}

export interface Medication {
  id: string;
  prescriptionId: string;
  medicineId?: string | null;
  name: string;
  dosage: string;
  frequency: string;
  timing: MedicationTiming;
  duration: string;
  instructions?: string | null;
}

// ============================================================
// Medicine Catalog Types
// ============================================================

export interface Medicine extends BaseEntity {
  name: string;
  genericName?: string | null;
  category: string;
  defaultDosage?: string | null;
  defaultFrequency?: string | null;
  commonInteractions: string[];
  sideEffects?: string | null;
}

// ============================================================
// Medical History
// ============================================================

export interface MedicalHistory extends BaseEntity {
  patientId: string;
  doctorId?: string | null;
  title: string;
  description: string;
  recordDate: Date;
  attachmentUrl?: string | null;
}

// ============================================================
// Audit & Notification
// ============================================================

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

export interface Notification extends BaseEntity {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// ============================================================
// Auth Types
// ============================================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;    // userId
  role: Role;
  email: string;
  iat: number;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: Role;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  // Doctor fields
  specialty?: string;
  licenseNumber?: string;
  clinicName?: string;
  // Patient fields
  dob?: string;
  gender?: Gender;
  bloodGroup?: string;
}

export interface AuthResponse {
  user: Omit<User, 'doctorProfile' | 'patientProfile'>;
  tokens: AuthTokens;
}

// ============================================================
// Re-exports
// ============================================================
export * from './pagination';
