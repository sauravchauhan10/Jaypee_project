// src/app.js - Express application setup
const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const compression = require('compression');

const app = express();

const isProd = process.env.NODE_ENV === 'production';

// ─── Security Headers (Helmet) ─────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow PDF streaming
  contentSecurityPolicy: false,                          // managed by frontend
}));

// ─── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, '')); // Strip trailing slashes to prevent CORS mismatches

app.use(cors({
  origin: (origin, cb) => {
    // Allow no-origin requests (mobile apps, curl) in dev
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ─── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request Logger ────────────────────────────────────────────────────────────
app.use(morgan(isProd ? 'combined' : 'dev'));

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
// Global: 200 requests per 15 minutes per IP
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      200,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests, please try again later.' },
  skip: () => !isProd,  // Only enforce in production
}));

// Stricter: Auth routes — 20 attempts per 15 minutes
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' },
  skip: () => !isProd,
}));

// ─── Static Files ──────────────────────────────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/patients',      require('./routes/patient.routes'));
app.use('/api/prescriptions', require('./routes/prescription.routes'));
app.use('/api/verify',        require('./routes/verify.routes'));     // PUBLIC — no auth
app.use('/api/timeline',      require('./routes/timeline.routes'));
app.use('/api/analytics',     require('./routes/analytics.routes'));
app.use('/api/reminders',     require('./routes/reminder.routes'));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status:    'OK',
    message:   'Smart Prescription Platform API is running',
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV || 'development',
    version:   process.env.npm_package_version || '1.0.0',
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode    = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  if (!isOperational) {
    console.error('💥 Unexpected Error:', err.message);
    if (!isProd) console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational ? err.message : 'Internal Server Error',
    ...(!isProd && { stack: err.stack }),
  });
});

module.exports = app;
