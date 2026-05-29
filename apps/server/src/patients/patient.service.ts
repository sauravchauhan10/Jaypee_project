import { prisma } from '@prescribeflow/db';
import type { Prisma } from '@prescribeflow/db';

import { ApiError } from '../lib/apiError.js';
import type {
  PatientQueryInput,
  UpdatePatientRecordInput,
  LogAdherenceInput,
} from './patient.schema.js';

// ── Find All Patients (Doctor/Admin) ─────────────────────────
export const findAll = async (query: PatientQueryInput) => {
  const { page, limit, search } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {
    role: 'PATIENT',
    deletedAt: null,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        patientProfile: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ── Get Patient Medical History ──────────────────────────────
export const getHistory = async (patientId: string, requestorId: string, requestorRole: string) => {
  // Authorization check — patient can only see their own, doctor/admin can see any
  if (requestorRole === 'PATIENT' && requestorId !== patientId) {
    throw ApiError.forbidden('You do not have permission to view this history');
  }

  const patient = await prisma.user.findFirst({
    where: { id: patientId, role: 'PATIENT', deletedAt: null },
    select: {
      id: true,
      name: true,
      patientProfile: true,
      medicalHistories: {
        where: { deletedAt: null },
        orderBy: { recordDate: 'desc' },
      },
      prescriptionsReceived: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: {
          medicines: {
            include: {
              adherenceLogs: {
                orderBy: { date: 'desc' },
                take: 14, // Last 14 logs per medicine
              },
            },
          },
          doctor: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!patient) {
    throw ApiError.notFound('Patient not found');
  }

  return patient;
};

// ── Update Patient Records ───────────────────────────────────
export const updateRecords = async (patientId: string, input: UpdatePatientRecordInput) => {
  const profile = await prisma.patientProfile.findUnique({
    where: { userId: patientId },
  });

  if (!profile) {
    throw ApiError.notFound('Patient profile not found');
  }

  const updated = await prisma.patientProfile.update({
    where: { userId: patientId },
    data: {
      allergies: input.allergies,
      conditions: input.conditions,
      bloodGroup: input.bloodGroup,
      height: input.height,
      weight: input.weight,
    },
  });

  return updated;
};

// ── Log Adherence ────────────────────────────────────────────
export const logAdherence = async (patientId: string, input: LogAdherenceInput) => {
  const medicine = await prisma.prescriptionMedicine.findUnique({
    where: { id: input.prescriptionMedicineId },
    include: {
      prescription: true,
    },
  });

  if (!medicine) {
    throw ApiError.notFound('Prescription medicine not found');
  }

  if (medicine.prescription.patientId !== patientId) {
    throw ApiError.forbidden('This medicine does not belong to your prescription');
  }

  // Create or update adherence log using upsert
  const dateStr = new Date(input.date);
  
  const log = await prisma.adherenceLog.upsert({
    where: {
      prescriptionMedicineId_date_timeSlot: {
        prescriptionMedicineId: input.prescriptionMedicineId,
        date: dateStr,
        timeSlot: input.timeSlot,
      },
    },
    update: {
      taken: input.taken,
      takenAt: input.taken ? new Date() : null,
    },
    create: {
      prescriptionMedicineId: input.prescriptionMedicineId,
      patientId,
      date: dateStr,
      timeSlot: input.timeSlot,
      taken: input.taken,
      takenAt: input.taken ? new Date() : null,
    },
  });

  return log;
};
