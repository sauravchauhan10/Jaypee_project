// src/routes/patient.routes.js
const express = require('express');
const { searchPatients, getAllPatients } = require('../controllers/patient.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

// All patient routes require authentication + doctor role
router.use(authMiddleware, roleMiddleware('doctor'));

// GET /api/patients/search?q=<query>
router.get('/search', searchPatients);

// GET /api/patients
router.get('/', getAllPatients);

module.exports = router;
