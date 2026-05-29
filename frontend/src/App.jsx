// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }    from './context/AuthContext';
import { ToastProvider }   from './context/ToastContext';
import ProtectedRoute      from './components/auth/ProtectedRoute';

// Layouts
import DoctorLayout  from './components/layout/DoctorLayout';
import PatientLayout from './components/layout/PatientLayout';

// Public pages
import Login               from './pages/Login';
import Register            from './pages/Register';
import ForgotPassword      from './pages/ForgotPassword';
import VerifyPrescription  from './pages/VerifyPrescription';
import LandingPage         from './pages/LandingPage';

// Common
import AIAssistantWidget   from './components/common/AIAssistantWidget';

// Doctor pages
import DoctorDashboard    from './pages/doctor/Dashboard';
import CreatePrescription from './pages/doctor/CreatePrescription';
import PatientRecords     from './pages/doctor/PatientRecords';
import Analytics          from './pages/doctor/Analytics';
import PrescriptionList   from './pages/doctor/PrescriptionList';

// Patient pages
import PatientDashboard    from './pages/patient/Dashboard';
import PrescriptionHistory from './pages/patient/PrescriptionHistory';
import MedicalTimeline     from './pages/patient/MedicalTimeline';
import PatientAnalytics    from './pages/patient/PatientAnalytics';
import Reminders           from './pages/patient/Reminders';

const App = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public routes ─────────────────────────────────────────── */}
          <Route path="/login"                    element={<Login />} />
          <Route path="/register"                 element={<Register />} />
          <Route path="/forgot-password"          element={<ForgotPassword />} />
          <Route path="/verify/:prescriptionId"   element={<VerifyPrescription />} />

          {/* ── Doctor routes (inside DoctorLayout) ───────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
            <Route element={<><DoctorLayout /><AIAssistantWidget /></>}>
              <Route path="/doctor"                      element={<DoctorDashboard />} />
              <Route path="/doctor/prescriptions"        element={<PrescriptionList />} />
              <Route path="/doctor/create-prescription"  element={<CreatePrescription />} />
              <Route path="/doctor/patients"             element={<PatientRecords />} />
              <Route path="/doctor/analytics"            element={<Analytics />} />
            </Route>
          </Route>

          {/* ── Patient routes (inside PatientLayout) ─────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
            <Route element={<><PatientLayout /><AIAssistantWidget /></>}>
              <Route path="/patient"               element={<PatientDashboard />} />
              <Route path="/patient/prescriptions" element={<PrescriptionHistory />} />
              <Route path="/patient/timeline"      element={<MedicalTimeline />} />
              <Route path="/patient/analytics"     element={<PatientAnalytics />} />
              <Route path="/patient/reminders"     element={<Reminders />} />
            </Route>
          </Route>

          {/* ── Default: landing page at root ─────────────────────────── */}
          <Route path="/"  element={<LandingPage />} />
          <Route path="*"  element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;

