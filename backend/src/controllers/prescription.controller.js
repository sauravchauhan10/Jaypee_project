// src/controllers/prescription.controller.js
const Prescription = require('../models/Prescription.model');
const User         = require('../models/User.model');
const AppError     = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ─── Shared populate config ────────────────────────────────────────────────────
const POPULATE = [
  { path: 'doctorId',  select: 'name email' },
  { path: 'patientId', select: 'name email age gender' },
];

// ─── @route   POST /api/prescriptions ────────────────────────────────────────
// ─── @access  Protected · Doctor only ────────────────────────────────────────
const createPrescription = asyncHandler(async (req, res) => {
  const { patientEmail, patientId, diagnosis, medicines, notes, date } = req.body;

  // 1. Resolve patient — accept either patientId or patientEmail
  let patient;
  if (patientId) {
    patient = await User.findOne({ _id: patientId, role: 'patient' });
  } else if (patientEmail) {
    patient = await User.findOne({ email: patientEmail.toLowerCase().trim(), role: 'patient' });
  }

  if (!patient) {
    throw new AppError('Patient not found. Make sure the patient is registered.', 404);
  }

  // 2. Create prescription
  const prescription = await Prescription.create({
    doctorId:  req.user.id,
    patientId: patient._id,
    diagnosis: diagnosis.trim(),
    medicines,
    notes:     notes?.trim() || '',
    date:      date || new Date(),
  });

  // 3. Return populated
  const populated = await prescription.populate(POPULATE);

  return sendSuccess(res, 201, 'Prescription created successfully', populated);
});

// ─── @route   GET /api/prescriptions ─────────────────────────────────────────
// ─── @access  Protected · Doctor sees own · Patient sees own ─────────────────
const getAllPrescriptions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  // Build query based on role
  const query = {};
  if (req.user.role === 'doctor')  query.doctorId  = req.user.id;
  if (req.user.role === 'patient') query.patientId = req.user.id;
  if (status) query.status = status;

  // Text search on diagnosis (if provided)
  if (search?.trim()) {
    query.diagnosis = { $regex: search.trim(), $options: 'i' };
  }

  const [prescriptions, total] = await Promise.all([
    Prescription.find(query)
      .populate(POPULATE)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Prescription.countDocuments(query),
  ]);

  return sendSuccess(res, 200, 'Prescriptions fetched', {
    prescriptions,
    pagination: {
      total,
      page:  Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// ─── @route   GET /api/prescriptions/:id ─────────────────────────────────────
// ─── @access  Protected · Owner only (doctor who created OR the patient) ──────
const getPrescriptionById = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id).populate(POPULATE);

  if (!prescription) {
    throw new AppError('Prescription not found', 404);
  }

  // Ownership check
  const isDoctor  = prescription.doctorId._id.toString()  === req.user.id.toString();
  const isPatient = prescription.patientId._id.toString() === req.user.id.toString();

  if (!isDoctor && !isPatient) {
    throw new AppError('You do not have access to this prescription', 403);
  }

  return sendSuccess(res, 200, 'Prescription fetched', prescription);
});

// ─── @route   PUT /api/prescriptions/:id ─────────────────────────────────────
// ─── @access  Protected · Doctor (creator) only ──────────────────────────────
const updatePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    throw new AppError('Prescription not found', 404);
  }

  // Only the creating doctor can update
  if (prescription.doctorId.toString() !== req.user.id.toString()) {
    throw new AppError('You are not authorized to update this prescription', 403);
  }

  const { diagnosis, medicines, notes, status, date } = req.body;

  // Partial update — only overwrite fields that are provided
  if (diagnosis !== undefined) prescription.diagnosis = diagnosis.trim();
  if (medicines !== undefined) prescription.medicines = medicines;
  if (notes     !== undefined) prescription.notes     = notes.trim();
  if (status    !== undefined) prescription.status    = status;
  if (date      !== undefined) prescription.date      = date;

  await prescription.save();
  const updated = await prescription.populate(POPULATE);

  return sendSuccess(res, 200, 'Prescription updated successfully', updated);
});

// ─── @route   DELETE /api/prescriptions/:id ──────────────────────────────────
// ─── @access  Protected · Doctor (creator) only ──────────────────────────────
const deletePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    throw new AppError('Prescription not found', 404);
  }

  if (prescription.doctorId.toString() !== req.user.id.toString()) {
    throw new AppError('You are not authorized to delete this prescription', 403);
  }

  await prescription.deleteOne();

  return sendSuccess(res, 200, 'Prescription deleted successfully', null);
});

// ─── @route   GET /api/prescriptions/patient/:patientId ──────────────────────
// ─── @access  Protected · Doctor only ────────────────────────────────────────
const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const prescriptions = await Prescription.find({
    patientId: req.params.patientId,
    doctorId:  req.user.id,
  })
    .populate(POPULATE)
    .sort({ date: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  return sendSuccess(res, 200, 'Patient prescriptions fetched', prescriptions);
});

module.exports = {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
  getPatientPrescriptions,
};
