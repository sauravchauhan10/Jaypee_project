// src/pages/patient/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, gradient, loading }) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 text-white ${gradient} shadow-lg`}>
    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
    <div className="absolute -right-1 -bottom-6 w-16 h-16 rounded-full bg-white/10" />
    <div className="relative">
      <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center mb-4">
        {icon}
      </div>
      {loading ? (
        <div className="h-8 w-12 bg-white/20 rounded-lg animate-pulse mb-1" />
      ) : (
        <p className="text-3xl font-bold mb-1">{value}</p>
      )}
      <p className="text-sm font-semibold opacity-90">{label}</p>
      {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
    </div>
  </div>
);

// ─── Reminder pill ─────────────────────────────────────────────────────────────
const ReminderPill = ({ medicine, dosage, time, isActive }) => {
  const fmtTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  };
  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-700">
      <div className="flex items-center gap-3">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
        <div>
          <p className="text-sm font-semibold">{medicine}</p>
          {dosage && <p className="text-xs opacity-70">{dosage}</p>}
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-semibold">{fmtTime(time)}</p>
        <p className="text-xs opacity-70">{isActive ? 'Active' : 'Paused'}</p>
      </div>
    </div>
  );
};

// ─── Visit card (from real prescriptions) ─────────────────────────────────────
const VisitCard = ({ rx }) => {
  const doctorName = rx.doctorId?.name || 'Unknown Doctor';
  const date = new Date(rx.date || rx.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all duration-200">
      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
        <span className="text-base font-bold text-emerald-700">{doctorName.charAt(0)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{doctorName}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{rx.diagnosis}</p>
        <p className="text-xs text-gray-400 mt-1">{date}</p>
      </div>
      <span className="badge badge-green text-xs flex-shrink-0">
        {rx.medicines?.length || 0} Rx
      </span>
    </div>
  );
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 animate-pulse">
    <div className="w-8 h-8 rounded-full skeleton" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 skeleton rounded w-2/3" />
      <div className="h-2.5 skeleton rounded w-1/2" />
    </div>
  </div>
);

// ─── Main ──────────────────────────────────────────────────────────────────────
const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [prescriptions, setPrescriptions] = useState([]);
  const [reminders,     setReminders]     = useState([]);
  const [loading,       setLoading]       = useState(true);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [rxRes, remRes] = await Promise.all([
          api.get('/prescriptions?limit=5'),
          api.get('/reminders'),
        ]);
        setPrescriptions(rxRes.data?.data?.prescriptions || []);
        setReminders(remRes.data?.data || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Derived stats from real data
  const totalRx       = prescriptions.length;
  const activeRx      = prescriptions.filter((r) => r.status === 'active');
  const activeMeds    = activeRx.reduce((sum, rx) => sum + (rx.medicines?.length || 0), 0);
  const activeReminders = reminders.filter((r) => r.isActive);
  const recentVisits  = prescriptions.slice(0, 3);

  const stats = [
    {
      label:    'Total Prescriptions',
      value:    loading ? '—' : totalRx,
      sub:      totalRx === 0 ? 'Awaiting your first prescription' : `${activeRx.length} currently active`,
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
    {
      label:    'Active Medicines',
      value:    loading ? '—' : activeMeds,
      sub:      activeMeds === 0 ? 'No active prescriptions' : 'Currently prescribed',
      gradient: 'bg-gradient-to-br from-teal-500 to-teal-700',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    },
    {
      label:    "Today's Reminders",
      value:    loading ? '—' : activeReminders.length,
      sub:      activeReminders.length === 0 ? 'No reminders set' : `${activeReminders.length} active reminder${activeReminders.length > 1 ? 's' : ''}`,
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    },
    {
      label:    'Doctor Visits',
      value:    loading ? '—' : totalRx,
      sub:      totalRx === 0 ? 'No consultations yet' : 'Total consultations',
      gradient: 'bg-gradient-to-br from-violet-500 to-violet-700',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">{today}</p>
        </div>
        <button
          id="view-prescriptions-btn"
          onClick={() => navigate('/patient/prescriptions')}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          My Prescriptions
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 stagger-children">
        {stats.map((s, i) => <StatCard key={i} {...s} loading={loading} />)}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Today's reminders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">My Reminders</h2>
            {activeReminders.length > 0 && (
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                {activeReminders.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-2.5">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 skeleton rounded-xl" />
              ))}
            </div>
          ) : activeReminders.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-3xl">⏰</span>
              <p className="text-sm text-gray-500 mt-2">No reminders set</p>
              <p className="text-xs text-gray-400 mt-1">Add reminders from the Reminders page</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeReminders.slice(0, 3).map((r) => (
                <ReminderPill
                  key={r._id}
                  medicine={r.medicineName}
                  dosage={r.dosage}
                  time={r.time}
                  isActive={r.isActive}
                />
              ))}
            </div>
          )}

          <button
            id="view-all-reminders"
            onClick={() => navigate('/patient/reminders')}
            className="mt-4 w-full py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-xl transition border border-emerald-200"
          >
            {activeReminders.length === 0 ? 'Set a Reminder' : 'View All Reminders'}
          </button>
        </div>

        {/* Recent doctor visits / prescriptions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">Recent Doctor Visits</h2>
            <button
              onClick={() => navigate('/patient/prescriptions')}
              className="text-xs text-emerald-600 font-medium hover:underline"
            >
              View all
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
            </div>
          ) : recentVisits.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-4xl">🏥</span>
              <p className="text-sm text-gray-500 mt-3 font-medium">No doctor visits yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Your prescriptions will appear here once a doctor issues one.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentVisits.map((rx) => (
                <VisitCard key={rx._id} rx={rx} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info card — show instead of fake health summary */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-emerald-900">Your Health Overview</h3>
            <p className="text-sm text-emerald-700 mt-1">
              {totalRx === 0
                ? 'No prescriptions yet. Once your doctor issues a prescription, your health data will appear here.'
                : `You have ${totalRx} prescription${totalRx > 1 ? 's' : ''} on record, ${activeRx.length} currently active with ${activeMeds} medicine${activeMeds !== 1 ? 's' : ''} prescribed.`
              }
            </p>
            {reminders.length > 0 && (
              <p className="text-xs text-emerald-600 mt-2">
                💊 You have {reminders.length} medicine reminder{reminders.length > 1 ? 's' : ''} set up.
              </p>
            )}
          </div>
        </div>
        {totalRx === 0 && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => navigate('/patient/reminders')}
              className="text-xs font-semibold bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition"
            >
              Set Medicine Reminder
            </button>
            <button
              onClick={() => navigate('/patient/timeline')}
              className="text-xs font-semibold border border-emerald-300 text-emerald-700 px-4 py-2 rounded-xl hover:bg-emerald-50 transition"
            >
              View Timeline
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
