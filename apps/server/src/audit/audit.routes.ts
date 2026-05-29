import { Router } from 'express';

import { authenticate, requireRole } from '../middleware/authenticate.js';
import { getAuditLogsHandler } from './audit.controller.js';

const router: import('express').Router = Router();

router.use(authenticate);

// Strictly limit access to ADMIN role
router.get('/', requireRole(['ADMIN']), getAuditLogsHandler);

export { router as auditRouter };
