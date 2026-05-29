// src/pages/doctor/Analytics.jsx
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, PolarArea } from 'react-chartjs-2';
import { getDoctorAnalytics } from '../../services/analytics.service';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler
);

// ─── Shared chart defaults ─────────────────────────────────────────────────────
const FONT   = { family: "'Inter', sans-serif", size: 11 };
const GRID   = { color: '#f1f5f9', drawBorder: false };
const BORDER = { display: false };

const tooltipBase = {
  backgroundColor: '#1e293b',
  titleFont: { ...FONT, weight: '600', size: 12 },
  bodyFont: FONT,
  padding: 10,
  cornerRadius: 8,
  displayColors: false,
};

// Palette
const BLUE_SHADES   = ['#1d4ed8','#2563eb','#3b82f6','#60a5fa','#93c5fd','#bfdbfe','#dbeafe','#eff6ff'];
const DISEASE_COLORS = ['#1d4ed8','#7c3aed','#db2777','#ea580c','#16a34a','#0891b2','#dc2626','#ca8a04'];
const MED_COLORS    = ['#0f766e','#0e7490','#1d4ed8','#4f46e5','#7c3aed','#be185d','#b45309','#15803d','#c2410c','#0284c7'];
const STATUS_COLORS = { active: '#22c55e', completed: '#64748b', cancelled: '#ef4444' };

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KPICard = ({ label, value, sub, icon, gradient, loading }) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 text-white ${gradient} shadow-lg`}>
    <div className="absolute -right-3 -top-3 w-20 h-20 rounded-full bg-white/10" />
    <div className="relative">
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">{icon}</div>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-7 bg-white/30 rounded-lg w-16" />
          <div className="h-3 bg-white/20 rounded w-24" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold">{value ?? '—'}</p>
          <p className="text-xs font-semibold opacity-80 mt-0.5">{label}</p>
          {sub && <p className="text-[10px] opacity-60 mt-0.5">{sub}</p>}
        </>
      )}
    </div>
  </div>
);

// ─── Chart wrapper card ────────────────────────────────────────────────────────
const ChartCard = ({ title, sub, children, loading, span = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${span}`}>
    <div className="mb-5">
      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
    {loading ? (
      <div className="h-52 bg-gray-50 rounded-xl animate-pulse" />
    ) : children}
  </div>
);

// ─── Empty chart state ─────────────────────────────────────────────────────────
const NoData = ({ msg = 'No data yet — create some prescriptions!' }) => (
  <div className="h-52 flex flex-col items-center justify-center gap-2 text-gray-400">
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
    <p className="text-xs">{msg}</p>
  </div>
);

// ─── Main ──────────────────────────────────────────────────────────────────────
const Analytics = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getDoctorAnalytics();
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const kpis = data?.kpis || {};

  // ── Chart data builders ────────────────────────────────────────────────────
  const monthlyChart = data?.monthlyPrescriptions?.length ? {
    labels:   data.monthlyPrescriptions.map((m) => m.label),
    datasets: [{
      label: 'Prescriptions',
      data:  data.monthlyPrescriptions.map((m) => m.count),
      borderColor:     '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.12)',
      borderWidth: 2.5,
      pointBackgroundColor: '#1d4ed8',
      pointRadius: 5,
      pointHoverRadius: 8,
      fill: true,
      tension: 0.45,
    }],
  } : null;

  const diagnosisChart = data?.topDiagnoses?.length ? {
    labels:   data.topDiagnoses.map((d) => d.label.length > 28 ? d.label.slice(0, 25) + '…' : d.label),
    datasets: [{
      label: 'Cases',
      data:  data.topDiagnoses.map((d) => d.count),
      backgroundColor: DISEASE_COLORS,
      borderWidth: 0,
      borderRadius: 6,
      borderSkipped: false,
    }],
  } : null;

  const medicineChart = data?.topMedicines?.length ? {
    labels:   data.topMedicines.map((m) => m.label),
    datasets: [{
      label: 'Times Prescribed',
      data:  data.topMedicines.map((m) => m.count),
      backgroundColor: MED_COLORS,
      borderWidth: 2,
      borderColor: '#fff',
    }],
  } : null;

  const activityChart = data?.recentActivity?.length ? {
    labels:   data.recentActivity.map((d) => d.label),
    datasets: [{
      label: 'Prescriptions',
      data:  data.recentActivity.map((d) => d.count),
      backgroundColor: (ctx) => {
        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
        g.addColorStop(0, 'rgba(29,78,216,0.85)');
        g.addColorStop(1, 'rgba(59,130,246,0.25)');
        return g;
      },
      borderRadius: 6,
      borderSkipped: false,
    }],
  } : null;

  const statusChart = data?.statusBreakdown ? {
    labels: ['Active', 'Completed', 'Cancelled'],
    datasets: [{
      data: [
        data.statusBreakdown.active,
        data.statusBreakdown.completed,
        data.statusBreakdown.cancelled,
      ],
      backgroundColor: Object.values(STATUS_COLORS),
      borderWidth: 3,
      borderColor: '#fff',
      hoverOffset: 6,
    }],
  } : null;

  const weekdayChart = data?.weekday?.length ? {
    labels:   data.weekday.map((d) => d.label),
    datasets: [{
      label: 'Prescriptions',
      data:  data.weekday.map((d) => d.count),
      backgroundColor: BLUE_SHADES.slice(0, 7),
      borderWidth: 0,
      borderRadius: 8,
      borderSkipped: false,
    }],
  } : null;

  // ── Chart options ──────────────────────────────────────────────────────────
  const lineOpts = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { ...tooltipBase, mode: 'index', intersect: false } },
    scales: {
      x: { grid: { display: false }, border: BORDER, ticks: { font: FONT } },
      y: { grid: GRID, border: BORDER, ticks: { font: FONT, stepSize: 1 }, beginAtZero: true },
    },
  };

  const hBarOpts = {
    indexAxis: 'y',
    responsive: true,
    plugins: { legend: { display: false }, tooltip: tooltipBase },
    scales: {
      x: { grid: GRID, border: BORDER, ticks: { font: FONT }, beginAtZero: true },
      y: { grid: { display: false }, border: BORDER, ticks: { font: FONT } },
    },
  };

  const barOpts = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: tooltipBase },
    scales: {
      x: { grid: { display: false }, border: BORDER, ticks: { font: FONT } },
      y: { grid: GRID, border: BORDER, ticks: { font: FONT, stepSize: 1 }, beginAtZero: true },
    },
  };

  const doughnutOpts = {
    responsive: true,
    cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { font: FONT, padding: 16, usePointStyle: true, pointStyleWidth: 8 } },
      tooltip: tooltipBase,
    },
  };

  const polarOpts = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { font: FONT, padding: 12, usePointStyle: true, pointStyleWidth: 8 } },
      tooltip: tooltipBase,
    },
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time insights from your prescriptions and patient data.</p>
        </div>
        {!loading && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live data
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Prescriptions" value={kpis.totalPrescriptions}
          sub="All time"
          gradient="bg-gradient-to-br from-blue-600 to-blue-800"
          loading={loading}
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <KPICard
          label="Total Patients" value={kpis.totalPatients}
          sub="Unique patients"
          gradient="bg-gradient-to-br from-violet-600 to-violet-800"
          loading={loading}
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <KPICard
          label="Today's Prescriptions" value={kpis.todayPrescriptions}
          sub={new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          gradient="bg-gradient-to-br from-rose-500 to-rose-700"
          loading={loading}
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <KPICard
          label="Active Prescriptions" value={kpis.activePrescriptions}
          sub="Currently ongoing"
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
          loading={loading}
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* ── Row 1: Monthly trend + Recent activity ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <ChartCard
          title="Monthly Prescriptions"
          sub="Last 6 months"
          loading={loading}
          span="lg:col-span-3"
        >
          {monthlyChart
            ? <Line data={monthlyChart} options={lineOpts} />
            : <NoData />}
        </ChartCard>

        <ChartCard
          title="Prescription Status"
          sub="Current breakdown"
          loading={loading}
          span="lg:col-span-2"
        >
          {statusChart
            ? <Doughnut data={statusChart} options={doughnutOpts} />
            : <NoData />}
        </ChartCard>
      </div>

      {/* ── Row 2: Top diseases + Medicine usage ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Most Common Diseases"
          sub="By number of prescriptions issued"
          loading={loading}
        >
          {diagnosisChart
            ? <Bar data={diagnosisChart} options={hBarOpts} />
            : <NoData msg="Issue prescriptions to see top diagnoses" />}
        </ChartCard>

        <ChartCard
          title="Medicine Usage Frequency"
          sub="Most prescribed medicines (all time)"
          loading={loading}
        >
          {medicineChart
            ? <PolarArea data={medicineChart} options={polarOpts} />
            : <NoData msg="Prescribe medicines to see usage stats" />}
        </ChartCard>
      </div>

      {/* ── Row 3: Recent daily activity + Weekday pattern ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Recent Activity"
          sub="Daily prescriptions — last 30 days"
          loading={loading}
          span="lg:col-span-2"
        >
          {activityChart
            ? <Bar data={activityChart} options={{
                ...barOpts,
                scales: {
                  ...barOpts.scales,
                  x: { ...barOpts.scales.x, ticks: { ...barOpts.scales.x.ticks, maxTicksLimit: 10 } },
                },
              }} />
            : <NoData />}
        </ChartCard>

        <ChartCard
          title="Busiest Days"
          sub="Prescriptions by day of week"
          loading={loading}
        >
          {weekdayChart
            ? <Bar data={weekdayChart} options={barOpts} />
            : <NoData />}
        </ChartCard>
      </div>

      {/* ── Row 4: Top medicines horizontal bar ──────────────────────────── */}
      <ChartCard
        title="Top 10 Most Prescribed Medicines"
        sub="Across all prescriptions you've issued"
        loading={loading}
      >
        {data?.topMedicines?.length ? (
          <Bar
            data={{
              labels:   data.topMedicines.map((m) => m.label),
              datasets: [{
                label: 'Times Prescribed',
                data:  data.topMedicines.map((m) => m.count),
                backgroundColor: MED_COLORS,
                borderWidth: 0,
                borderRadius: 6,
              }],
            }}
            options={{
              ...barOpts,
              plugins: {
                ...barOpts.plugins,
                legend: { display: false },
              },
            }}
          />
        ) : <NoData />}
      </ChartCard>
    </div>
  );
};

export default Analytics;
