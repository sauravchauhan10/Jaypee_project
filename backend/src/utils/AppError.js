// src/utils/AppError.js — Custom operational error class

class AppError extends Error {
  /**
   * @param {string} message  - Human-readable error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguishes our errors from unexpected ones
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
