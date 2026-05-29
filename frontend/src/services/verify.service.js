// src/services/verify.service.js
import api from './api';

/**
 * Publicly verify a prescription by its MongoDB ID.
 * This endpoint does NOT require authentication.
 *
 * @param {string} prescriptionId
 * @returns {Promise<Object>} verification payload
 */
export const verifyPrescription = async (prescriptionId) => {
  const res = await api.get(`/verify/${prescriptionId}`);
  return res.data;
};
