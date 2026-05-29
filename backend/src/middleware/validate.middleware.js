// src/middleware/validate.middleware.js — express-validator error handler
const { validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

/**
 * validate — Reads express-validator results and short-circuits with 422 if invalid.
 * Place this AFTER your validation rule arrays in the route definition.
 *
 * Usage:
 *   router.post('/register', [...rules], validate, controller);
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 422, 'Validation failed', errors.array());
  }
  next();
};

module.exports = validate;
