// src/pages/DoctorDashboard.jsx — Placeholder (full features coming next)
import useAuth from '../hooks/useAuth';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">CareBridge</span>
            <span className="badge badge-blue">Doctor</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Dr. {user?.name}</span>
            <button
              id="doctor-logout"
              onClick={logout}
              className="btn-secondary text-xs"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="card text-center py-20">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🩺</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor Dashboard</h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            Authentication successful! Full dashboard features — prescriptions, patient records,
            and PDF generation — will be implemented in the next steps.
          </p>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
