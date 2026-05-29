const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },

    role: {
      type: String,
      enum: {
        values: ['doctor', 'patient'],
        message: 'Role must be either "doctor" or "patient"',
      },
      required: [true, 'Role is required'],
    },

    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      max: [150, 'Age is not realistic'],
    },

    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other'],
        message: 'Gender must be "male", "female", or "other"',
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    resetPasswordOtp: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// ─── Pre-save Hook: Hash password before saving ────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Method: Compare passwords ───────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance Method: Generate OTP ────────────────────────────────────────────
userSchema.methods.createPasswordResetOtp = function () {
  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP and set to resetPasswordOtp field
  // We use crypto.createHash for fast hashing of the OTP since it's short-lived
  const crypto = require('crypto');
  this.resetPasswordOtp = crypto.createHash('sha256').update(otp).digest('hex');

  // Set expire to 10 minutes from now
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return otp; // Return unhashed OTP to send via email
};

// ─── Instance Method: Safe public profile (no password) ───────────────────────
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
