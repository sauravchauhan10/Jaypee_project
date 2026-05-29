// src/services/reminder.scheduler.js
const cron               = require('node-cron');
const Reminder           = require('../models/Reminder.model');
const User               = require('../models/User.model');
const { sendReminderEmail } = require('./email.service');

/**
 * Runs every minute: checks if any active reminder's time matches
 * the current HH:MM, fires the email, and updates lastSentAt.
 *
 * Duplicate-send guard: if lastSentAt is within the last 60 seconds
 * (same minute window) we skip — prevents double-sends if the server
 * restarts mid-minute.
 */
const startReminderScheduler = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now    = new Date();
      const hour   = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hour}:${minute}`;   // e.g. "08:00"
      const currentDay  = now.getDay();           // 0=Sun…6=Sat

      // Find all active reminders matching the current time
      const reminders = await Reminder.find({
        isActive: true,
        time:     currentTime,
      }).lean();

      if (reminders.length === 0) return;

      // Collect unique patient IDs to batch-fetch users
      const patientIds = [...new Set(reminders.map((r) => r.patientId.toString()))];
      const patients   = await User.find({ _id: { $in: patientIds } })
        .select('name email')
        .lean();

      const patientMap = {};
      patients.forEach((p) => { patientMap[p._id.toString()] = p; });

      for (const reminder of reminders) {
        try {
          // Day-of-week filter (empty = every day)
          if (reminder.daysOfWeek?.length > 0 && !reminder.daysOfWeek.includes(currentDay)) {
            continue;
          }

          // Duplicate-send guard
          if (reminder.lastSentAt) {
            const secondsSinceSent = (now - new Date(reminder.lastSentAt)) / 1000;
            if (secondsSinceSent < 60) continue;
          }

          const patient = patientMap[reminder.patientId.toString()];
          if (!patient?.email) continue;

          await sendReminderEmail({
            to:           patient.email,
            patientName:  patient.name,
            medicineName: reminder.medicineName,
            dosage:       reminder.dosage  || '',
            notes:        reminder.notes   || '',
            time:         currentTime,
          });

          // Mark as sent + update lastSentAt
          await Reminder.findByIdAndUpdate(reminder._id, {
            lastSentAt: now,
            status:     'sent',
          });

          console.log(`✅ Reminder sent: "${reminder.medicineName}" → ${patient.email} at ${currentTime}`);
        } catch (emailErr) {
          console.error(`❌ Failed to send reminder ${reminder._id}:`, emailErr.message);
        }
      }
    } catch (err) {
      console.error('💥 Reminder scheduler error:', err.message);
    }
  });

  console.log('⏰ Medicine reminder scheduler started (runs every minute)');
};

module.exports = { startReminderScheduler };
