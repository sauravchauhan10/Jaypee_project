// src/utils/asyncHandler.js — Wraps async route handlers to eliminate try/catch boilerplate

/**
 * @param {Function} fn - Async express route handler
 * @returns {Function} - Express middleware that catches promise rejections
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
