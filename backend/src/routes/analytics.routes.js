// src/routes/analytics.routes.js
const express = require('express');
const { getDoctorAnalytics, getPatientAnalytics } = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

router.use(authMiddleware);

// GET /api/analytics/doctor  — Doctor's analytics dashboard data
router.get('/doctor',  roleMiddleware('doctor'),  getDoctorAnalytics);

// GET /api/analytics/patient — Patient's analytics dashboard data
router.get('/patient', roleMiddleware('patient'), getPatientAnalytics);

module.exports = router;
