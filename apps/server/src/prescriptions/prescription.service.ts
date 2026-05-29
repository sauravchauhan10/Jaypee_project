import { prisma } from '@prescribeflow/db';
import type { Prisma } from '@prescribeflow/db';

import { ApiError } from '../lib/apiError.js';
import { generatePrescriptionPdf } from '../lib/pdf.js';
import { uploadPdfBuffer } from '../lib/cloudinary.js';
import * as notificationService from '../notifications/notification.service.js';
import type {
  CreatePrescriptionInput,
  UpdatePrescriptionInput,
  PrescriptionQueryInput,
} from './prescription.schema.js';

// ── Create ────────────────────────────────────────────────────
export const create = async (
  doctorId: string,
  input: CreatePrescriptionInput,
) => {
  // Ensure patient exists
  const patient = await prisma.user.findFirst({
    where: { id: input.patientId, role: 'PATIENT', deletedAt: null },
  });

  if (!patient) {
    throw ApiError.notFound('Patient not found');
  }

  // Create prescription and medicines in a transaction
  const prescription = await prisma.prescription.create({
    data: {
      doctorId,
      patientId: input.patientId,
      diagnosis: input.diagnosis,
      symptoms: input.symptoms,
      notes: input.notes,
      status: input.status,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      medicines: {
        create: input.medicines.map((med) => ({
          medicineId: med.medicineId,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          timing: med.timing,
          duration: med.duration,
          instructions: med.instructions,
          quantity: med.quantity,
        })),
      },
    },
    include: {
      medicines: true,
      patient: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      doctor: {
        select: {
          name: true,
          doctorProfile: {
            select: {
              specialty: true,
              clinicName: true,
            },
          },
        },
      },
    },
  });

  // Trigger PDF Generation Asynchronously
  generateAndUploadPdf(prescription.id).catch((err) => {
    console.error(`Failed to generate PDF for Prescription ${prescription.id}:`, err);
  });

  // Notify Patient immediately that a prescription was issued
  await notificationService.createNotification({
    userId: prescription.patientId,
    type: 'PRESCRIPTION_CREATED',
    title: 'New Prescription Issued',
    message: `Dr. ${prescription.doctor.name} has issued a new prescription for you.`,
    metadata: { prescriptionId: prescription.id },
  });

  // Schedule Reminders (Simulated scheduling infrastructure)
  // For each medicine, we create a reminder notification. In a real system, 
  // this would be dispatched to a message queue or cron job (like Redis BullMQ) to fire later.
  // For demonstration, we just emit a system alert.
  await notificationService.createNotification({
    userId: prescription.patientId,
    type: 'SYSTEM',
    title: 'Medication Reminders Active',
    message: `We have set up reminders for your ${prescription.medicines.length} medications.`,
    metadata: { prescriptionId: prescription.id },
  });

  return prescription;
};

// ── Async PDF Generator Worker ────────────────────────────────
const generateAndUploadPdf = async (prescriptionId: string) => {
  const p = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    include: {
      medicines: true,
      patient: { select: { name: true, patientProfile: true } },
      doctor: { select: { name: true, doctorProfile: true } },
    },
  });

  if (!p) return;

  const pdfBuffer = await generatePrescriptionPdf({
    prescriptionId: p.id,
    qrToken: p.qrToken,
    date: p.date,
    diagnosis: p.diagnosis,
    symptoms: p.symptoms,
    notes: p.notes,
    doctor: {
      name: p.doctor.name,
      specialty: p.doctor.doctorProfile?.specialty,
      clinicName: p.doctor.doctorProfile?.clinicName || undefined,
      licenseNumber: p.doctor.doctorProfile?.licenseNumber,
    },
    patient: {
      name: p.patient.name,
      // For a real app, calculate age from p.patient.patientProfile.dob
      gender: p.patient.patientProfile?.gender,
    },
    medicines: p.medicines.map((m) => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      instructions: m.instructions,
    })),
  });

  const pdfUrl = await uploadPdfBuffer(pdfBuffer, `rx_${p.id}`);

  // Save the URL back to the prescription
  await prisma.prescription.update({
    where: { id: p.id },
    data: { pdfUrl },
  });

  // Notify Patient that PDF is ready
  await notificationService.createNotification({
    userId: p.patientId,
    type: 'SYSTEM',
    title: 'Prescription PDF Ready',
    message: 'Your official digital prescription document is now available for download.',
    metadata: { prescriptionId: p.id, pdfUrl },
  });
};

// ── Find All ──────────────────────────────────────────────────
export const findAll = async (
  userId: string,
  userRole: string,
  query: PrescriptionQueryInput,
) => {
  const { 
    page, limit, status, patientId, doctorId,
    search, startDate, endDate, medicineName,
    sortBy = 'createdAt', sortOrder = 'desc' 
  } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.PrescriptionWhereInput = {
    deletedAt: null,
  };

  if (userRole === 'DOCTOR') {
    where.doctorId = userId;
    if (patientId) where.patientId = patientId;
  } else if (userRole === 'PATIENT') {
    where.patientId = userId;
    if (doctorId) where.doctorId = doctorId;
  } else if (userRole === 'ADMIN') {
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { diagnosis: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
      { patient: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  if (medicineName) {
    where.medicines = {
      some: {
        name: { contains: medicineName, mode: 'insensitive' },
      },
    };
  }

  // Map sort fields safely
  let orderBy: Prisma.PrescriptionOrderByWithRelationInput = { createdAt: sortOrder };
  if (sortBy === 'updatedAt') orderBy = { updatedAt: sortOrder };
  else if (sortBy === 'status') orderBy = { status: sortOrder };
  else if (sortBy === 'patientName') orderBy = { patient: { name: sortOrder } };

  const [data, total] = await Promise.all([
    prisma.prescription.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        medicines: true,
        patient: { select: { id: true, name: true } },
        doctor: { select: { id: true, name: true } },
      },
    }),
    prisma.prescription.count({ where }),
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

// ── Find By Id ────────────────────────────────────────────────
export const findById = async (id: string, userId: string, userRole: string) => {
  const prescription = await prisma.prescription.findUnique({
    where: { id, deletedAt: null },
    include: {
      medicines: true,
      patient: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          patientProfile: true,
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          doctorProfile: true,
        },
      },
    },
  });

  if (!prescription) {
    throw ApiError.notFound('Prescription not found');
  }

  // Authorization check
  if (
    userRole !== 'ADMIN' &&
    prescription.doctorId !== userId &&
    prescription.patientId !== userId
  ) {
    throw ApiError.forbidden('You do not have permission to view this prescription');
  }

  return prescription;
};

// ── Update ────────────────────────────────────────────────────
export const update = async (
  id: string,
  doctorId: string,
  input: UpdatePrescriptionInput,
) => {
  const prescription = await prisma.prescription.findUnique({
    where: { id, deletedAt: null },
  });

  if (!prescription) {
    throw ApiError.notFound('Prescription not found');
  }

  if (prescription.doctorId !== doctorId) {
    throw ApiError.forbidden('You do not have permission to update this prescription');
  }

  // Allow updates only if it's DRAFT or created within the last 24 hours
  const hoursSinceCreation = (new Date().getTime() - prescription.createdAt.getTime()) / (1000 * 60 * 60);
  if (prescription.status !== 'DRAFT' && hoursSinceCreation > 24) {
    throw ApiError.badRequest('Cannot update an active prescription after 24 hours');
  }

  const updated = await prisma.$transaction(async (tx) => {
    // If medicines are provided, we replace the existing ones completely.
    // For a real app, you might want to diff them to preserve IDs for adherence logs.
    if (input.medicines) {
      await tx.prescriptionMedicine.deleteMany({
        where: { prescriptionId: id },
      });
    }

    return tx.prescription.update({
      where: { id },
      data: {
        diagnosis: input.diagnosis,
        symptoms: input.symptoms,
        notes: input.notes,
        status: input.status,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        ...(input.medicines && {
          medicines: {
            create: input.medicines.map((med) => ({
              medicineId: med.medicineId,
              name: med.name,
              dosage: med.dosage,
              frequency: med.frequency,
              timing: med.timing,
              duration: med.duration,
              instructions: med.instructions,
              quantity: med.quantity,
            })),
          },
        }),
      },
      include: {
        medicines: true,
      },
    });
  });

  return updated;
};

// ── Cancel ────────────────────────────────────────────────────
export const cancel = async (id: string, doctorId: string) => {
  const prescription = await prisma.prescription.findUnique({
    where: { id, deletedAt: null },
  });

  if (!prescription) {
    throw ApiError.notFound('Prescription not found');
  }

  if (prescription.doctorId !== doctorId) {
    throw ApiError.forbidden('You do not have permission to cancel this prescription');
  }

  const updated = await prisma.prescription.update({
    where: { id },
    data: {
      status: 'CANCELLED',
    },
  });

  return updated;
};

// ── Find By QR Token ──────────────────────────────────────────
export const findByQrToken = async (qrToken: string) => {
  const prescription = await prisma.prescription.findUnique({
    where: { qrToken, deletedAt: null },
    include: {
      medicines: true,
      patient: {
        select: {
          name: true, // Only exposing name for public verification
        },
      },
      doctor: {
        select: {
          name: true,
          doctorProfile: {
            select: {
              specialty: true,
              clinicName: true,
              licenseNumber: true,
            },
          },
        },
      },
    },
  });

  if (!prescription) {
    throw ApiError.notFound('Prescription not found');
  }

  return prescription;
};
