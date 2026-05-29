import { Router } from 'express';

import { authenticate, requireRole } from '../middleware/authenticate.js';
import { getDoctorDashboardHandler } from './analytics.controller.js';

const router: import('express').Router = Router();

router.use(authenticate);

// Doctor analytics route
router.get('/doctor', requireRole(['DOCTOR']), getDoctorDashboardHandler);

export { router as analyticsRouter };
