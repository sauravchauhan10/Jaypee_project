// src/routes/reminder.routes.js
const express        = require('express');
const { body }       = require('express-validator');
const {
  getReminders, createReminder, updateReminder,
  deleteReminder, toggleReminder, sendTestEmail,
} = require('../controllers/reminder.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const validate       = require('../middleware/validate.middleware');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('patient'));   // Reminders are patient-only

// Validation rules
const createRules = [
  body('medicineName').trim().notEmpty().withMessage('Medicine name is required'),
  body('time')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Time must be in HH:MM 24-hour format'),
  body('daysOfWeek')
    .optional()
    .isArray().withMessage('daysOfWeek must be an array')
    .custom((arr) => arr.every((d) => d >= 0 && d <= 6))
    .withMessage('Day values must be 0–6'),
];

// GET    /api/reminders              — list patient's reminders
router.get('/',              getReminders);

// POST   /api/reminders              — create reminder
router.post('/',             createRules, validate, createReminder);

// PUT    /api/reminders/:id          — full update
router.put('/:id',           updateReminder);

// PATCH  /api/reminders/:id/toggle   — toggle isActive
router.patch('/:id/toggle',  toggleReminder);

// POST   /api/reminders/:id/test     — send test email now
router.post('/:id/test',     sendTestEmail);

// DELETE /api/reminders/:id          — delete
router.delete('/:id',        deleteReminder);

module.exports = router;
