const mongoose = require('mongoose');

// ─── Medicine Sub-schema ───────────────────────────────────────────────────────
const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },

    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true,
      // e.g. "500mg", "1 tablet", "5ml"
    },

    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      trim: true,
      // e.g. "Once daily", "Twice a day", "Every 8 hours"
    },

    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
      // e.g. "5 days", "2 weeks", "1 month"
    },
  },
  { _id: true } // each medicine gets its own _id
);

// ─── Prescription Schema ───────────────────────────────────────────────────────
const prescriptionSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor reference is required'],
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required'],
    },

    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true,
      maxlength: [500, 'Diagnosis cannot exceed 500 characters'],
    },

    medicines: {
      type: [medicineSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one medicine is required',
      },
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },

    date: {
      type: Date,
      default: Date.now,
    },

    qrCode: {
      type: String, // Base64 data URL or file path
      default: null,
    },

    pdfUrl: {
      type: String, // Relative or absolute path to generated PDF
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ['active', 'completed', 'cancelled'],
        message: 'Status must be "active", "completed", or "cancelled"',
      },
      default: 'active',
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
prescriptionSchema.index({ doctorId: 1 });
prescriptionSchema.index({ patientId: 1 });
prescriptionSchema.index({ date: -1 });
prescriptionSchema.index({ patientId: 1, date: -1 }); // compound: patient history sorted by date

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
