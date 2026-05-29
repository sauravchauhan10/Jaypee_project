import { z } from 'zod';

export const medicationTimingEnum = z.enum([
  'MORNING',
  'AFTERNOON',
  'EVENING',
  'NIGHT',
  'AS_NEEDED',
]);

export const prescriptionStatusEnum = z.enum([
  'DRAFT',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED',
]);

export const prescriptionMedicineSchema = z.object({
  medicineId: z.string().cuid('Invalid medicine ID').optional(),
  name: z.string().min(1, 'Medicine name is required').trim(),
  dosage: z.string().min(1, 'Dosage is required').trim(),
  frequency: z.string().min(1, 'Frequency is required').trim(),
  timing: medicationTimingEnum,
  duration: z.string().min(1, 'Duration is required').trim(),
  instructions: z.string().trim().optional(),
  quantity: z.number().int().positive().optional(),
});

export const createPrescriptionSchema = z.object({
  patientId: z.string().cuid('Invalid patient ID'),
  diagnosis: z.string().min(2, 'Diagnosis must be at least 2 characters').trim(),
  symptoms: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  status: z.enum(['DRAFT', 'ACTIVE']).default('DRAFT'),
  expiresAt: z.string().datetime().optional(),
  medicines: z.array(prescriptionMedicineSchema).min(1, 'At least one medicine is required'),
});

export const updatePrescriptionSchema = createPrescriptionSchema.partial().extend({
  status: prescriptionStatusEnum.optional(),
});

// Query params for GET /api/prescriptions
export const prescriptionQuerySchema = z.object({
  status: prescriptionStatusEnum.optional(),
  patientId: z.string().cuid().optional(),
  doctorId: z.string().cuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>;
export type UpdatePrescriptionInput = z.infer<typeof updatePrescriptionSchema>;
export type PrescriptionQueryInput = z.infer<typeof prescriptionQuerySchema>;
