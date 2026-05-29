// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ROLE_REDIRECT = { doctor: '/doctor', patient: '/patient' };

const Register = () => {
  const { register, setError: setCtxError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'patient', age: '', gender: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      if (payload.age) payload.age = Number(payload.age);
      const user = await register(payload);
      navigate(ROLE_REDIRECT[user.role], { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-primary-300 mt-1 text-sm">Smart Digital Prescription Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div id="register-error" className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-400/40 text-red-200 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form id="register-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Role Toggle */}
            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {['patient', 'doctor'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    id={`role-${r}`}
                    onClick={() => setForm((p) => ({ ...p, role: r }))}
                    className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200 border ${
                      form.role === r
                        ? 'bg-white text-primary-800 border-white shadow-lg'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {r === 'doctor' ? '🩺 Doctor' : '🏥 Patient'}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-primary-200 mb-1">Full Name</label>
              <input
                id="name" name="name" type="text" autoComplete="name"
                value={form.name} onChange={handleChange} required
                placeholder="John Doe"
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-primary-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-200 mb-1">Email Address</label>
              <input
                id="email" name="email" type="email" autoComplete="email"
                value={form.email} onChange={handleChange} required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-primary-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40 transition"
              />
            </div>

            {/* Age + Gender Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-primary-200 mb-1">Age</label>
                <input
                  id="age" name="age" type="number" min="0" max="150"
                  value={form.age} onChange={handleChange}
                  placeholder="e.g. 28"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-primary-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40 transition"
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-primary-200 mb-1">Gender</label>
                <select
                  id="gender" name="gender"
                  value={form.gender} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-primary-900 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40 transition"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-200 mb-1">Password</label>
              <input
                id="password" name="password" type="password" autoComplete="new-password"
                value={form.password} onChange={handleChange} required
                placeholder="Min. 6 characters"
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-primary-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40 transition"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-200 mb-1">Confirm Password</label>
              <input
                id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password"
                value={form.confirmPassword} onChange={handleChange} required
                placeholder="Repeat your password"
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-primary-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40 transition"
              />
            </div>

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white text-primary-800 font-semibold text-sm hover:bg-primary-50 active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-primary-300 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" id="go-to-login" className="text-white font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
