// src/pages/doctor/PatientRecords.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const GENDER_ICON = { male: '👨', female: '👩', other: '🧑' };
const COLORS      = ['bg-blue-500','bg-violet-500','bg-emerald-500','bg-rose-500','bg-amber-500','bg-cyan-500','bg-pink-500','bg-indigo-500'];

// ─── Skeleton row ──────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-b border-gray-50 animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full skeleton flex-shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3.5 skeleton rounded w-28" />
          <div className="h-3 skeleton rounded w-40" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4 hidden sm:table-cell"><div className="h-3.5 skeleton rounded w-16" /></td>
    <td className="px-6 py-4 hidden md:table-cell text-center"><div className="h-7 w-7 skeleton rounded-full mx-auto" /></td>
    <td className="px-6 py-4 hidden lg:table-cell"><div className="h-3 skeleton rounded w-20" /></td>
    <td className="px-6 py-4 text-center"><div className="h-5 skeleton rounded-full w-14 mx-auto" /></td>
    <td className="px-6 py-4 text-right"><div className="h-7 skeleton rounded-lg w-24 ml-auto" /></td>
  </tr>
);

// ─── Main ──────────────────────────────────────────────────────────────────────
const PatientRecords = () => {
  const navigate = useNavigate();

  const [patients,     setPatients]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [filterGender, setGender]       = useState('all');
  const [filterStatus, setStatus]       = useState('all');
  const [sortBy,       setSortBy]       = useState('name');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/patients');
        // Support both array and {patients:[]} shapes
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : (res.data?.data?.patients || []);
        setPatients(list);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load patients.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = [...patients];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q)
      );
    }

    if (filterGender !== 'all') list = list.filter((p) => p.gender === filterGender);
    if (filterStatus !== 'all') list = list.filter((p) =>
      filterStatus === 'active'
        ? (p.prescriptionCount || 0) > 0
        : (p.prescriptionCount || 0) === 0
    );

    list.sort((a, b) => {
      if (sortBy === 'name')          return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'prescriptions') return (b.prescriptionCount || 0) - (a.prescriptionCount || 0);
      if (sortBy === 'lastVisit')     return new Date(b.lastVisit || 0) - new Date(a.lastVisit || 0);
      return 0;
    });

    return list;
  }, [patients, search, filterGender, filterStatus, sortBy]);

  const totalRx = patients.reduce((s, p) => s + (p.prescriptionCount || 0), 0);

  const selectCls = 'px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer';

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Patient Records</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage all your registered patients.</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Patients', value: loading ? '—' : patients.length, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active',         value: loading ? '—' : patients.filter(p => (p.prescriptionCount || 0) > 0).length, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Total Rx',       value: loading ? '—' : totalRx, color: 'text-violet-600 bg-violet-50' },
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

      {/* Filters bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="patient-search"
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>
          <select id="filter-gender" value={filterGender} onChange={(e) => setGender(e.target.value)} className={selectCls}>
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <select id="filter-status" value={filterStatus} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
            <option value="all">All Status</option>
            <option value="active">Has Prescriptions</option>
            <option value="inactive">No Prescriptions</option>
          </select>
          <select id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectCls}>
            <option value="name">Sort: Name</option>
            <option value="prescriptions">Sort: Most Rx</option>
            <option value="lastVisit">Sort: Recent</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        {!loading && filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold text-base">
              {patients.length === 0 ? 'No patients registered yet' : 'No patients match your filters'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {patients.length === 0
                ? 'Patients appear here once they register and you create a prescription for them.'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Patient</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden sm:table-cell">Age / Gender</th>
                  <th className="text-center px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">Prescriptions</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">Last Visit</th>
                  <th className="text-center px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? [1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)
                  : filtered.map((patient, idx) => {
                    const rxCount  = patient.prescriptionCount || 0;
                    const isActive = rxCount > 0;
                    const lastVisit = patient.lastVisit
                      ? new Date(patient.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—';
                    const bgColor = COLORS[idx % COLORS.length];

                    return (
                      <tr key={patient._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
                              <span className="text-sm font-bold text-white">
                                {patient.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{patient.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-400">{patient.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className="text-gray-700">
                            {GENDER_ICON[patient.gender] || '🧑'} {patient.age ? `${patient.age} yrs` : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center hidden md:table-cell">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold text-sm">
                            {rxCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell text-gray-500 text-xs">
                          {lastVisit}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`badge ${isActive ? 'badge-green' : 'badge-gray'}`}>
                            {isActive ? 'active' : 'new'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              id={`prescribe-${patient._id}`}
                              onClick={() => navigate(`/doctor/create-prescription?patientId=${patient._id}`)}
                              className="text-xs text-white bg-blue-600 hover:bg-blue-700 font-medium px-2.5 py-1.5 rounded-lg transition"
                            >
                              Prescribe
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Count */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-3 px-1">
          Showing {filtered.length} of {patients.length} patient{patients.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default PatientRecords;
