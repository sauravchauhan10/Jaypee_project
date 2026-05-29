// src/controllers/analytics.controller.js
const Prescription = require('../models/Prescription.model');
const mongoose     = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

// ─── Helper: fill missing months with 0 ───────────────────────────────────────
const fillMonths = (data, months = 6) => {
  const result  = [];
  const now     = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year  = d.getFullYear();
    const month = d.getMonth() + 1;               // 1-based
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    const found = data.find((r) => r._id.year === year && r._id.month === month);
    result.push({ label, count: found?.count || 0 });
  }
  return result;
};

// ─── Helper: fill missing days with 0 ─────────────────────────────────────────
const fillDays = (data, days = 30) => {
  const result = [];
  const now    = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d     = new Date(now);
    d.setDate(d.getDate() - i);
    const key   = d.toISOString().split('T')[0]; // YYYY-MM-DD
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const found = data.find((r) => r._id === key);
    result.push({ label, count: found?.count || 0 });
  }
  return result;
};

// ─── @route   GET /api/analytics/doctor ──────────────────────────────────────
// ─── @access  Protected · Doctor only ────────────────────────────────────────
const getDoctorAnalytics = asyncHandler(async (req, res) => {
  const doctorId    = new mongoose.Types.ObjectId(req.user.id);
  const sixMonths   = new Date(); sixMonths.setMonth(sixMonths.getMonth() - 6);
  const thirtyDays  = new Date(); thirtyDays.setDate(thirtyDays.getDate() - 30);

  // Run all aggregations in parallel for performance
  const [
    monthlyRaw,
    topDiagnosesRaw,
    topMedicinesRaw,
    recentActivityRaw,
    statusBreakdownRaw,
    totalPatientsArr,
    totalRx,
    todayRx,
    weekdayRaw,
  ] = await Promise.all([

    // 1. Monthly prescriptions (last 6 months)
    Prescription.aggregate([
      { $match: { doctorId, date: { $gte: sixMonths } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // 2. Top diagnoses (all-time, top 8)
    Prescription.aggregate([
      { $match: { doctorId } },
      { $group: { _id: '$diagnosis', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),

    // 3. Top medicines by frequency (all-time, top 10)
    Prescription.aggregate([
      { $match: { doctorId } },
      { $unwind: '$medicines' },
      { $group: { _id: '$medicines.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),

    // 4. Recent daily activity (last 30 days)
    Prescription.aggregate([
      { $match: { doctorId, date: { $gte: thirtyDays } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),

    // 5. Status breakdown (all-time)
    Prescription.aggregate([
      { $match: { doctorId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // 6. Distinct patients
    Prescription.distinct('patientId', { doctorId }),

    // 7. Total prescriptions
    Prescription.countDocuments({ doctorId }),

    // 8. Today's prescriptions
    Prescription.countDocuments({
      doctorId,
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    }),

    // 9. Prescriptions by day-of-week (0=Sun…6=Sat)
    Prescription.aggregate([
      { $match: { doctorId } },
      { $group: { _id: { $dayOfWeek: '$date' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // ── Format status breakdown ──────────────────────────────────────────────────
  const statusBreakdown = { active: 0, completed: 0, cancelled: 0 };
  statusBreakdownRaw.forEach((s) => { statusBreakdown[s._id] = s.count; });

  // ── Format weekday data (Sun-Sat labels) ─────────────────────────────────────
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekday = weekdayLabels.map((label, i) => {
    const found = weekdayRaw.find((r) => r._id === i + 1); // Mongo $dayOfWeek is 1-based
    return { label, count: found?.count || 0 };
  });

  res.status(200).json({
    success: true,
    message: 'Analytics fetched',
    data: {
      kpis: {
        totalPrescriptions: totalRx,
        totalPatients:      totalPatientsArr.length,
        todayPrescriptions: todayRx,
        activePrescriptions: statusBreakdown.active,
      },
      monthlyPrescriptions: fillMonths(monthlyRaw, 6),
      topDiagnoses:  topDiagnosesRaw.map((r) => ({ label: r._id, count: r.count })),
      topMedicines:  topMedicinesRaw.map((r) => ({ label: r._id, count: r.count })),
      recentActivity: fillDays(recentActivityRaw, 30),
      statusBreakdown,
      weekday,
    },
  });
});

// ─── @route   GET /api/analytics/patient ─────────────────────────────────────
// ─── @access  Protected · Patient only ───────────────────────────────────────
const getPatientAnalytics = asyncHandler(async (req, res) => {
  const patientId  = new mongoose.Types.ObjectId(req.user.id);
  const sixMonths  = new Date(); sixMonths.setMonth(sixMonths.getMonth() - 6);

  const [
    monthlyRaw,
    topMedicinesRaw,
    statusBreakdownRaw,
    totalRx,
  ] = await Promise.all([
    Prescription.aggregate([
      { $match: { patientId, date: { $gte: sixMonths } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Prescription.aggregate([
      { $match: { patientId } },
      { $unwind: '$medicines' },
      { $group: { _id: '$medicines.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    Prescription.aggregate([
      { $match: { patientId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Prescription.countDocuments({ patientId }),
  ]);

  const statusBreakdown = { active: 0, completed: 0, cancelled: 0 };
  statusBreakdownRaw.forEach((s) => { statusBreakdown[s._id] = s.count; });

  res.status(200).json({
    success: true,
    data: {
      kpis: {
        totalPrescriptions: totalRx,
        activePrescriptions: statusBreakdown.active,
        completedPrescriptions: statusBreakdown.completed,
      },
      monthlyPrescriptions: fillMonths(monthlyRaw, 6),
      topMedicines:         topMedicinesRaw.map((r) => ({ label: r._id, count: r.count })),
      statusBreakdown,
    },
  });
});

module.exports = { getDoctorAnalytics, getPatientAnalytics };
