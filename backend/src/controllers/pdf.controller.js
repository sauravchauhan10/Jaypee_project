// src/controllers/pdf.controller.js
const Prescription  = require('../models/Prescription.model');
const AppError      = require('../utils/AppError');
const asyncHandler  = require('../utils/asyncHandler');
const { generatePrescriptionPDF } = require('../services/pdf.service');

// ─── @route   GET /api/prescriptions/:id/pdf ─────────────────────────────────
// ─── @access  Protected · Doctor (creator) or Patient (owner) ────────────────
const downloadPrescriptionPDF = asyncHandler(async (req, res) => {
  // 1. Fetch prescription with populated refs
  const prescription = await Prescription.findById(req.params.id)
    .populate('doctorId',  'name email _id')
    .populate('patientId', 'name email age gender _id');

  if (!prescription) {
    throw new AppError('Prescription not found', 404);
  }

  // 2. Ownership / access check
  const isDoctor  = prescription.doctorId?._id?.toString()  === req.user.id.toString();
  const isPatient = prescription.patientId?._id?.toString() === req.user.id.toString();

  if (!isDoctor && !isPatient) {
    throw new AppError('You do not have access to this prescription', 403);
  }

  // 3. Generate PDF buffer
  const pdfBuffer = await generatePrescriptionPDF(prescription);

  // 4. Build a clean filename
  const patientName = (prescription.patientId?.name || 'patient')
    .replace(/\s+/g, '_').toLowerCase();
  const rxShortId   = String(prescription._id).slice(-8).toUpperCase();
  const filename    = `prescription_${rxShortId}_${patientName}.pdf`;

  // 5. Stream the PDF to the client
  res.set({
    'Content-Type':        'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length':      pdfBuffer.length,
    'Cache-Control':       'no-cache, no-store, must-revalidate',
  });

  res.send(pdfBuffer);
});

// ─── @route   GET /api/prescriptions/:id/pdf/view ────────────────────────────
// ─── Same as above but inline (browser viewer) ───────────────────────────────
const viewPrescriptionPDF = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('doctorId',  'name email _id')
    .populate('patientId', 'name email age gender _id');

  if (!prescription) throw new AppError('Prescription not found', 404);

  const isDoctor  = prescription.doctorId?._id?.toString()  === req.user.id.toString();
  const isPatient = prescription.patientId?._id?.toString() === req.user.id.toString();

  if (!isDoctor && !isPatient) {
    throw new AppError('You do not have access to this prescription', 403);
  }

  const pdfBuffer = await generatePrescriptionPDF(prescription);
  const rxShortId = String(prescription._id).slice(-8).toUpperCase();

  res.set({
    'Content-Type':        'application/pdf',
    'Content-Disposition': `inline; filename="prescription_${rxShortId}.pdf"`,
    'Content-Length':      pdfBuffer.length,
    'Cache-Control':       'no-cache',
  });

  res.send(pdfBuffer);
});

module.exports = { downloadPrescriptionPDF, viewPrescriptionPDF };
