import { Router } from 'express';

import { authenticate, requireRole } from '../middleware/authenticate.js';
import {
  createPrescriptionHandler,
  getPrescriptionsHandler,
  getPrescriptionByIdHandler,
  updatePrescriptionHandler,
  cancelPrescriptionHandler,
  verifyPrescriptionHandler,
  getPdfUrl,
} from './prescription.controller.js';

const router: import('express').Router = Router();

// Public verification route
router.get('/verify/:qrToken', verifyPrescriptionHandler);

// Protected routes
router.use(authenticate);

// Listing and detail
router.get('/', getPrescriptionsHandler);
router.get('/:id', getPrescriptionByIdHandler);

// Doctor-only routes
router.post('/', requireRole(['DOCTOR']), createPrescriptionHandler);
router.put('/:id', requireRole(['DOCTOR']), updatePrescriptionHandler);
router.delete('/:id', requireRole(['DOCTOR']), cancelPrescriptionHandler);

// Poll for PDF URL
router.get('/:id/pdf-url', getPdfUrl);

export { router as prescriptionRouter };
