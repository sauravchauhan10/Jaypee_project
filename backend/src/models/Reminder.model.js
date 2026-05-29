const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required'],
    },

    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
      default: null, // optional — reminder can be linked to a prescription
    },

    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },

    dosage: {
      type: String,
      trim: true,
      default: '',
    },

    notes: {
      type: String,
      trim: true,
      default: '',
    },

    time: {
      type: String,
      required: [true, 'Reminder time is required'],
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        'Time must be in HH:MM 24-hour format (e.g. "08:00")',
      ],
    },

    // Days to fire: 0=Sun, 1=Mon … 6=Sat · empty array = every day
    daysOfWeek: {
      type: [Number],
      default: [],
      validate: {
        validator: (arr) => arr.every((d) => d >= 0 && d <= 6),
        message: 'daysOfWeek values must be 0–6',
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'sent', 'acknowledged', 'missed'],
        message: 'Invalid status value',
      },
      default: 'pending',
    },

    lastSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
reminderSchema.index({ patientId: 1 });
reminderSchema.index({ patientId: 1, isActive: 1 });
reminderSchema.index({ prescriptionId: 1 });
reminderSchema.index({ time: 1, isActive: 1 }); // scheduler query

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;
