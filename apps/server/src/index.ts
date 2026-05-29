// apps/server/src/index.ts
// PrescribeFlow — Express.js API server entry point
import 'dotenv/config';

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { generalRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './auth/auth.routes.js';
import { prescriptionRouter } from './prescriptions/prescription.routes.js';
import { patientRouter } from './patients/patient.routes.js';
import { medicineRouter } from './medicines/medicine.routes.js';
import { analyticsRouter } from './analytics/analytics.routes.js';
import { aiRouter } from './ai/ai.routes.js';
import { auditRouter } from './audit/audit.routes.js';
import { notificationRouter } from './notifications/notification.routes.js';
import { initSocket } from './lib/socket.js';

// ── Initialize express ────────────────────────────────────────
const app: express.Express = express();

// ── Env validation ────────────────────────────────────────────
const REQUIRED_ENV = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
] as const;

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const PORT = process.env.PORT ?? 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000'];

// ── Security headers ──────────────────────────────────────────
app.use((helmet as any)());

// ── CORS ──────────────────────────────────────────────────────
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HTTP logging ──────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Global rate limit (applied before all routes) ─────────────
app.use(generalRateLimiter);

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'prescribeflow-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
  });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/prescriptions', prescriptionRouter);
app.use('/api/patients', patientRouter);
app.use('/api/medicines', medicineRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/audit', auditRouter);
app.use('/api/notifications', notificationRouter);

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: { code: 'NOT_FOUND', message: 'API route not found' },
  });
});

// ── Global error handler (must be last) ───────────────────────
app.use(errorHandler);

// ── Create HTTP Server & Initialize Socket.io ─────────────────
const server = createServer(app);
initSocket(server);

// ── Start server ──────────────────────────────────────────────
server.listen(PORT, () => {
  console.log('\n🚀 PrescribeFlow API Server');
  console.log(`   Port        : ${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV ?? 'development'}`);
  console.log(`   CORS Origin : ${CORS_ORIGIN}`);
  console.log('\n📡 Routes registered:');
  console.log('   POST  /api/auth/register');
  console.log('   POST  /api/auth/login');
  console.log('   POST  /api/auth/refresh');
  console.log('   POST  /api/auth/logout');
  console.log('   POST  /api/auth/logout-all');
  console.log('   GET   /api/auth/me');
  console.log('   GET   /health\n');
});

export default app;
