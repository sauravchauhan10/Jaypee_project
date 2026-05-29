# CareBridge — Smart Digital Prescription & Health Record Platform

> A full-stack healthcare platform for digital prescriptions, patient management, QR verification, medicine reminders, and AI-assisted health guidance.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)](https://mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)

---

## ✨ Features

### For Doctors
- 📋 **Issue Prescriptions** — Create digital prescriptions that include patient age, diagnosis, medicines, doctor's notes, and a digital signature.
- 📄 **PDF Download & QR Verification** — Download the prescription as a professional PDF. Anyone can scan the embedded QR code from the PDF to instantly verify its authenticity online.
- 🔍 **Patient Search** — Real-time patient search to securely assign prescriptions.
- 📊 **Analytics Dashboard** — Charts for monthly trends, top diagnoses, and medicine frequency.
- 👥 **Patient Records** — Full patient management and history tracking.

### For Patients
- 📋 **Patient Dashboard** — A dedicated dashboard to securely view all prescriptions issued by doctors.
- ⏰ **Medicine Reminders (Cron Jobs)** — Automated background Cron jobs that send scheduled email notifications to the patient at their exact prescribed medicine times.
- 🤖 **AI Agent (Powered by Gemini)** — A built-in AI chat agent using the Google Gemini API where patients can ask any questions related to their medicines, get precautions, and summarize prescriptions.
- 🕐 **Medical Timeline** — A visual chronological history of all past prescriptions and doctor visits.
- 📱 **Public QR Verification** — Scan a prescription QR code to verify its details (no login required for verification).

### Platform Architecture
- 🔐 **Role-Based Auth** — Two distinct user types (Doctor and Patient) with separate secure login portals.
- 🔒 **Security** — JWT Authentication, Helmet, rate limiting, bcrypt password hashing, and CORS.
- ☁️ **Cloud Ready** — MongoDB Atlas, deployable to Render (Backend) and Vercel (Frontend).

---

## 🛠 Tech Stack

| Layer      | Technology |
|------------|-----------|
| **Frontend** | React 18 + Vite, Tailwind CSS, React Router v6 |
| **State**    | Context API (AuthContext, ToastContext) |
| **Charts**   | Chart.js + react-chartjs-2 |
| **HTTP**     | Axios with interceptors |
| **Backend**  | Node.js + Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Auth**     | JWT + bcryptjs |
| **PDF**      | PDFKit |
| **QR Code**  | qrcode |
| **Email**    | Nodemailer (Gmail / SendGrid) |
| **Scheduler**| node-cron |
| **Security** | Helmet + express-rate-limit + compression |

---

## 📁 Project Structure

```
jaypee-project/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── prescription.controller.js
│   │   │   ├── patient.controller.js
│   │   │   ├── pdf.controller.js
│   │   │   ├── verify.controller.js
│   │   │   ├── timeline.controller.js
│   │   │   ├── analytics.controller.js
│   │   │   └── reminder.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # JWT verification
│   │   │   ├── role.middleware.js    # Role-based guard
│   │   │   └── validate.middleware.js
│   │   ├── models/
│   │   │   ├── User.model.js
│   │   │   ├── Prescription.model.js
│   │   │   └── Reminder.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── prescription.routes.js
│   │   │   ├── patient.routes.js
│   │   │   ├── verify.routes.js      # PUBLIC
│   │   │   ├── timeline.routes.js
│   │   │   ├── analytics.routes.js
│   │   │   └── reminder.routes.js
│   │   ├── services/
│   │   │   ├── email.service.js      # Nodemailer
│   │   │   ├── pdf.service.js        # PDFKit layouts
│   │   │   ├── qr.service.js         # QR PNG generator
│   │   │   └── reminder.scheduler.js # node-cron job
│   │   ├── utils/
│   │   │   ├── asyncHandler.js
│   │   │   ├── AppError.js
│   │   │   └── apiResponse.js
│   │   └── app.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── common/
│   │   │   │   ├── AIAssistantWidget.jsx
│   │   │   │   ├── DownloadPDFButton.jsx
│   │   │   │   └── MedicalTimelineComponent.jsx
│   │   │   └── layout/
│   │   │       ├── DoctorLayout.jsx
│   │   │       └── PatientLayout.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useDebounce.js
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── VerifyPrescription.jsx
│   │   │   ├── doctor/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Analytics.jsx
│   │   │   │   ├── CreatePrescription.jsx
│   │   │   │   ├── PatientRecords.jsx
│   │   │   │   └── PrescriptionList.jsx
│   │   │   └── patient/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── MedicalTimeline.jsx
│   │   │       ├── PatientAnalytics.jsx
│   │   │       ├── PrescriptionHistory.jsx
│   │   │       └── Reminders.jsx
│   │   ├── services/
│   │   │   ├── api.js                # Axios instance
│   │   │   ├── auth.service.js
│   │   │   ├── prescription.service.js
│   │   │   ├── patient.service.js
│   │   │   ├── timeline.service.js
│   │   │   ├── analytics.service.js
│   │   │   ├── reminder.service.js
│   │   │   └── verify.service.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── vercel.json
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

---
## Overview images
![alt text](<Screenshot 2026-05-29 165353.png>)
![alt text](<Screenshot 2026-05-29 165343.png>)
![alt text](<Screenshot 2026-05-29 165331.png>) 
![alt text](<Screenshot 2026-05-29 165319.png>)
![alt text](<Screenshot 2026-05-29 165304.png>)
![alt text](<Screenshot 2026-05-29 165213.png>)
![alt text](<Screenshot 2026-05-29 165201.png>)
![alt text](<Screenshot 2026-05-29 165152.png>)
![alt text](<Screenshot 2026-05-29 165145.png>)
![alt text](<Screenshot 2026-05-29 165133.png>)


## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18.0
- npm ≥ 9.0
- MongoDB Atlas account (free tier works)
- Gmail account (for email reminders)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/scriptmd.git
cd scriptmd
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and SMTP credentials

# Start development server
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file (optional — proxy handles dev API calls)
cp .env.example .env

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Verify Installation

Visit `http://localhost:5173` — you should see the CareBridge landing page.

Check backend health: `http://localhost:5000/api/health`

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | ✅ | `development` or `production` |
| `PORT` | ✅ | Server port (default: 5000) |
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Random 64-char hex string |
| `JWT_EXPIRE` | ✅ | Token expiry e.g. `7d` |
| `CLIENT_URL` | ✅ | Frontend URL for CORS |
| `SMTP_HOST` | ✅ | SMTP server (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | ✅ | SMTP port (587 for TLS) |
| `SMTP_USER` | ✅ | Email address |
| `SMTP_PASS` | ✅ | Gmail App Password |
| `BCRYPT_ROUNDS` | ❌ | bcrypt cost factor (default: 12) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Production only | Backend URL (dev uses proxy) |

---

## 📡 API Documentation

### Base URL
```
Development:  http://localhost:5000/api
Production:   https://your-backend.render.com/api
```

### Authentication

All protected routes require a Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

---

### Auth Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name":     "Dr. John Smith",
  "email":    "john@example.com",
  "password": "securepassword",
  "role":     "doctor",           // "doctor" | "patient"
  "age":      35,
  "gender":   "male"              // "male" | "female" | "other"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user":  { "id": "...", "name": "...", "role": "doctor" },
    "token": "eyJhbGci..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email":    "john@example.com",
  "password": "securepassword"
}
```

---

### Prescription Endpoints

#### List Prescriptions
```http
GET /api/prescriptions?page=1&limit=10&status=active
Authorization: Bearer <token>
```

#### Create Prescription (Doctor)
```http
POST /api/prescriptions
Authorization: Bearer <token>

{
  "patientId": "64abc...",
  "diagnosis": "Acute Bronchitis",
  "medicines": [
    {
      "name":      "Amoxicillin",
      "dosage":    "500mg",
      "frequency": "3 times daily",
      "duration":  "7 days"
    }
  ],
  "notes": "Take with food. Complete full course.",
  "date":  "2024-01-15"
}
```

#### Download PDF
```http
GET /api/prescriptions/:id/pdf
Authorization: Bearer <token>
```
Returns: `application/pdf` stream (Content-Disposition: attachment)

#### View PDF in Browser
```http
GET /api/prescriptions/:id/pdf/view
Authorization: Bearer <token>
```
Returns: `application/pdf` stream (Content-Disposition: inline)

#### Update Prescription Status
```http
PUT /api/prescriptions/:id
Authorization: Bearer <token>

{ "status": "completed" }
```

#### Delete Prescription
```http
DELETE /api/prescriptions/:id
Authorization: Bearer <token>
```

---

### Verification Endpoint (Public — No Auth Required)

#### Verify Prescription
```http
GET /api/verify/:prescriptionId
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "verified":    true,
    "verifiedAt":  "2024-01-15T10:30:00Z",
    "prescription": { "shortId": "RX-A1B2C3D4", "diagnosis": "...", "medicines": [...] },
    "doctor":       { "name": "Dr. John Smith", "email": "..." },
    "patient":      { "name": "John" }
  }
}
```

---

### Patient Endpoints

#### Search Patients (Doctor)
```http
GET /api/patients/search?q=rahul
Authorization: Bearer <token>
```

#### List All Patients (Doctor)
```http
GET /api/patients
Authorization: Bearer <token>
```

---

### Timeline Endpoint

#### Get Patient Timeline
```http
GET /api/timeline
Authorization: Bearer <token>    // Patient role
```

#### Get Patient Timeline (Doctor view)
```http
GET /api/timeline/patient/:patientId
Authorization: Bearer <token>    // Doctor role
```

---

### Analytics Endpoints

#### Doctor Analytics
```http
GET /api/analytics/doctor
Authorization: Bearer <token>    // Doctor role
```

**Response includes:** `kpis`, `monthlyPrescriptions`, `topDiagnoses`, `topMedicines`, `recentActivity`, `statusBreakdown`, `weekday`

#### Patient Analytics
```http
GET /api/analytics/patient
Authorization: Bearer <token>    // Patient role
```

---

### Reminder Endpoints

#### List Reminders
```http
GET /api/reminders
Authorization: Bearer <token>    // Patient role
```

#### Create Reminder
```http
POST /api/reminders
Authorization: Bearer <token>

{
  "medicineName": "Metformin",
  "dosage":       "500mg",
  "time":         "08:00",
  "daysOfWeek":   [1,2,3,4,5],   // Mon–Fri; [] = every day
  "notes":        "Take after breakfast"
}
```

#### Toggle Enable/Disable
```http
PATCH /api/reminders/:id/toggle
Authorization: Bearer <token>
```

#### Send Test Email Now
```http
POST /api/reminders/:id/test
Authorization: Bearer <token>
```

#### Delete Reminder
```http
DELETE /api/reminders/:id
Authorization: Bearer <token>
```

---

### Health Check
```http
GET /api/health
```
No auth required. Returns server status, timestamp, and version.

---

## 🌐 Deployment

### Frontend → Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Set **Root Directory** to `frontend`
4. Add environment variable: `VITE_API_URL=https://your-backend.render.com`
5. Deploy — `vercel.json` handles SPA routing automatically

### Backend → Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect GitHub repo
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add all environment variables from `backend/.env.example`
5. Deploy

### MongoDB Atlas Setup

1. Create account at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Database Access → Add user with read/write permissions
4. Network Access → Add IP: `0.0.0.0/0` (allow all — for Render)
5. Connect → Drivers → Copy connection string
6. Replace `<password>` and `<dbname>` in the URI

### Gmail App Password Setup

1. Enable 2-Factor Authentication on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and your device → Generate
4. Copy the 16-character password → use as `SMTP_PASS`

---

## 🔒 Security Checklist

- [x] JWT tokens in localStorage (not cookies — simpler for this scope)
- [x] Passwords hashed with bcrypt (12 rounds)
- [x] Helmet security headers
- [x] Rate limiting (200/15min global, 20/15min auth)
- [x] CORS restricted to allowed origins
- [x] Input validation with express-validator
- [x] Prescription ownership verified before access
- [x] Error messages don't leak stack traces in production
- [x] `.env` excluded from git via `.gitignore`
- [ ] Refresh token rotation (future improvement)
- [ ] 2FA for doctor accounts (future improvement)

---

## 📝 License

MIT © 2024 CareBridge

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

```bash
# Fork the repo
# Create feature branch
git checkout -b feature/amazing-feature

# Commit changes
git commit -m 'feat: add amazing feature'

# Push and open PR
git push origin feature/amazing-feature
```

---

*Built as a full-stack healthcare assessment project demonstrating React, Node.js, MongoDB, JWT auth, PDF generation, QR verification, email scheduling, and AI assistance.*
