// src/components/common/MedicalTimelineComponent.jsx
import { useState } from 'react';
import DownloadPDFButton from './DownloadPDFButton';

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  active: {
    label: 'Active',
    badge: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
    dot:   'bg-emerald-500',
  },
  completed: {
    label: 'Completed',
    badge: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    dot:   'bg-slate-400',
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-red-100 text-red-600 ring-1 ring-red-200',
    dot:   'bg-red-400',
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

const fmtMonth = (d) =>
  new Date(d).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

const groupByMonth = (events) => {
  const map = new Map();
  events.forEach((e) => {
    const key = fmtMonth(e.date);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(e);
  });
  return [...map.entries()]; // [ [month, events[]], ... ]
};

// ─── Medicine chip ─────────────────────────────────────────────────────────────
const MedChip = ({ med }) => (
  <div className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <span className="text-xs font-semibold text-gray-800">{med.name}</span>
      <span className="text-xs text-gray-400 ml-1.5">{med.dosage}</span>
      <div className="flex flex-wrap gap-1.5 mt-1">
        <span className="inline-block text-[10px] bg-blue-50 text-blue-600 font-medium px-1.5 py-0.5 rounded">
          {med.frequency}
        </span>
        <span className="inline-block text-[10px] bg-violet-50 text-violet-600 font-medium px-1.5 py-0.5 rounded">
          {med.duration}
        </span>
      </div>
    </div>
  </div>
);

// ─── Timeline Card ─────────────────────────────────────────────────────────────
const TimelineCard = ({ event, side, isLast }) => {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS[event.status] || STATUS.active;

  // On mobile always full-width; on desktop alternate sides
  const isLeft = side === 'left';

  return (
    <div className={`relative flex items-start gap-0 w-full
      ${isLeft ? 'lg:flex-row-reverse' : 'lg:flex-row'}
    `}>

      {/* ── Card body (takes 45% on desktop) ───────────────────────────── */}
      <div className={`w-full lg:w-[45%] ${isLeft ? 'lg:mr-auto lg:pl-0 lg:pr-8' : 'lg:ml-auto lg:pl-8'}`}>
        <div
          className={`
            bg-white rounded-2xl border border-gray-100 shadow-md
            hover:shadow-lg hover:border-emerald-200
            transition-all duration-300 overflow-hidden
            ${expanded ? 'shadow-lg border-emerald-200' : ''}
          `}
        >
          {/* Top colour strip */}
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-400" />

          {/* Header */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full text-left p-5 group"
          >
            {/* Date + Status row */}
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">{fmtDate(event.date)}</p>
                  {event.createdAt && (
                    <p className="text-[10px] text-gray-400">{fmtTime(event.createdAt)}</p>
                  )}
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${s.badge}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${s.dot}`} />
                {s.label}
              </span>
            </div>

            {/* Diagnosis (Disease) */}
            <h4 className="text-sm font-bold text-gray-900 leading-snug mb-2 group-hover:text-emerald-700 transition-colors">
              {event.title}
            </h4>

            {/* Doctor row */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-blue-700">
                  {event.doctor?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">Dr. {event.doctor}</p>
                {event.doctorEmail && (
                  <p className="text-[10px] text-gray-400">{event.doctorEmail}</p>
                )}
              </div>
            </div>

            {/* Meta pills row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Rx ID */}
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {event.shortId}
              </span>

              {/* Medicine count */}
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                💊 {event.medicineCount} medicine{event.medicineCount !== 1 ? 's' : ''}
              </span>

              {/* Expand caret */}
              <span className="ml-auto">
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </button>

          {/* Expanded content */}
          {expanded && (
            <div className="border-t border-gray-50 px-5 pb-5">
              {/* Medicines */}
              {event.medicines?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Prescribed Medicines
                  </p>
                  <div className="bg-gray-50 rounded-xl px-3 py-1">
                    {event.medicines.map((med, i) => (
                      <MedChip key={i} med={med} />
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {event.notes && (
                <div className="mt-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Doctor's Notes
                  </p>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-800 leading-relaxed">
                    {event.notes}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <DownloadPDFButton
                  prescriptionId={event.id}
                  patientName={event.doctor}
                  variant="outline"
                  size="sm"
                  id={`timeline-download-${event.id}`}
                />
                <a
                  href={`/verify/${event.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:bg-violet-50 px-3 py-1.5 rounded-lg border border-violet-200 transition"
                  id={`timeline-verify-${event.id}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Verify
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Mobile date label (below card) */}
        <div className="lg:hidden mt-2 ml-1 text-xs text-gray-400 font-medium">
          {fmtDate(event.date)}
        </div>
      </div>

      {/* ── Center dot + line (desktop only) ───────────────────────────── */}
      <div className="hidden lg:flex flex-col items-center w-[10%] relative">
        {/* Dot */}
        <div className="relative z-10 mt-6">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 ring-4 ring-white shadow-md" />
        </div>
        {/* Vertical line segment */}
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-emerald-200 to-transparent mt-1" />
        )}
      </div>

      {/* ── Empty spacer to push card to correct side (desktop) ─────────── */}
      <div className="hidden lg:block lg:w-[45%]" />
    </div>
  );
};

// ─── Month separator ───────────────────────────────────────────────────────────
const MonthSeparator = ({ label, count }) => (
  <div className="flex items-center gap-4 py-2">
    <div className="hidden lg:block flex-1 h-px bg-gray-100" />
    <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm flex-shrink-0">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {label}
      <span className="bg-white/20 px-1.5 py-0.5 rounded-full">{count}</span>
    </div>
    <div className="hidden lg:block flex-1 h-px bg-gray-100" />
  </div>
);

// ─── Empty state ───────────────────────────────────────────────────────────────
const EmptyTimeline = () => (
  <div className="flex flex-col items-center py-20 text-center">
    <div className="relative mb-6">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">No medical history yet</h3>
    <p className="text-sm text-gray-400 max-w-xs">
      Your prescriptions and doctor visits will appear here once your doctor issues one.
    </p>
  </div>
);

// ─── Loading skeleton ──────────────────────────────────────────────────────────
const SkeletonCard = ({ isLeft }) => (
  <div className={`relative flex items-start w-full ${isLeft ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
    <div className="w-full lg:w-[45%] lg:px-8 animate-pulse">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-3 bg-gray-200 rounded-full w-32" />
          <div className="h-5 bg-gray-100 rounded-full w-16" />
        </div>
        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-200" />
          <div className="h-3 bg-gray-200 rounded-full w-24" />
        </div>
        <div className="flex gap-2">
          <div className="h-4 bg-gray-100 rounded-full w-20" />
          <div className="h-4 bg-gray-100 rounded-full w-16" />
        </div>
      </div>
    </div>
    <div className="hidden lg:flex flex-col items-center w-[10%]">
      <div className="w-4 h-4 rounded-full bg-gray-200 mt-6" />
    </div>
    <div className="hidden lg:block lg:w-[45%]" />
  </div>
);

// ─── Main exported component ───────────────────────────────────────────────────
/**
 * MedicalTimelineComponent
 *
 * @prop {Array}   events  - array of timeline event objects from API
 * @prop {boolean} loading - show skeleton
 * @prop {string}  error   - error message to display
 */
const MedicalTimelineComponent = ({ events = [], loading = false, error = '' }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[0, 1, 2].map((i) => <SkeletonCard key={i} isLeft={i % 2 === 0} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-5 py-3 rounded-xl">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  if (events.length === 0) return <EmptyTimeline />;

  const grouped = groupByMonth(events);

  // Counter for zigzag — counts events globally for alternating sides
  let globalIdx = 0;

  return (
    <div className="relative">
      {/* Continuous vertical line (desktop only) */}
      <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-200 via-teal-100 to-transparent -translate-x-1/2 pointer-events-none" />

      <div className="space-y-0">
        {grouped.map(([month, monthEvents]) => (
          <div key={month} className="space-y-4 mb-8">
            <MonthSeparator label={month} count={monthEvents.length} />

            {monthEvents.map((event, i) => {
              const side   = globalIdx % 2 === 0 ? 'right' : 'left';
              const isLast = globalIdx === events.length - 1;
              globalIdx++;
              return (
                <TimelineCard
                  key={event.id}
                  event={event}
                  side={side}
                  isLast={isLast}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* End marker */}
      <div className="hidden lg:flex items-center justify-center mt-4">
        <div className="w-3 h-3 rounded-full bg-gray-200 ring-4 ring-white shadow-sm" />
      </div>
      <p className="text-center text-xs text-gray-400 mt-3 pb-4">
        — End of medical history —
      </p>
    </div>
  );
};

export default MedicalTimelineComponent;
