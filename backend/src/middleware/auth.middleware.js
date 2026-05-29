// src/middleware/auth.middleware.js — JWT verification
const jwt          = require('jsonwebtoken');
const User         = require('../models/User.model');
const AppError     = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { JWT_SECRET } = require('../config/jwt');

/**
 * authMiddleware — Verifies Bearer JWT token from Authorization header.
 * Attaches decoded user payload to req.user on success.
 */
const authMiddleware = asyncHandler(async (req, res, next) => {
  // 1. Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  // 2. Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Session expired. Please log in again.', 401);
    }
    throw new AppError('Invalid token. Please log in again.', 401);
  }

  // 3. Check user still exists and is active
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('The user belonging to this token no longer exists.', 401);
  }
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated.', 403);
  }

  // 4. Attach user to request
  req.user = { id: user._id, role: user.role, email: user.email, name: user.name };
  next();
});

module.exports = authMiddleware;
