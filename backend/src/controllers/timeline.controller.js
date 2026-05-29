// src/controllers/timeline.controller.js
const Prescription = require('../models/Prescription.model');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

// ─── @route   GET /api/timeline ───────────────────────────────────────────────
// ─── @access  Protected · Patient only ───────────────────────────────────────
const getPatientTimeline = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ patientId: req.user.id })
    .populate('doctorId', 'name email')
    .sort({ date: -1 })
    .lean();

  // Map each prescription into a rich timeline event object
  const events = prescriptions.map((rx) => ({
    id:          rx._id,
    shortId:     `RX-${String(rx._id).slice(-8).toUpperCase()}`,
    type:        'prescription',
    date:        rx.date,
    createdAt:   rx.createdAt,

    // Display fields
    title:       rx.diagnosis,
    doctor:      rx.doctorId?.name  || 'Unknown Doctor',
    doctorEmail: rx.doctorId?.email || '',
    medicines:   rx.medicines || [],
    notes:       rx.notes    || '',
    status:      rx.status,

    // Computed helpers
    medicineCount: rx.medicines?.length || 0,
  }));

  return sendSuccess(res, 200, 'Timeline fetched', events);
});

// ─── @route   GET /api/timeline/doctor/:patientId ─────────────────────────────
// ─── @access  Protected · Doctor only — view a specific patient's timeline ────
const getPatientTimelineForDoctor = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({
    patientId: req.params.patientId,
    doctorId:  req.user.id,
  })
    .populate('doctorId', 'name email')
    .sort({ date: -1 })
    .lean();

  const events = prescriptions.map((rx) => ({
    id:            rx._id,
    shortId:       `RX-${String(rx._id).slice(-8).toUpperCase()}`,
    type:          'prescription',
    date:          rx.date,
    createdAt:     rx.createdAt,
    title:         rx.diagnosis,
    doctor:        rx.doctorId?.name || 'Unknown Doctor',
    medicines:     rx.medicines || [],
    notes:         rx.notes    || '',
    status:        rx.status,
    medicineCount: rx.medicines?.length || 0,
  }));

  return sendSuccess(res, 200, 'Patient timeline fetched', events);
});

module.exports = { getPatientTimeline, getPatientTimelineForDoctor };
