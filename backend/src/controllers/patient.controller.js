// src/controllers/patient.controller.js
const User         = require('../models/User.model');
const Prescription = require('../models/Prescription.model');
const mongoose     = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

// ─── @route   GET /api/patients/search?q=<query> ─────────────────────────────
// ─── @access  Protected · Doctor only ────────────────────────────────────────
const searchPatients = asyncHandler(async (req, res) => {
  const { q = '' } = req.query;

  if (q.trim().length < 2) {
    return sendSuccess(res, 200, 'Enter at least 2 characters to search', []);
  }

  const regex = new RegExp(q.trim(), 'i');

  const patients = await User.find({
    role: 'patient',
    isActive: true,
    $or: [{ name: regex }, { email: regex }],
  })
    .select('_id name email age gender')
    .limit(10)
    .lean();

  return sendSuccess(res, 200, 'Patients fetched', patients);
});

// ─── @route   GET /api/patients ───────────────────────────────────────────────
// ─── @access  Protected · Doctor only ────────────────────────────────────────
const getAllPatients = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const doctorId = new mongoose.Types.ObjectId(req.user.id);

  // Get all patients
  const patients = await User.find({ role: 'patient', isActive: true })
    .select('_id name email age gender createdAt')
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await User.countDocuments({ role: 'patient', isActive: true });

  if (patients.length === 0) {
    return sendSuccess(res, 200, 'Patients fetched', {
      patients: [],
      pagination: { total: 0, page: Number(page), limit: Number(limit), pages: 0 },
    });
  }

  // Aggregate prescription counts + last visit date per patient
  const patientIds = patients.map((p) => p._id);

  const prescriptionStats = await Prescription.aggregate([
    {
      $match: {
        patientId: { $in: patientIds },
        doctorId,           // only THIS doctor's prescriptions
      },
    },
    {
      $group: {
        _id:               '$patientId',
        prescriptionCount: { $sum: 1 },
        lastVisit:         { $max: '$createdAt' },
      },
    },
  ]);

  // Map stats by patientId string
  const statsMap = {};
  prescriptionStats.forEach((s) => {
    statsMap[s._id.toString()] = {
      prescriptionCount: s.prescriptionCount,
      lastVisit:         s.lastVisit,
    };
  });

  // Merge stats into patient objects
  const enriched = patients.map((p) => ({
    ...p,
    prescriptionCount: statsMap[p._id.toString()]?.prescriptionCount || 0,
    lastVisit:         statsMap[p._id.toString()]?.lastVisit || null,
  }));

  return sendSuccess(res, 200, 'Patients fetched', {
    patients: enriched,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
});

module.exports = { searchPatients, getAllPatients };
