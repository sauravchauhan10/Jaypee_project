// src/pages/doctor/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, gradient, loading }) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 text-white ${gradient} shadow-lg`}>
    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
    <div className="absolute -right-1 -bottom-6 w-16 h-16 rounded-full bg-white/10" />
    <div className="relative">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/20 text-white">
          ↑ 0%
        </span>
      </div>
      {loading ? (
        <div className="h-9 w-14 bg-white/20 rounded-lg animate-pulse mb-1" />
      ) : (
        <p className="text-3xl font-bold mb-1">{value}</p>
      )}
      <p className="text-sm font-semibold opacity-90">{label}</p>
      {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
    </div>
  </div>
);

// ─── Activity item ─────────────────────────────────────────────────────────────
const ActivityItem = ({ initial, name, action, time, color }) => (
  <div className="flex items-start gap-3 py-3">
    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white ${color}`}>
      {initial}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-800">
        <span className="font-semibold">{name}</span>{' '}
        <span className="text-gray-500">{action}</span>
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{time}</p>
    </div>
  </div>
);

// ─── Quick Action ──────────────────────────────────────────────────────────────
const QuickAction = ({ id, icon, label, desc, onClick, color }) => (
  <button
    id={id}
    onClick={onClick}
    className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95 group ${color}`}
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 bg-current/10">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
      <svg className="w-5 h-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </button>
);

// ─── Main ──────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [kpis,     setKpis]     = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [analyticsRes, rxRes] = await Promise.all([
          api.get('/analytics/doctor'),
          api.get('/prescriptions?limit=5'),
        ]);
        setKpis(analyticsRes.data?.data?.kpis || {});
        setActivity(rxRes.data?.data?.prescriptions || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setKpis({});
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = [
    {
      label:    'Total Patients',
      value:    loading ? '—' : (kpis?.totalPatients ?? 0),
      sub:      !kpis?.totalPatients ? 'Register patients to get started' : `Unique patients treated`,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
      label:    "Today's Prescriptions",
      value:    loading ? '—' : (kpis?.todayPrescriptions ?? 0),
      sub:      !kpis?.todayPrescriptions ? 'No prescriptions issued today' : `Issued today`,
      gradient: 'bg-gradient-to-br from-violet-500 to-violet-700',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
    {
      label:    'Active Prescriptions',
      value:    loading ? '—' : (kpis?.activePrescriptions ?? 0),
      sub:      'Across all patients',
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    },
    {
      label:    'Total Prescriptions',
      value:    loading ? '—' : (kpis?.totalPrescriptions ?? 0),
      sub:      'All time',
      gradient: 'bg-gradient-to-br from-rose-500 to-rose-700',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    },
  ];

  const quickActions = [
    {
      id: 'qa-create-prescription',
      label: 'Create Prescription',
      desc:  'Issue a new digital prescription for a patient',
      color: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
      onClick: () => navigate('/doctor/create-prescription'),
      icon: <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    },
    {
      id: 'qa-patient-records',
      label: 'Patient Records',
      desc:  'View and manage all your patient records',
      color: 'border-violet-200 hover:border-violet-400 hover:bg-violet-50',
      onClick: () => navigate('/doctor/patients'),
      icon: <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
      id: 'qa-analytics',
      label: 'View Analytics',
      desc:  'Track prescription trends and patient stats',
      color: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50',
      onClick: () => navigate('/doctor/analytics'),
      icon: <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    },
  ];

  // Format recent activity from real prescription data
  const formatActivity = () => {
    if (loading) return [];
    if (!activity || activity.length === 0) return [];

    return activity.slice(0, 5).map((item, i) => {
      const patientName = item.patientId?.name || 'Patient';
      const date        = new Date(item.createdAt || item.date);
      const timeStr     = isNaN(date) ? '' : date.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      });
      return {
        initial: patientName.charAt(0).toUpperCase(),
        name:    patientName,
        action:  `was prescribed for "${item.diagnosis}"`,
        time:    timeStr,
        color:   ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500'][i % 5],
      };
    });
  };

  const formattedActivity = formatActivity();

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, Dr. {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">{today}</p>
        </div>
        <button
          id="header-create-prescription"
          onClick={() => navigate('/doctor/create-prescription')}
          className="btn-primary self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Prescription
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 stagger-children">
        {stats.map((s, i) => <StatCard key={i} {...s} loading={loading} />)}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((qa) => <QuickAction key={qa.id} {...qa} />)}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
              <button
                onClick={() => navigate('/doctor/prescriptions')}
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                View all
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-full skeleton flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 skeleton rounded w-3/4" />
                      <div className="h-3 skeleton rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : formattedActivity.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl">📋</span>
                <p className="text-sm text-gray-500 mt-3 font-medium">No activity yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Create your first prescription to see activity here.
                </p>
                <button
                  onClick={() => navigate('/doctor/create-prescription')}
                  className="mt-4 text-xs font-semibold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                >
                  + Create Prescription
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {formattedActivity.map((item, i) => (
                  <ActivityItem key={i} {...item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
