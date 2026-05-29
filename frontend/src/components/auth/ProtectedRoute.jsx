// src/components/auth/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

/**
 * ProtectedRoute — Guards routes that require authentication.
 *
 * @param {string[]} allowedRoles - Optional array of roles allowed to access the route.
 *                                  If omitted, any authenticated user is allowed.
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>                         // any auth user
 *   <Route element={<ProtectedRoute allowedRoles={['doctor']} />}> // doctors only
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  // Show nothing while restoring session from localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role restriction check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the correct dashboard if wrong role
    return <Navigate to={user.role === 'doctor' ? '/doctor' : '/patient'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
