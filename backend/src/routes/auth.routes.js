// src/routes/auth.routes.js
const express  = require('express');
const { body } = require('express-validator');

const { register, login, getMe, changePassword, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate       = require('../middleware/validate.middleware');

const router = express.Router();

// ─── Validation Rules ──────────────────────────────────────────────────────────
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['doctor', 'patient']).withMessage('Role must be "doctor" or "patient"'),

  body('age')
    .optional()
    .isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other']).withMessage('Gender must be "male", "female", or "other"'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

const forgotPasswordRules = [
  body('email').isEmail().withMessage('Please provide a valid email'),
];

const resetPasswordRules = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

// ─── Routes ────────────────────────────────────────────────────────────────────
// POST /api/auth/register
router.post('/register', registerRules, validate, register);

// POST /api/auth/login
router.post('/login', loginRules, validate, login);

// GET /api/auth/me  (protected)
router.get('/me', authMiddleware, getMe);

// PUT /api/auth/change-password (protected)
router.put('/change-password', authMiddleware, changePasswordRules, validate, changePassword);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPasswordRules, validate, forgotPassword);

// PUT /api/auth/reset-password
router.put('/reset-password', resetPasswordRules, validate, resetPassword);

module.exports = router;
