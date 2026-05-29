// src/services/reminder.service.js
import api from './api';

export const getReminders    = ()          => api.get('/reminders');
export const createReminder  = (payload)   => api.post('/reminders', payload);
export const updateReminder  = (id, data)  => api.put(`/reminders/${id}`, data);
export const deleteReminder  = (id)        => api.delete(`/reminders/${id}`);
export const toggleReminder  = (id)        => api.patch(`/reminders/${id}/toggle`);
export const sendTestEmail   = (id)        => api.post(`/reminders/${id}/test`);
