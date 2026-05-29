// src/pages/patient/Reminders.jsx
import { useState, useEffect } from 'react';
import {
  getReminders, createReminder, updateReminder,
  deleteReminder, toggleReminder, sendTestEmail,
} from '../../services/reminder.service';

// ─── Day labels ────────────────────────────────────────────────────────────────
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
};

// ─── Modal ─────────────────────────────────────────────────────────────────────
const ReminderModal = ({ initial, onSave, onClose, saving }) => {
  const [form, setForm] = useState({
    medicineName: initial?.medicineName || '',
    dosage:       initial?.dosage       || '',
    notes:        initial?.notes        || '',
    time:         initial?.time         || '08:00',
    daysOfWeek:   initial?.daysOfWeek   || [],
  });

  const toggleDay = (d) =>
    setForm((p) => ({
      ...p,
      daysOfWeek: p.daysOfWeek.includes(d)
        ? p.daysOfWeek.filter((x) => x !== d)
        : [...p.daysOfWeek, d].sort((a, b) => a - b),
    }));

  const handleSubmit = (e) => { e.preventDefault(); onSave(form); };

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-base">
            {initial ? 'Edit Reminder' : 'New Reminder'}
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Medicine name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Medicine Name <span className="text-red-500">*</span>
            </label>
            <input
              id="reminder-medicine"
              type="text" required value={form.medicineName}
              onChange={(e) => setForm((p) => ({ ...p, medicineName: e.target.value }))}
              placeholder="e.g. Amoxicillin"
              className={inputCls}
            />
          </div>

          {/* Dosage + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Dosage</label>
              <input
                id="reminder-dosage"
                type="text" value={form.dosage}
                onChange={(e) => setForm((p) => ({ ...p, dosage: e.target.value }))}
                placeholder="e.g. 500mg"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                id="reminder-time"
                type="time" required value={form.time}
                onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>

          {/* Days of week */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Days <span className="text-gray-400 font-normal">(empty = every day)</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {DAY_LABELS.map((d, i) => (
                <button
                  key={d} type="button"
                  id={`day-btn-${d}`}
                  onClick={() => toggleDay(i)}
                  className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${
                    form.daysOfWeek.includes(i)
                      ? 'bg-emerald-500 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            {form.daysOfWeek.length === 0 && (
              <p className="text-[11px] text-gray-400 mt-1.5">Will fire every day at the set time.</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="reminder-notes"
              rows={2} value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Special instructions, e.g. Take after meals"
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button id="reminder-submit" type="submit" disabled={saving}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {initial ? 'Save Changes' : 'Create Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Reminder Card ─────────────────────────────────────────────────────────────
const ReminderCard = ({ reminder, onEdit, onDelete, onToggle, onTest }) => {
  const [testLoading, setTestLoading] = useState(false);
  const [testMsg,     setTestMsg]     = useState('');

  const handleTest = async () => {
    setTestLoading(true);
    setTestMsg('');
    try {
      await onTest(reminder._id);
      setTestMsg('✅ Test email sent!');
      setTimeout(() => setTestMsg(''), 4000);
    } catch {
      setTestMsg('❌ Failed to send test email.');
      setTimeout(() => setTestMsg(''), 4000);
    } finally {
      setTestLoading(false);
    }
  };

  const activeDays = reminder.daysOfWeek?.length > 0
    ? reminder.daysOfWeek.map((d) => DAY_LABELS[d]).join(' · ')
    : 'Every day';

  return (
    <div className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 overflow-hidden
      ${reminder.isActive
        ? 'border-emerald-200 hover:shadow-md hover:border-emerald-300'
        : 'border-gray-200 opacity-70 hover:opacity-90'
      }`}
    >
      {/* Top accent */}
      <div className={`h-1 w-full ${reminder.isActive ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-gray-200'}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              reminder.isActive ? 'bg-emerald-100' : 'bg-gray-100'
            }`}>
              <span className="text-xl">💊</span>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-sm truncate">{reminder.medicineName}</h3>
              {reminder.dosage && (
                <p className="text-xs text-gray-500 truncate">{reminder.dosage}</p>
              )}
            </div>
          </div>

          {/* Toggle switch */}
          <button
            id={`toggle-${reminder._id}`}
            onClick={() => onToggle(reminder._id)}
            title={reminder.isActive ? 'Disable reminder' : 'Enable reminder'}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${
              reminder.isActive ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
              reminder.isActive ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Time + Days */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Time badge */}
          <div className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl ${
            reminder.isActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {fmtTime(reminder.time)}
          </div>

          {/* Days */}
          <div className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {activeDays}
          </div>

          {/* Status */}
          <div className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${
            reminder.isActive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-gray-50 text-gray-500 border-gray-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${reminder.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
            {reminder.isActive ? 'Active' : 'Paused'}
          </div>
        </div>

        {/* Notes */}
        {reminder.notes && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-4">
            <p className="text-xs text-amber-700 leading-relaxed">📋 {reminder.notes}</p>
          </div>
        )}

        {/* Test email message */}
        {testMsg && (
          <p className="text-xs mb-3 font-medium text-center">{testMsg}</p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {/* Test email */}
          <button
            id={`test-email-${reminder._id}`}
            onClick={handleTest}
            disabled={testLoading}
            title="Send test email now"
            className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
          >
            {testLoading
              ? <span className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            }
            Test Email
          </button>

          {/* Edit */}
          <button
            id={`edit-reminder-${reminder._id}`}
            onClick={() => onEdit(reminder)}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit
          </button>

          {/* Delete */}
          <button
            id={`delete-reminder-${reminder._id}`}
            onClick={() => onDelete(reminder._id)}
            className="ml-auto flex items-center gap-1.5 text-xs font-medium text-red-500 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────────
const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const load = async () => {
    try {
      const res = await getReminders();
      setReminders(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reminders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit   = (r)  => { setEditTarget(r);  setModalOpen(true); };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editTarget) {
        await updateReminder(editTarget._id, form);
        showToast('✅ Reminder updated');
      } else {
        await createReminder(form);
        showToast('✅ Reminder created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(`❌ ${err.response?.data?.message || 'Save failed'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await deleteReminder(id);
      setReminders((p) => p.filter((r) => r._id !== id));
      showToast('🗑️ Reminder deleted');
    } catch {
      showToast('❌ Delete failed');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleReminder(id);
      setReminders((p) => p.map((r) => r._id === id ? res.data.data : r));
      const updated = res.data.data;
      showToast(updated.isActive ? '✅ Reminder enabled' : '⏸️ Reminder paused');
    } catch {
      showToast('❌ Toggle failed');
    }
  };

  const handleTest = async (id) => {
    await sendTestEmail(id);
  };

  const active  = reminders.filter((r) => r.isActive);
  const paused  = reminders.filter((r) => !r.isActive);

  return (
    <>
      {/* Modal */}
      {modalOpen && (
        <ReminderModal
          initial={editTarget}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
          saving={saving}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl animate-fade-in">
          {toast}
        </div>
      )}

      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medicine Reminders</h1>
            <p className="text-sm text-gray-500 mt-1">
              Set daily email reminders to never miss a dose.
            </p>
          </div>
          <button
            id="create-reminder-btn"
            onClick={openCreate}
            className="self-start sm:self-auto flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Reminder
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-7">
          {[
            { label: 'Total',   value: reminders.length, bg: 'bg-gray-50 text-gray-700',      icon: '💊' },
            { label: 'Active',  value: active.length,    bg: 'bg-emerald-50 text-emerald-700', icon: '✅' },
            { label: 'Paused',  value: paused.length,    bg: 'bg-amber-50 text-amber-700',     icon: '⏸️' },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-4 flex items-center gap-3 ${s.bg}`}>
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs font-medium opacity-75">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-7 flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-800">How reminders work</p>
            <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
              Email reminders are sent automatically to your registered email address at the set time every day (or on selected days). Click "Test Email" on any reminder to receive it instantly.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-200" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-200 rounded-full w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                  </div>
                </div>
                <div className="h-9 bg-gray-100 rounded-xl" />
                <div className="h-8 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : reminders.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <span className="text-5xl">⏰</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No reminders set</h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto mb-5">
              Create your first medicine reminder and we'll email you at the right time every day.
            </p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create First Reminder
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reminders.map((r) => (
              <ReminderCard
                key={r._id}
                reminder={r}
                onEdit={openEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
                onTest={handleTest}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Reminders;
