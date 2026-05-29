// src/controllers/auth.controller.js
const jwt            = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User           = require('../models/User.model');
const AppError       = require('../utils/AppError');
const asyncHandler   = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');

// ─── Helper: Generate JWT ──────────────────────────────────────────────────────
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// ─── @route   POST /api/auth/register ─────────────────────────────────────────
// ─── @access  Public ──────────────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  // 1. Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 422, 'Validation failed', errors.array());
  }

  const { name, email, password, role, age, gender } = req.body;

  // 2. Check duplicate email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 409, 'An account with this email already exists');
  }

  // 3. Create user (password hashing handled by pre-save hook in User.model.js)
  const user = await User.create({ name, email, password, role, age, gender });

  // 4. Generate JWT
  const token = generateToken(user._id, user.role);

  return sendSuccess(res, 201, 'Account created successfully', {
    token,
    user: {
      id:     user._id,
      name:   user.name,
      email:  user.email,
      role:   user.role,
      age:    user.age,
      gender: user.gender,
    },
  });
});

// ─── @route   POST /api/auth/login ────────────────────────────────────────────
// ─── @access  Public ──────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  // 1. Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 422, 'Validation failed', errors.array());
  }

  const { email, password } = req.body;

  // 2. Find user and explicitly select password (select: false on model)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return sendError(res, 401, 'Invalid email or password');
  }

  // 3. Check if account is active
  if (!user.isActive) {
    return sendError(res, 403, 'Your account has been deactivated. Please contact support.');
  }

  // 4. Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return sendError(res, 401, 'Invalid email or password');
  }

  // 5. Generate JWT
  const token = generateToken(user._id, user.role);

  return sendSuccess(res, 200, 'Login successful', {
    token,
    user: {
      id:     user._id,
      name:   user.name,
      email:  user.email,
      role:   user.role,
      age:    user.age,
      gender: user.gender,
    },
  });
});

// ─── @route   GET /api/auth/me ────────────────────────────────────────────────
// ─── @access  Protected ───────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  // req.user is populated by authMiddleware
  const user = await User.findById(req.user.id);
  if (!user) {
    return sendError(res, 404, 'User not found');
  }
  return sendSuccess(res, 200, 'Profile fetched', user.toPublicJSON());
});

// ─── @route   PUT /api/auth/change-password ───────────────────────────────────
// ─── @access  Protected ───────────────────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return sendError(res, 400, 'Please provide both current and new password');
  }

  const user = await User.findById(req.user.id).select('+password');
  if (!user) return sendError(res, 404, 'User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return sendError(res, 401, 'Incorrect current password');

  user.password = newPassword;
  await user.save();

  return sendSuccess(res, 200, 'Password updated successfully');
});

// ─── @route   POST /api/auth/forgot-password ──────────────────────────────────
// ─── @access  Public ──────────────────────────────────────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return sendError(res, 400, 'Please provide an email address');

  const user = await User.findOne({ email });
  if (!user) {
    // Return success anyway to prevent email enumeration attacks
    return sendSuccess(res, 200, 'If that email is registered, an OTP has been sent.');
  }

  const otp = user.createPasswordResetOtp();
  await user.save({ validateBeforeSave: false });

  try {
    const { sendPasswordResetOtpEmail } = require('../services/email.service');
    await sendPasswordResetOtpEmail(user.email, otp);
    return sendSuccess(res, 200, 'If that email is registered, an OTP has been sent.');
  } catch (err) {
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return sendError(res, 500, 'Email could not be sent. Please try again later.');
  }
});

// ─── @route   PUT /api/auth/reset-password ────────────────────────────────────
// ─── @access  Public ──────────────────────────────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return sendError(res, 400, 'Please provide email, OTP, and new password');
  }

  const crypto = require('crypto');
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    email,
    resetPasswordOtp: hashedOtp,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return sendError(res, 400, 'Invalid or expired OTP');
  }

  // Set new password
  user.password = newPassword;
  user.resetPasswordOtp = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return sendSuccess(res, 200, 'Password has been reset successfully. You can now log in.');
});

module.exports = { register, login, getMe, changePassword, forgotPassword, resetPassword };
