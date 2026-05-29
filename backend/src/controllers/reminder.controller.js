// src/controllers/reminder.controller.js
const Reminder           = require('../models/Reminder.model');
const asyncHandler       = require('../utils/asyncHandler');
const AppError           = require('../utils/AppError');
const { sendSuccess }    = require('../utils/apiResponse');
const { sendReminderEmail } = require('../services/email.service');

// ─── GET /api/reminders ────────────────────────────────────────────────────────
const getReminders = asyncHandler(async (req, res) => {
  const reminders = await Reminder.find({ patientId: req.user.id })
    .populate('prescriptionId', 'diagnosis date')
    .sort({ createdAt: -1 })
    .lean();

  return sendSuccess(res, 200, 'Reminders fetched', reminders);
});

// ─── POST /api/reminders ───────────────────────────────────────────────────────
const createReminder = asyncHandler(async (req, res) => {
  const { medicineName, dosage, notes, time, daysOfWeek, prescriptionId } = req.body;

  const reminder = await Reminder.create({
    patientId: req.user.id,
    medicineName,
    dosage:    dosage    || '',
    notes:     notes     || '',
    time,
    daysOfWeek: daysOfWeek || [],
    prescriptionId: prescriptionId || null,
    isActive: true,
    status:   'pending',
  });

  return sendSuccess(res, 201, 'Reminder created', reminder);
});

// ─── PUT /api/reminders/:id ────────────────────────────────────────────────────
const updateReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findOne({ _id: req.params.id, patientId: req.user.id });
  if (!reminder) throw new AppError('Reminder not found', 404);

  const { medicineName, dosage, notes, time, daysOfWeek, isActive } = req.body;

  if (medicineName !== undefined) reminder.medicineName = medicineName;
  if (dosage       !== undefined) reminder.dosage       = dosage;
  if (notes        !== undefined) reminder.notes        = notes;
  if (time         !== undefined) reminder.time         = time;
  if (daysOfWeek   !== undefined) reminder.daysOfWeek   = daysOfWeek;
  if (isActive     !== undefined) {
    reminder.isActive = isActive;
    reminder.status   = isActive ? 'pending' : reminder.status;
  }

  await reminder.save();

  return sendSuccess(res, 200, 'Reminder updated', reminder);
});

// ─── DELETE /api/reminders/:id ─────────────────────────────────────────────────
const deleteReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, patientId: req.user.id });
  if (!reminder) throw new AppError('Reminder not found', 404);

  return sendSuccess(res, 200, 'Reminder deleted');
});

// ─── PATCH /api/reminders/:id/toggle ──────────────────────────────────────────
const toggleReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findOne({ _id: req.params.id, patientId: req.user.id });
  if (!reminder) throw new AppError('Reminder not found', 404);

  reminder.isActive = !reminder.isActive;
  if (reminder.isActive) reminder.status = 'pending';
  await reminder.save();

  return sendSuccess(res, 200, `Reminder ${reminder.isActive ? 'enabled' : 'disabled'}`, reminder);
});

// ─── POST /api/reminders/:id/test ─────────────────────────────────────────────
// Sends a test email to the patient right now (for verifying setup)
const sendTestEmail = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findOne({ _id: req.params.id, patientId: req.user.id });
  if (!reminder) throw new AppError('Reminder not found', 404);

  await sendReminderEmail({
    to:           req.user.email,
    patientName:  req.user.name,
    medicineName: reminder.medicineName,
    dosage:       reminder.dosage,
    notes:        reminder.notes,
    time:         reminder.time,
  });

  return sendSuccess(res, 200, `Test email sent to ${req.user.email}`);
});

module.exports = { getReminders, createReminder, updateReminder, deleteReminder, toggleReminder, sendTestEmail };
