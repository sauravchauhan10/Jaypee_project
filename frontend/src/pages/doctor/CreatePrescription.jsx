// src/pages/doctor/CreatePrescription.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPrescription, searchPatients } from '../../services/prescription.service';
import useDebounce from '../../hooks/useDebounce';

const EMPTY_MEDICINE = { name: '', dosage: '', frequency: '', duration: '' };

const FREQUENCY_OPTIONS = [
  'Once daily', 'Twice daily', 'Three times daily',
  'Every 4 hours', 'Every 6 hours', 'Every 8 hours',
  'Every 12 hours', 'As needed (PRN)', 'Before meals', 'After meals', 'At bedtime',
];

const DURATION_OPTIONS = [
  '3 days', '5 days', '7 days', '10 days', '14 days',
  '21 days', '1 month', '2 months', '3 months', 'Ongoing',
];

const inputCls  = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition bg-white placeholder-gray-400';
const selectCls = `${inputCls} appearance-none cursor-pointer`;

// ─── Section header ────────────────────────────────────────────────────────────
const Section = ({ num, title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 flex items-center gap-2">
      <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
        {num}
      </span>
      {title}
    </h2>
    {children}
  </div>
);

// ─── Patient search dropdown ───────────────────────────────────────────────────
const PatientSearch = ({ selected, onSelect }) => {
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [open,     setOpen]     = useState(false);
  const debounced = useDebounce(query, 400);
  const wrapperRef = useRef(null);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (debounced.length < 2) { setResults([]); return; }
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await searchPatients(debounced);
        setResults(data || []);
        setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, [debounced]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (patient) => {
    onSelect(patient);
    setQuery('');
    setOpen(false);
    setResults([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {selected ? (
        // Selected patient chip
        <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50">
          <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">{selected.name.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-emerald-900 text-sm truncate">{selected.name}</p>
            <p className="text-xs text-emerald-600 truncate">{selected.email}</p>
          </div>
          <button
            type="button"
            id="clear-patient"
            onClick={() => onSelect(null)}
            className="w-6 h-6 rounded-full bg-emerald-200 hover:bg-emerald-300 flex items-center justify-center transition text-emerald-700"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <>
          {/* Search input */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="patient-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              placeholder="Search by patient name or email…"
              autoComplete="off"
              className={`${inputCls} pl-10`}
            />
            {loading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {/* Dropdown */}
          {open && (
            <div className="absolute z-30 mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
              {results.length === 0 && !loading ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  {query.length >= 2 ? 'No patients found' : 'Type at least 2 characters'}
                </div>
              ) : (
                <ul className="max-h-52 overflow-y-auto divide-y divide-gray-50">
                  {results.map((p) => (
                    <li
                      key={p._id}
                      id={`patient-result-${p._id}`}
                      onClick={() => handleSelect(p)}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-primary-50 transition"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary-700">{p.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-500 truncate">{p.email}</p>
                      </div>
                      {p.age && (
                        <span className="text-xs text-gray-400 flex-shrink-0">{p.age} yrs</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── Medicine row ──────────────────────────────────────────────────────────────
const MedicineRow = ({ med, idx, onChange, onRemove, canRemove }) => (
  <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 relative group">
    {canRemove && (
      <button
        type="button"
        onClick={onRemove}
        id={`remove-medicine-${idx}`}
        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
    <p className="text-xs font-semibold text-gray-400 mb-3">Medicine #{idx + 1}</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="sm:col-span-2 lg:col-span-1">
        <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
        <input
          type="text" value={med.name} placeholder="e.g. Amoxicillin"
          onChange={(e) => onChange(idx, 'name', e.target.value)}
          required className={inputCls}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Dosage *</label>
        <input
          type="text" value={med.dosage} placeholder="e.g. 500mg"
          onChange={(e) => onChange(idx, 'dosage', e.target.value)}
          required className={inputCls}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Frequency *</label>
        <select
          value={med.frequency}
          onChange={(e) => onChange(idx, 'frequency', e.target.value)}
          required className={selectCls}
        >
          <option value="">Select</option>
          {FREQUENCY_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Duration *</label>
        <select
          value={med.duration}
          onChange={(e) => onChange(idx, 'duration', e.target.value)}
          required className={selectCls}
        >
          <option value="">Select</option>
          {DURATION_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const CreatePrescription = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form, setForm] = useState({
    diagnosis: '',
    notes:     '',
    date:      new Date().toISOString().split('T')[0],
    medicines: [{ ...EMPTY_MEDICINE }],
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Medicine handlers
  const updateMedicine = (idx, field, value) => {
    setForm((prev) => {
      const meds = [...prev.medicines];
      meds[idx] = { ...meds[idx], [field]: value };
      return { ...prev, medicines: meds };
    });
  };

  const addMedicine = () => {
    if (form.medicines.length >= 10) return;
    setForm((prev) => ({ ...prev, medicines: [...prev.medicines, { ...EMPTY_MEDICINE }] }));
  };

  const removeMedicine = (idx) => {
    if (form.medicines.length === 1) return;
    setForm((prev) => ({ ...prev, medicines: prev.medicines.filter((_, i) => i !== idx) }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedPatient) {
      return setError('Please select a patient before creating the prescription.');
    }

    const hasEmptyMed = form.medicines.some(
      (m) => !m.name.trim() || !m.dosage.trim() || !m.frequency || !m.duration
    );
    if (hasEmptyMed) {
      return setError('Please fill in all medicine fields.');
    }

    setLoading(true);
    try {
      await createPrescription({
        patientId: selectedPatient._id,
        diagnosis: form.diagnosis,
        medicines: form.medicines,
        notes:     form.notes,
        date:      form.date,
      });
      setSuccess('Prescription created successfully!');
      setTimeout(() => navigate('/doctor/prescriptions'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/doctor')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create Prescription</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in all details to issue a digital prescription.</p>
      </div>

      {/* Alerts */}
      {error && (
        <div id="cp-error" className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div id="cp-success" className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      <form id="create-prescription-form" onSubmit={handleSubmit} className="space-y-6">
        {/* ── Step 1: Patient ─────────────────────────────────────────── */}
        <Section num="1" title="Select Patient">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Patient <span className="text-red-500">*</span>
              </label>
              <PatientSearch selected={selectedPatient} onSelect={setSelectedPatient} />
              {!selectedPatient && (
                <p className="text-xs text-gray-400 mt-1.5">
                  Search for a registered patient by name or email.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Prescription Date <span className="text-red-500">*</span>
              </label>
              <input
                id="prescription-date" type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                required className={inputCls}
              />
            </div>
          </div>
        </Section>

        {/* ── Step 2: Diagnosis ───────────────────────────────────────── */}
        <Section num="2" title="Diagnosis">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Diagnosis / Condition <span className="text-red-500">*</span>
          </label>
          <textarea
            id="diagnosis" rows={3}
            value={form.diagnosis}
            onChange={(e) => setForm((p) => ({ ...p, diagnosis: e.target.value }))}
            placeholder="e.g. Acute upper respiratory tract infection"
            required className={`${inputCls} resize-none`}
          />
        </Section>

        {/* ── Step 3: Medicines ───────────────────────────────────────── */}
        <Section num="3" title="Medicines">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-500">
              {form.medicines.length} medicine{form.medicines.length !== 1 ? 's' : ''} added
            </p>
            <button
              id="add-medicine-btn"
              type="button" onClick={addMedicine}
              disabled={form.medicines.length >= 10}
              className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition disabled:opacity-40"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Medicine
            </button>
          </div>
          <div className="space-y-3">
            {form.medicines.map((med, idx) => (
              <MedicineRow
                key={idx}
                med={med} idx={idx}
                onChange={updateMedicine}
                onRemove={() => removeMedicine(idx)}
                canRemove={form.medicines.length > 1}
              />
            ))}
          </div>
        </Section>

        {/* ── Step 4: Notes ───────────────────────────────────────────── */}
        <Section num="4" title="Additional Notes">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Doctor's Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="notes" rows={3}
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Any special instructions, warnings, or follow-up notes…"
            className={`${inputCls} resize-none`}
          />
        </Section>

        {/* ── Actions ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pb-4">
          <button type="button" onClick={() => navigate('/doctor')} className="btn-secondary">
            Cancel
          </button>
          <button
            id="cp-submit" type="submit" disabled={loading}
            className="btn-primary gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Create Prescription
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePrescription;
