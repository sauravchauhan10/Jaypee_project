// src/middleware/role.middleware.js — Role-based access control
const AppError = require('../utils/AppError');

/**
 * roleMiddleware — Restricts route access to specified roles.
 * Must be used AFTER authMiddleware (requires req.user to be set).
 *
 * Usage:
 *   router.get('/doctor-only', authMiddleware, roleMiddleware('doctor'), handler);
 *   router.get('/shared',      authMiddleware, roleMiddleware('doctor', 'patient'), handler);
 *
 * @param  {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 */
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. This route is restricted to: ${roles.join(', ')}.`,
          403
        )
      );
    }
    next();
  };
};

module.exports = roleMiddleware;
