import type { Request, Response, NextFunction } from 'express';

import { writeAudit, extractRequestMeta } from '../lib/audit.js';
import { generateSignedPdfUrl } from '../lib/cloudinary.js';
import { sendSuccess } from '../lib/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

import {
  createPrescriptionSchema,
  updatePrescriptionSchema,
  prescriptionQuerySchema,
} from './prescription.schema.js';
import * as prescriptionService from './prescription.service.js';

// ── GET /api/prescriptions ─────────────────────────────────────
export const getPrescriptionsHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const query = prescriptionQuerySchema.parse(req.query);
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await prescriptionService.findAll(userId, userRole, query);

    sendSuccess(res, result);
  },
);

// ── POST /api/prescriptions ────────────────────────────────────
export const createPrescriptionHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const input = createPrescriptionSchema.parse(req.body);
    const doctorId = req.user!.id;
    const { ipAddress, userAgent } = extractRequestMeta(req);

    const prescription = await prescriptionService.create(doctorId, input);

    writeAudit({
      userId: doctorId,
      action: 'PRESCRIPTION_CREATED',
      resourceType: 'Prescription',
      resourceId: prescription.id,
      metadata: { patientId: input.patientId, medicineCount: input.medicines.length },
      ipAddress,
      userAgent,
    });

    sendSuccess(res, prescription, 201);
  },
);

// ── GET /api/prescriptions/:id ─────────────────────────────────
export const getPrescriptionByIdHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params as { id: string };
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { ipAddress, userAgent } = extractRequestMeta(req);

    const prescription = await prescriptionService.findById(id, userId, userRole);

    writeAudit({
      userId,
      action: 'PRESCRIPTION_VIEWED',
      resourceType: 'Prescription',
      resourceId: id,
      ipAddress,
      userAgent,
    });

    sendSuccess(res, prescription);
  },
);

// ── PUT /api/prescriptions/:id ─────────────────────────────────
export const updatePrescriptionHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params as { id: string };
    const input = updatePrescriptionSchema.parse(req.body);
    const doctorId = req.user!.id;
    const { ipAddress, userAgent } = extractRequestMeta(req);

    const prescription = await prescriptionService.update(id, doctorId, input);

    writeAudit({
      userId: doctorId,
      action: 'PRESCRIPTION_UPDATED',
      resourceType: 'Prescription',
      resourceId: id,
      metadata: { status: prescription.status },
      ipAddress,
      userAgent,
    });

    sendSuccess(res, prescription);
  },
);

// ── DELETE /api/prescriptions/:id ──────────────────────────────
export const cancelPrescriptionHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params as { id: string };
    const doctorId = req.user!.id;
    const { ipAddress, userAgent } = extractRequestMeta(req);

    const prescription = await prescriptionService.cancel(id, doctorId);

    writeAudit({
      userId: doctorId,
      action: 'PRESCRIPTION_CANCELLED',
      resourceType: 'Prescription',
      resourceId: id,
      ipAddress,
      userAgent,
    });

    sendSuccess(res, prescription);
  },
);

// ── GET /api/prescriptions/verify/:qrToken ─────────────────────
// Public endpoint for QR code scans
export const verifyPrescriptionHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { qrToken } = req.params as { qrToken: string };

    const prescription = await prescriptionService.findByQrToken(qrToken);

    sendSuccess(res, prescription);
  },
);

// ── GET /api/prescriptions/:id/pdf-url ────────────────────────
export const getPdfUrl = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    // We can reuse findById which does auth checks
    const prescription = await prescriptionService.findById(
      id as string,
      req.user!.id,
      req.user!.role,
    );

    if (prescription.pdfUrl) {
      // Generate a fresh 1-hour signed URL based on the known public_id structure
      const publicId = `prescriptions/rx_${id}.pdf`;
      const signedUrl = generateSignedPdfUrl(publicId);
      sendSuccess(res, { status: 'READY', url: signedUrl });
    } else {
      sendSuccess(res, { status: 'PENDING' });
    }
  }
);
