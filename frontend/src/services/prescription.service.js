// src/services/prescription.service.js
import api from './api';

/**
 * Search patients by name or email (doctor only)
 * @param {string} query
 */
export const searchPatients = async (query) => {
  const res = await api.get(`/patients/search?q=${encodeURIComponent(query)}`);
  return res.data;
};

/**
 * Create a new prescription
 * @param {Object} payload - { patientId, diagnosis, medicines, notes, date }
 */
export const createPrescription = async (payload) => {
  const res = await api.post('/prescriptions', payload);
  return res.data;
};

/**
 * Get all prescriptions (role-filtered on backend)
 * @param {Object} params - { page, limit, status, search }
 */
export const getPrescriptions = async (params = {}) => {
  const res = await api.get('/prescriptions', { params });
  return res.data;
};

/**
 * Get single prescription by ID
 * @param {string} id
 */
export const getPrescriptionById = async (id) => {
  const res = await api.get(`/prescriptions/${id}`);
  return res.data;
};

/**
 * Update a prescription
 * @param {string} id
 * @param {Object} payload
 */
export const updatePrescription = async (id, payload) => {
  const res = await api.put(`/prescriptions/${id}`, payload);
  return res.data;
};

/**
 * Delete a prescription
 * @param {string} id
 */
export const deletePrescription = async (id) => {
  const res = await api.delete(`/prescriptions/${id}`);
  return res.data;
};

/**
 * Get all prescriptions for a specific patient (doctor only)
 * @param {string} patientId
 */
export const getPatientPrescriptions = async (patientId) => {
  const res = await api.get(`/prescriptions/patient/${patientId}`);
  return res.data;
};

/**
 * Download a prescription as a PDF file.
 * Uses Blob API to trigger a native browser download.
 *
 * @param {string} id          - Prescription MongoDB ID
 * @param {string} [filename]  - Optional override filename
 */
export const downloadPrescriptionPDF = async (id, filename) => {
  const response = await api.get(`/prescriptions/${id}/pdf`, {
    responseType: 'blob',
  });

  const url  = window.URL.createObjectURL(
    new Blob([response.data], { type: 'application/pdf' })
  );
  const link = document.createElement('a');
  link.href  = url;
  link.setAttribute('download', filename || `prescription_${id.slice(-8).toUpperCase()}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
