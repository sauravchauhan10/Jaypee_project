// src/services/auth.service.js
import api from './api';

/**
 * Register a new user
 * @param {{ name, email, password, role, age, gender }} data
 */
export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

/**
 * Login user
 * @param {{ email, password }} credentials
 */
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * Fetch authenticated user's profile
 */
export const fetchMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Change Password (logged in)
 * @param {{ currentPassword, newPassword }} data
 */
export const changePassword = async (data) => {
  const response = await api.put('/auth/change-password', data);
  return response.data;
};

/**
 * Forgot Password (send OTP to email)
 * @param {{ email }} data
 */
export const forgotPassword = async (data) => {
  const response = await api.post('/auth/forgot-password', data);
  return response.data;
};

/**
 * Reset Password (using OTP)
 * @param {{ email, otp, newPassword }} data
 */
export const resetPassword = async (data) => {
  const response = await api.put('/auth/reset-password', data);
  return response.data;
};
