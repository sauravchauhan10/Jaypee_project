import type { Request, Response, NextFunction } from 'express';

import { writeAudit, extractRequestMeta } from '../lib/audit.js';
import { sendSuccess } from '../lib/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

import {
  patientQuerySchema,
  updatePatientRecordSchema,
  logAdherenceSchema,
} from './patient.schema.js';
import * as patientService from './patient.service.js';

// ── GET /api/patients ─────────────────────────────────────────
export const getPatientsHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const query = patientQuerySchema.parse(req.query);

    const result = await patientService.findAll(query);

    sendSuccess(res, result);
  },
);

// ── GET /api/patients/:id/history ──────────────────────────────
export const getPatientHistoryHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params as { id: string };
    const requestorId = req.user!.id;
    const requestorRole = req.user!.role;

    const history = await patientService.getHistory(id, requestorId, requestorRole);

    sendSuccess(res, history);
  },
);

// ── PUT /api/patients/:id/records ──────────────────────────────
export const updatePatientRecordsHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params as { id: string };
    const input = updatePatientRecordSchema.parse(req.body);
    const doctorId = req.user!.id;
    const { ipAddress, userAgent } = extractRequestMeta(req);

    const profile = await patientService.updateRecords(id, input);

    writeAudit({
      userId: doctorId,
      action: 'PATIENT_RECORD_UPDATED',
      resourceType: 'PatientProfile',
      resourceId: profile.id,
      metadata: { targetPatientId: id },
      ipAddress,
      userAgent,
    });

    sendSuccess(res, profile);
  },
);

// ── POST /api/patients/adherence ───────────────────────────────
export const logAdherenceHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const input = logAdherenceSchema.parse(req.body);
    const patientId = req.user!.id;

    const log = await patientService.logAdherence(patientId, input);

    sendSuccess(res, log);
  },
);
