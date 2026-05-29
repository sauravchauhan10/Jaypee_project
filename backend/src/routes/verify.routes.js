// src/routes/verify.routes.js
const express = require('express');
const { verifyPrescription } = require('../controllers/verify.controller');

const router = express.Router();

// GET /api/verify/:prescriptionId  — PUBLIC, no auth required
router.get('/:prescriptionId', verifyPrescription);

module.exports = router;
