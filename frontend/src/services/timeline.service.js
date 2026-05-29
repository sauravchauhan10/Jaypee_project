// src/services/timeline.service.js
import api from './api';

/**
 * Fetch the current patient's medical timeline.
 * @returns {Promise<Array>} array of timeline events
 */
export const getTimeline = async () => {
  const res = await api.get('/timeline');
  return res.data;
};

/**
 * Fetch a specific patient's timeline (doctor only).
 * @param {string} patientId
 */
export const getPatientTimeline = async (patientId) => {
  const res = await api.get(`/timeline/patient/${patientId}`);
  return res.data;
};
