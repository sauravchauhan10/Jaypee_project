// src/pages/doctor/PrescriptionList.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate }    from 'react-router-dom';
import {
  getPrescriptions,
  deletePrescription,
  updatePrescription,
} from '../../services/prescription.service';
import useDebounce       from '../../hooks/useDebounce';
import DownloadPDFButton from '../../components/common/DownloadPDFButton';

const STATUS_STYLES = {
  active:    'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100   text-gray-600',
  cancelled: 'bg-red-100    text-red-600',
};

const STATUS_OPTIONS = ['active', 'completed', 'cancelled'];

// ─── Confirmation modal ────────────────────────────────────────────────────────
const ConfirmModal = ({ isOpen, onConfirm, onCancel, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 btn-secondary">Cancel</button>
          <button
            id="confirm-delete-btn"
            onClick={onConfirm}
            className="flex-1 py-2 px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Edit Status Modal ─────────────────────────────────────────────────────────
const EditStatusModal = ({ rx, isOpen, onClose, onSave }) => {
  const [status, setStatus] = useState(rx?.status || 'active');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (rx) setStatus(rx.status); }, [rx]);

  if (!isOpen || !rx) return null;

  const handleSave = async () => {
    setLoading(true);
    await onSave(rx._id, { status });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Update Prescription Status</h3>
        <p className="text-sm text-gray-500 mb-2">{rx.diagnosis}</p>
        <p className="text-xs text-gray-400 mb-5">
          Patient: {rx.patientId?.name} · {new Date(rx.date).toLocaleDateString('en-IN')}
        </p>
        <div className="space-y-2 mb-6">
          {STATUS_OPTIONS.map((s) => (
            <label
              key={s}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                status === s
                  ? 'border-primary-400 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio" name="status" value={s}
                checked={status === s}
                onChange={() => setStatus(s)}
                className="accent-primary-600"
              />
              <span className={`text-sm font-medium capitalize px-2.5 py-0.5 rounded-full ${STATUS_STYLES[s]}`}>
                {s}
              </span>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
          <button
            id="save-status-btn"
            onClick={handleSave}
            disabled={loading}
            className="flex-1 btn-primary gap-2"
          >
            {loading && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────────
const PrescriptionList = () => {
  const navigate = useNavigate();

  const [prescriptions, setPrescriptions] = useState([]);
  const [pagination,    setPagination]    = useState({ total: 0, page: 1, pages: 1 });
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState('');
  const [page,          setPage]          = useState(1);

  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [editTarget,   setEditTarget]     = useState(null);
  const [actionLoading, setActionLoading] = useState('');

  const debouncedSearch = useDebounce(search, 400);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getPrescriptions({
        page,
        limit:  10,
        status: statusFilter || undefined,
        search: debouncedSearch || undefined,
      });
      setPrescriptions(data.prescriptions);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [statusFilter, debouncedSearch]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget._id);
    try {
      await deletePrescription(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleStatusUpdate = async (id, payload) => {
    try {
      await updatePrescription(id, payload);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Prescription"
        message={`Are you sure you want to permanently delete "${deleteTarget?.diagnosis}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <EditStatusModal
        rx={editTarget}
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleStatusUpdate}
      />

      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
            <p className="text-sm text-gray-500 mt-1">Manage all prescriptions you've issued.</p>
          </div>
          <button
            id="new-prescription-btn"
            onClick={() => navigate('/doctor/create-prescription')}
            className="btn-primary gap-2 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Prescription
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total',     value: pagination.total,                                                         color: 'bg-primary-50 text-primary-700' },
            { label: 'Active',    value: prescriptions.filter(p => p.status === 'active').length,    color: 'bg-emerald-50 text-emerald-700' },
            { label: 'Completed', value: prescriptions.filter(p => p.status === 'completed').length, color: 'bg-gray-50 text-gray-600' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 flex flex-col items-center ${s.color}`}>
              <span className="text-2xl font-bold">{s.value}</span>
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
                placeholder="Search by diagnosis…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
              />
            </div>
            <select
              id="rx-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer"
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading prescriptions…</p>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-medium text-gray-500">No prescriptions found</p>
              <button
                onClick={() => navigate('/doctor/create-prescription')}
                className="mt-3 btn-primary text-sm"
              >
                Create your first prescription
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    {['Patient', 'Diagnosis', 'Date', 'Medicines', 'Status', 'Actions'].map((h) => (
                      <th key={h} className={`px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider ${
                        h === 'Actions' ? 'text-right' : h === 'Medicines' || h === 'Status' ? 'text-center hidden sm:table-cell' : 'text-left'
                      }`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {prescriptions.map((rx) => (
                    <tr key={rx._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary-700">
                              {rx.patientId?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{rx.patientId?.name || '—'}</p>
                            <p className="text-xs text-gray-400">{rx.patientId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 max-w-xs truncate">{rx.diagnosis}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(rx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-center hidden sm:table-cell">
                        <span className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 text-xs font-bold inline-flex items-center justify-center">
                          {rx.medicines?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center hidden sm:table-cell">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[rx.status]}`}>
                          {rx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <DownloadPDFButton
                            prescriptionId={rx._id}
                            patientName={rx.patientId?.name}
                            variant="icon"
                            size="sm"
                            id={`download-pdf-${rx._id}`}
                          />
                          <button
                            id={`edit-status-${rx._id}`}
                            onClick={() => setEditTarget(rx)}
                            title="Update status"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            id={`delete-rx-${rx._id}`}
                            onClick={() => setDeleteTarget(rx)}
                            disabled={actionLoading === rx._id}
                            title="Delete prescription"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-40"
                          >
                            {actionLoading === rx._id ? (
                              <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4 px-1">
            <p className="text-xs text-gray-400">
              Page {pagination.page} of {pagination.pages} · {pagination.total} total
            </p>
            <div className="flex gap-2">
              <button
                id="prev-page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                Previous
              </button>
              <button
                id="next-page-btn"
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PrescriptionList;
