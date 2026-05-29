// index.js - Vercel Serverless Entry Point
require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

// Connect to MongoDB and export a serverless handler
// This ensures the database is connected BEFORE Express tries to process the request
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
