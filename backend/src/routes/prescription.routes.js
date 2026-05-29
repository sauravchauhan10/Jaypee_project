// src/routes/prescription.routes.js
const express  = require('express');
const { body } = require('express-validator');

const {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
  getPatientPrescriptions,
} = require('../controllers/prescription.controller');

const {
  downloadPrescriptionPDF,
  viewPrescriptionPDF,
} = require('../controllers/pdf.controller');

const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const validate       = require('../middleware/validate.middleware');

const router = express.Router();

// All prescription routes require authentication
router.use(authMiddleware);


// ─── Validation rules ──────────────────────────────────────────────────────────
const medicineRules = [
  body('medicines')
    .isArray({ min: 1 }).withMessage('At least one medicine is required'),
  body('medicines.*.name')
    .trim().notEmpty().withMessage('Medicine name is required'),
  body('medicines.*.dosage')
    .trim().notEmpty().withMessage('Medicine dosage is required'),
  body('medicines.*.frequency')
    .trim().notEmpty().withMessage('Medicine frequency is required'),
  body('medicines.*.duration')
    .trim().notEmpty().withMessage('Medicine duration is required'),
];

const createRules = [
  body('diagnosis')
    .trim().notEmpty().withMessage('Diagnosis is required')
    .isLength({ max: 500 }).withMessage('Diagnosis max 500 characters'),
  body('notes')
    .optional().isLength({ max: 1000 }).withMessage('Notes max 1000 characters'),
  body('date')
    .optional().isISO8601().withMessage('Invalid date format'),
  ...medicineRules,
];

const updateRules = [
  body('diagnosis')
    .optional().trim().isLength({ max: 500 }).withMessage('Diagnosis max 500 characters'),
  body('status')
    .optional().isIn(['active', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('notes')
    .optional().isLength({ max: 1000 }).withMessage('Notes max 1000 characters'),
  body('medicines')
    .optional().isArray({ min: 1 }).withMessage('At least one medicine required'),
  body('medicines.*.name')
    .if(body('medicines').exists())
    .trim().notEmpty().withMessage('Medicine name is required'),
  body('medicines.*.dosage')
    .if(body('medicines').exists())
    .trim().notEmpty().withMessage('Medicine dosage is required'),
  body('medicines.*.frequency')
    .if(body('medicines').exists())
    .trim().notEmpty().withMessage('Medicine frequency is required'),
  body('medicines.*.duration')
    .if(body('medicines').exists())
    .trim().notEmpty().withMessage('Medicine duration is required'),
];

// ─── Routes ────────────────────────────────────────────────────────────────────

// POST   /api/prescriptions          — Create (doctor only)
router.post('/', roleMiddleware('doctor'), createRules, validate, createPrescription);

// GET    /api/prescriptions          — List (doctor: own · patient: own)
router.get('/', getAllPrescriptions);

// ── PDF routes — must come BEFORE /:id to avoid wildcard conflicts ────────────
// GET    /api/prescriptions/:id/pdf       — Download as attachment
router.get('/:id/pdf', downloadPrescriptionPDF);

// GET    /api/prescriptions/:id/pdf/view  — View inline in browser
router.get('/:id/pdf/view', viewPrescriptionPDF);

// GET    /api/prescriptions/patient/:patientId — Patient's prescriptions (doctor)
router.get('/patient/:patientId', roleMiddleware('doctor'), getPatientPrescriptions);

// GET    /api/prescriptions/:id      — Get one (doctor or patient owner)
router.get('/:id', getPrescriptionById);

// PUT    /api/prescriptions/:id      — Update (doctor creator only)
router.put('/:id', roleMiddleware('doctor'), updateRules, validate, updatePrescription);

// DELETE /api/prescriptions/:id      — Delete (doctor creator only)
router.delete('/:id', roleMiddleware('doctor'), deletePrescription);

module.exports = router;

