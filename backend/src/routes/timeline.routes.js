// src/routes/timeline.routes.js
const express = require('express');
const { getPatientTimeline, getPatientTimelineForDoctor } = require('../controllers/timeline.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

router.use(authMiddleware);

// GET /api/timeline              — Patient: own timeline
router.get('/', roleMiddleware('patient'), getPatientTimeline);

// GET /api/timeline/patient/:id  — Doctor: view a specific patient's timeline
router.get('/patient/:patientId', roleMiddleware('doctor'), getPatientTimelineForDoctor);

module.exports = router;
