// src/config/jwt.js - JWT configuration constants
module.exports = {
  JWT_SECRET:         process.env.JWT_SECRET || 'changeme_secret',
  JWT_EXPIRES_IN:     process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'changeme_refresh_secret',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
};
