import { z } from 'zod';
import { medicationTimingEnum } from '../prescriptions/prescription.schema.js';

export const patientQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const updatePatientRecordSchema = z.object({
  allergies: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
  bloodGroup: z.string().optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
});

export const logAdherenceSchema = z.object({
  prescriptionMedicineId: z.string().cuid('Invalid medicine ID'),
  date: z.string().date('Invalid date format (YYYY-MM-DD)'),
  timeSlot: medicationTimingEnum,
  taken: z.boolean(),
});

export type PatientQueryInput = z.infer<typeof patientQuerySchema>;
export type UpdatePatientRecordInput = z.infer<typeof updatePatientRecordSchema>;
export type LogAdherenceInput = z.infer<typeof logAdherenceSchema>;
