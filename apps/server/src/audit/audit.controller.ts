import type { Request, Response, NextFunction } from 'express';

import { auditQuerySchema } from './audit.schema.js';
import * as auditService from './audit.service.js';
import { sendSuccess } from '../lib/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getAuditLogsHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const query = auditQuerySchema.parse(req.query);
    const logs = await auditService.findLogs(query);
    sendSuccess(res, logs);
  }
);
