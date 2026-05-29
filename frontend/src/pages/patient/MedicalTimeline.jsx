// src/pages/patient/MedicalTimeline.jsx
import { useState, useEffect, useMemo } from 'react';
import { getTimeline }           from '../../services/timeline.service';
import MedicalTimelineComponent  from '../../components/common/MedicalTimelineComponent';

const STATUS_FILTERS = [
  { value: 'all',       label: 'All',       color: 'text-gray-700' },
  { value: 'active',    label: 'Active',    color: 'text-emerald-700' },
  { value: 'completed', label: 'Completed', color: 'text-blue-700' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-red-600' },
];

const MedicalTimeline = () => {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [filter,  setFilter]  = useState('all');
  const [search,  setSearch]  = useState('');

  // Fetch from real API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getTimeline();
        setEvents(data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your medical timeline.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Client-side filter + search
  const filtered = useMemo(() => {
    let list = [...events];
    if (filter !== 'all')     list = list.filter((e) => e.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) =>
        e.title?.toLowerCase().includes(q) ||
        e.doctor?.toLowerCase().includes(q) ||
        e.shortId?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [events, filter, search]);

  // Stats for the summary strip
  const stats = {
    total:     events.length,
    active:    events.filter((e) => e.status === 'active').length,
    completed: events.filter((e) => e.status === 'completed').length,
    medicines: events.reduce((sum, e) => sum + (e.medicineCount || 0), 0),
  };

  return (
    <div className="p-6 lg:p-8">
      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Medical Timeline</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your complete prescription and treatment history in chronological order.
        </p>
      </div>

      {/* ── Stats strip ───────────────────────────────────────────────── */}
      {!loading && events.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
          {[
            { label: 'Total Visits',   value: stats.total,     bg: 'bg-emerald-50 text-emerald-700',  icon: '🩺' },
            { label: 'Active Rx',      value: stats.active,    bg: 'bg-teal-50    text-teal-700',     icon: '✅' },
            { label: 'Completed',      value: stats.completed, bg: 'bg-slate-50   text-slate-600',    icon: '📋' },
            { label: 'Medicines Total', value: stats.medicines, bg: 'bg-violet-50  text-violet-700',  icon: '💊' },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-4 flex items-center gap-3 ${s.bg}`}>
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-xl font-bold leading-tight">{s.value}</p>
                <p className="text-xs font-medium opacity-80">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filter bar ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="timeline-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search disease, doctor, or Rx ID…"
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                id={`timeline-filter-${f.value}`}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                  filter === f.value
                    ? `bg-white shadow-sm ${f.color}`
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-xs text-gray-400 mt-2.5 pl-1">
            {filtered.length === events.length
              ? `${events.length} event${events.length !== 1 ? 's' : ''} total`
              : `${filtered.length} of ${events.length} events`}
          </p>
        )}
      </div>

      {/* ── Timeline ──────────────────────────────────────────────────── */}
      <MedicalTimelineComponent
        events={filtered}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default MedicalTimeline;
