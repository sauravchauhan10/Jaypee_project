// server.js - Entry point for Smart Prescription Platform Backend
require('dotenv').config();

const app       = require('./src/app');
const connectDB = require('./src/config/db');
const { startReminderScheduler } = require('./src/services/reminder.scheduler');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server + scheduler
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Start the medicine reminder cron job
  startReminderScheduler();

}).catch((err) => {
  console.error('❌ Failed to connect to database:', err.message);
  process.exit(1);
});

