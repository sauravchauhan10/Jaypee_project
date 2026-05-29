// src/services/analytics.service.js
import api from './api';

export const getDoctorAnalytics  = () => api.get('/analytics/doctor');
export const getPatientAnalytics = () => api.get('/analytics/patient');
