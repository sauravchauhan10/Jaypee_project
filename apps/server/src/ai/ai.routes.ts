import { Router } from 'express';

import { authenticate, requireRole } from '../middleware/authenticate.js';
import { patientAssistantHandler } from './ai.controller.js';

const router: import('express').Router = Router();

router.use(authenticate);

// Patient AI assistant route (must be PATIENT role)
router.post('/patient-assistant', requireRole(['PATIENT']), patientAssistantHandler);

export { router as aiRouter };
