import type { Request, Response, NextFunction } from 'express';

import { writeAudit, extractRequestMeta } from '../lib/audit.js';
import { sendSuccess } from '../lib/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

import {
  medicineQuerySchema,
  interactionCheckSchema,
} from './medicine.schema.js';
import * as medicineService from './medicine.service.js';

// ── GET /api/medicines ────────────────────────────────────────
export const getMedicinesHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const query = medicineQuerySchema.parse(req.query);
    const userId = req.user!.id;
    const { ipAddress, userAgent } = extractRequestMeta(req);

    const result = await medicineService.search(query);

    if (query.search) {
      writeAudit({
        userId,
        action: 'MEDICINE_SEARCHED',
        resourceType: 'MedicineCatalog',
        metadata: { query: query.search },
        ipAddress,
        userAgent,
      });
    }

    sendSuccess(res, result);
  },
);

// ── GET /api/medicines/:id ────────────────────────────────────
export const getMedicineByIdHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params as { id: string };

    const medicine = await medicineService.findById(id);

    sendSuccess(res, medicine);
  },
);

// ── POST /api/medicines/interactions ──────────────────────────
export const checkInteractionsHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const input = interactionCheckSchema.parse(req.body);

    const result = await medicineService.checkInteractions(input);

    sendSuccess(res, result);
  },
);
