import { Router } from 'express';

import { authenticate, requireRole } from '../middleware/authenticate.js';
import {
  getMedicinesHandler,
  getMedicineByIdHandler,
  checkInteractionsHandler,
} from './medicine.controller.js';

const router: import('express').Router = Router();

// All medicine catalog routes are protected
router.use(authenticate);

// List/search medicines (available to all authenticated users)
router.get('/', getMedicinesHandler);

// Single medicine details (available to all authenticated users)
router.get('/:id', getMedicineByIdHandler);

// Check drug interactions (usually only doctors care, but let patients check too if they want)
router.post('/interactions', checkInteractionsHandler);

export { router as medicineRouter };
