// models/index.js — Central export for all Mongoose models
const User         = require('./User.model');
const Prescription = require('./Prescription.model');
const Reminder     = require('./Reminder.model');

module.exports = { User, Prescription, Reminder };
