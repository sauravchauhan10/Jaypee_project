// src/controllers/verify.controller.js
const Prescription = require('../models/Prescription.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError     = require('../utils/AppError');

// ─── @route   GET /api/verify/:prescriptionId ─────────────────────────────────
// ─── @access  PUBLIC — no authentication required ────────────────────────────
const verifyPrescription = asyncHandler(async (req, res) => {
  const { prescriptionId } = req.params;

  const prescription = await Prescription.findById(prescriptionId)
    .populate('doctorId',  'name email')
    .populate('patientId', 'name age gender')
    .lean();

  if (!prescription) {
    throw new AppError('Prescription not found or has been removed.', 404);
  }

  // Build a sanitised verification payload
  // — patient last name and email are intentionally withheld for privacy
  const patientName   = prescription.patientId?.name || 'Unknown';
  const firstNameOnly = patientName.split(' ')[0];

  const payload = {
    verified: true,
    verifiedAt: new Date().toISOString(),

    prescription: {
      id:         prescription._id,
      shortId:    `RX-${String(prescription._id).slice(-8).toUpperCase()}`,
      date:       prescription.date,
      diagnosis:  prescription.diagnosis,
      medicines:  prescription.medicines,
      notes:      prescription.notes || '',
      status:     prescription.status,
      createdAt:  prescription.createdAt,
    },

    doctor: {
      name:  prescription.doctorId?.name  || 'Unknown',
      email: prescription.doctorId?.email || '',
    },

    patient: {
      // Only first name for privacy
      name:   firstNameOnly,
      age:    prescription.patientId?.age    || null,
      gender: prescription.patientId?.gender || null,
    },
  };

  res.status(200).json({
    success: true,
    message: 'Prescription verified successfully',
    data:    payload,
  });
});

module.exports = { verifyPrescription };
