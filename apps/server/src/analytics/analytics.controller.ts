import type { Request, Response, NextFunction } from 'express';

import { sendSuccess } from '../lib/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

import { analyticsQuerySchema } from './analytics.schema.js';
import * as analyticsService from './analytics.service.js';

// ── GET /api/analytics/doctor ─────────────────────────────────
export const getDoctorDashboardHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const query = analyticsQuerySchema.parse(req.query);
    const doctorId = req.user!.id;

    const data = await analyticsService.getDoctorDashboardMetrics(doctorId, query);

    sendSuccess(res, data);
  },
);
