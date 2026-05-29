import { Router } from 'express';

import { authenticate, requireRole } from '../middleware/authenticate.js';
import {
  getPatientsHandler,
  getPatientHistoryHandler,
  updatePatientRecordsHandler,
  logAdherenceHandler,
} from './patient.controller.js';

const router: import('express').Router = Router();

router.use(authenticate);

// Doctor & Admin routes
router.get('/', requireRole(['DOCTOR', 'ADMIN']), getPatientsHandler);
router.put('/:id/records', requireRole(['DOCTOR', 'ADMIN']), updatePatientRecordsHandler);

// Shared route (authorization is handled inside the service)
router.get('/:id/history', getPatientHistoryHandler);

// Patient route
router.post('/adherence', requireRole(['PATIENT']), logAdherenceHandler);

export { router as patientRouter };
