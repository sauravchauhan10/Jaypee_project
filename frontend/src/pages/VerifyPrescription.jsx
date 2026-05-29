// src/pages/VerifyPrescription.jsx
import { useEffect, useState } from 'react';
import { useParams, Link }     from 'react-router-dom';
import { verifyPrescription }  from '../services/verify.service';

// ─── Status badge config ───────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active: {
    label: 'Active',
    bg:    'bg-emerald-50',
    text:  'text-emerald-700',
    ring:  'ring-emerald-200',
    dot:   'bg-emerald-400',
  },
  completed: {
    label: 'Completed',
    bg:    'bg-blue-50',
    text:  'text-blue-700',
    ring:  'ring-blue-200',
    dot:   'bg-blue-400',
  },
  cancelled: {
    label: 'Cancelled',
    bg:    'bg-red-50',
    text:  'text-red-600',
    ring:  'ring-red-200',
    dot:   'bg-red-400',
  },
};

// ─── Info Row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1">
    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-36 flex-shrink-0">
      {label}
    </span>
    <span className="text-sm text-gray-800 font-medium">{value || '—'}</span>
  </div>
);

// ─── Section card ──────────────────────────────────────────────────────────────
const Card = ({ title, icon, children, accent = 'border-l-blue-500' }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden`}>
    <div className={`border-l-4 ${accent} px-5 py-4 border-b border-gray-100 flex items-center gap-2`}>
      <span className="text-lg">{icon}</span>
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{title}</h3>
    </div>
    <div className="px-5 py-4">{children}</div>
  </div>
);

// ─── Loading skeleton ──────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[80, 60, 90, 70].map((w, i) => (
      <div key={i} className={`h-4 bg-gray-200 rounded-full`} style={{ width: `${w}%` }} />
    ))}
  </div>
);

// ─── Verified stamp ────────────────────────────────────────────────────────────
const VerifiedStamp = ({ verifiedAt }) => (
  <div className="relative flex flex-col items-center">
    {/* Animated ring */}
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-emerald-400 opacity-20 animate-ping" />
      <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-200">
        <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>

    <p className="mt-4 text-2xl font-extrabold text-emerald-700 tracking-tight">
      VERIFIED
    </p>
    <p className="text-xs text-gray-400 mt-1">
      Checked at {new Date(verifiedAt).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      })} · {new Date(verifiedAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      })}
    </p>
  </div>
);

// ─── Error state ───────────────────────────────────────────────────────────────
const ErrorState = ({ message }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center border border-red-100">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-red-700 mb-2">Verification Failed</h2>
      <p className="text-sm text-gray-500 mb-6">{message}</p>
      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-5 py-2.5 rounded-xl transition"
      >
        Go to CareBridge
      </Link>
    </div>
  </div>
);

// ─── Main ──────────────────────────────────────────────────────────────────────
const VerifyPrescription = () => {
  const { prescriptionId } = useParams();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await verifyPrescription(prescriptionId);
        setData(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'This prescription could not be verified. It may have been removed.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [prescriptionId]);

  if (!loading && error) return <ErrorState message={error} />;

  const rx      = data?.prescription;
  const doctor  = data?.doctor;
  const patient = data?.patient;
  const status  = STATUS_CONFIG[rx?.status] || STATUS_CONFIG.active;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
      {/* ── Topbar ────────────────────────────────────────────────────────── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/60 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-black">Rx</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">CareBridge</p>
              <p className="text-xs text-blue-600 leading-tight">Prescription Verification</p>
            </div>
          </div>
          <Link
            to="/login"
            className="text-xs font-medium text-gray-500 hover:text-blue-600 transition"
          >
            Sign in →
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* ── Verified banner ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8 flex flex-col sm:flex-row items-center gap-8">
          {loading ? (
            <div className="w-28 h-28 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
          ) : (
            <div className="flex-shrink-0">
              <VerifiedStamp verifiedAt={data?.verifiedAt} />
            </div>
          )}

          <div className="flex-1 w-full">
            {loading ? <Skeleton /> : (
              <div className="space-y-3">
                {/* Rx ID */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-lg font-black text-gray-900">{rx?.shortId}</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ring-1 ${status.bg} ${status.text} ${status.ring}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>

                {/* Diagnosis */}
                <p className="text-base font-semibold text-gray-800 leading-snug">
                  {rx?.diagnosis}
                </p>

                {/* Date */}
                <p className="text-xs text-gray-500">
                  Issued on{' '}
                  <span className="font-semibold text-gray-700">
                    {new Date(rx?.date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                </p>

                {/* Digital badge */}
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-emerald-200 mt-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd" />
                  </svg>
                  Digitally Verified by CareBridge
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Doctor & Patient ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Doctor */}
          <Card title="Prescribing Doctor" icon="🩺" accent="border-l-blue-500">
            {loading ? <Skeleton /> : (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-base font-bold text-blue-700">
                    {doctor?.name?.charAt(0)}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-gray-900">Dr. {doctor?.name}</p>
                  <p className="text-xs text-gray-500">{doctor?.email}</p>
                  <div className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full mt-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified Doctor
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Patient */}
          <Card title="Patient" icon="👤" accent="border-l-violet-500">
            {loading ? <Skeleton /> : (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-base font-bold text-violet-700">
                    {patient?.name?.charAt(0)}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-gray-900">{patient?.name}</p>
                  <div className="flex gap-3 text-xs text-gray-500">
                    {patient?.age && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                        {patient.age} yrs
                      </span>
                    )}
                    {patient?.gender && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                        {patient.gender}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 italic">
                    Full name withheld for privacy
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* ── Medicines ────────────────────────────────────────────────────── */}
        <Card title="Prescribed Medicines" icon="💊" accent="border-l-emerald-500">
          {loading ? <Skeleton /> : (
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['#', 'Medicine', 'Dosage', 'Frequency', 'Duration'].map((h) => (
                      <th key={h} className="text-left pb-2.5 pr-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rx?.medicines?.map((med, i) => (
                    <tr key={i} className="hover:bg-gray-50/60 transition">
                      <td className="py-3 pr-4 text-xs text-gray-400 font-mono">{i + 1}</td>
                      <td className="py-3 pr-4 font-semibold text-gray-900">{med.name}</td>
                      <td className="py-3 pr-4 text-gray-600">
                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          {med.dosage}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 text-xs">{med.frequency}</td>
                      <td className="py-3 text-gray-600 text-xs">{med.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* ── Doctor's Notes ───────────────────────────────────────────────── */}
        {!loading && rx?.notes && (
          <Card title="Doctor's Notes" icon="📋" accent="border-l-amber-400">
            <p className="text-sm text-gray-700 leading-relaxed">{rx.notes}</p>
          </Card>
        )}

        {/* ── Trust footer ─────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-5 text-center">
          <p className="text-blue-200 text-xs leading-relaxed">
            This prescription was digitally generated and verified by{' '}
            <span className="text-white font-semibold">CareBridge</span>.
            {' '}Prescription ID: <span className="font-mono text-white">{rx?.shortId}</span>
            {' '}· Scan timestamp: {data?.verifiedAt && new Date(data.verifiedAt).toLocaleString('en-IN')}
          </p>
          <p className="text-blue-400 text-xs mt-2">
            🔒 Tamper-proof · End-to-end encrypted · HIPAA aligned
          </p>
        </div>
      </main>
    </div>
  );
};

export default VerifyPrescription;
