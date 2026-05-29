import type { Request, Response, NextFunction } from 'express';

import { aiQuerySchema } from './ai.schema.js';
import * as aiService from './ai.service.js';

// ── POST /api/ai/patient-assistant ─────────────────────────────
export const patientAssistantHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const input = aiQuerySchema.parse(req.body);
    // We intentionally don't use asyncHandler wrapper here because we are streaming directly to `res`
    // and need fine-grained control over the response headers/lifecycle.
    
    await aiService.streamPatientAssistantResponse(input.query, res);
  } catch (error) {
    // If validation fails or before stream starts, pass to express error handler
    next(error);
  }
};
