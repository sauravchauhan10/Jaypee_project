// src/pages/patient/PrescriptionHistory.jsx
import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import DownloadPDFButton from '../../components/common/DownloadPDFButton';

const STATUS_STYLES = {
  active:    { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' },
  completed: { badge: 'bg-gray-100 text-gray-600',       dot: 'bg-gray-400' },
  cancelled: { badge: 'bg-red-100 text-red-600',         dot: 'bg-red-400' },
};

// ─── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 animate-pulse space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl skeleton flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 skeleton rounded w-1/4" />
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-1/2" />
      </div>
    </div>
  </div>
);

// ─── Prescription card ─────────────────────────────────────────────────────────
const PrescriptionCard = ({ rx, expanded, onToggle }) => {
  const s = STATUS_STYLES[rx.status] || STATUS_STYLES.active;

  const doctorName = rx.doctorId?.name || 'Unknown Doctor';
  const rxShortId  = rx._id?.toString().slice(-8).toUpperCase();
  const date       = new Date(rx.date || rx.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 shadow-card ${
      expanded ? 'border-emerald-300 shadow-emerald-100' : 'border-gray-100 hover:border-gray-200'
    }`}>
      {/* Header row */}
      <button
        id={`rx-card-${rx._id}`}
        onClick={onToggle}
        className="w-full text-left p-5 flex flex-col sm:flex-row sm:items-center gap-3"
      >
        {/* Rx icon */}
        <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-gray-400">RX-{rxShortId}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${s.badge}`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${s.dot}`} />
              {rx.status}
            </span>
          </div>
          <p className="font-semibold text-gray-900 truncate">{rx.diagnosis}</p>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="text-xs text-gray-500">{doctorName}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500">{date}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500">{rx.medicines?.length || 0} medicine{rx.medicines?.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <DownloadPDFButton
            prescriptionId={rx._id}
            variant="outline"
            size="sm"
            id={`download-rx-${rx._id}`}
          />
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-50 animate-fade-in">
          {/* Medicines table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left pb-2 pr-4">Medicine</th>
                  <th className="text-left pb-2 pr-4">Dosage</th>
                  <th className="text-left pb-2 pr-4 hidden sm:table-cell">Frequency</th>
                  <th className="text-left pb-2">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(rx.medicines || []).map((m, i) => (
                  <tr key={i}>
                    <td className="py-2.5 pr-4 font-medium text-gray-900">{m.name}</td>
                    <td className="py-2.5 pr-4 text-gray-500">{m.dosage}</td>
                    <td className="py-2.5 pr-4 text-gray-500 hidden sm:table-cell">{m.frequency}</td>
                    <td className="py-2.5 text-gray-500">{m.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {rx.notes && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-xs font-semibold text-amber-800 mb-1">📋 Doctor's Notes</p>
              <p className="text-xs text-amber-700">{rx.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────────
const PrescriptionHistory = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/prescriptions');
        setPrescriptions(res.data?.data?.prescriptions || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load prescriptions.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = [...prescriptions];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((rx) =>
        rx.diagnosis?.toLowerCase().includes(q) ||
        rx.doctorId?.name?.toLowerCase().includes(q) ||
        rx._id?.toString().includes(q)
      );
    }
    if (status !== 'all') list = list.filter((rx) => rx.status === status);
    return list;
  }, [search, status, prescriptions]);

  const total     = prescriptions.length;
  const active    = prescriptions.filter((r) => r.status === 'active').length;
  const completed = prescriptions.filter((r) => r.status === 'completed').length;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Prescriptions</h1>
        <p className="text-sm text-gray-500 mt-1">All prescriptions issued by your doctors.</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total',     value: loading ? '—' : total,     color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Active',    value: loading ? '—' : active,    color: 'bg-teal-50 text-teal-700' },
          { label: 'Completed', value: loading ? '—' : completed, color: 'bg-gray-50 text-gray-600' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 flex flex-col items-center ${s.color}`}>
            {loading
              ? <div className="h-7 w-8 skeleton rounded mb-1" />
              : <span className="text-2xl font-bold">{s.value}</span>
            }
            <span className="text-xs font-medium mt-0.5">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="rx-search"
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by diagnosis, doctor or ID…"
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            />
          </div>
          <select
            id="rx-status-filter"
            value={status} onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-700 text-base">
              {total === 0 ? 'No prescriptions yet' : 'No matching prescriptions'}
            </p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
              {total === 0
                ? 'Your prescriptions will appear here once your doctor issues one.'
                : 'Try changing your search or filter.'}
            </p>
          </div>
        ) : (
          filtered.map((rx) => (
            <PrescriptionCard
              key={rx._id}
              rx={rx}
              expanded={expanded === rx._id}
              onToggle={() => setExpanded(expanded === rx._id ? null : rx._id)}
            />
          ))
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-4 px-1">
          Showing {filtered.length} of {total} prescription{total !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default PrescriptionHistory;
