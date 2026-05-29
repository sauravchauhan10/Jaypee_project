// src/pages/patient/PatientAnalytics.jsx
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { getPatientAnalytics } from '../../services/analytics.service';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler
);

const FONT       = { family: "'Inter', sans-serif", size: 11 };
const GRID       = { color: '#f1f5f9', drawBorder: false };
const BORDER     = { display: false };
const tooltipBase = {
  backgroundColor: '#1e293b',
  titleFont: { ...FONT, weight: '600', size: 12 },
  bodyFont: FONT,
  padding: 10,
  cornerRadius: 8,
  displayColors: false,
};
const MED_COLORS = ['#0f766e','#0e7490','#1d4ed8','#4f46e5','#7c3aed','#be185d','#b45309','#15803d'];

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
    {loading
      ? <div className="h-52 bg-gray-50 rounded-xl animate-pulse" />
      : children}
  </div>
);

const NoData = ({ msg = 'No data yet' }) => (
  <div className="h-52 flex flex-col items-center justify-center gap-2 text-gray-400">
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
    <p className="text-xs">{msg}</p>
  </div>
);

// ─── Main ──────────────────────────────────────────────────────────────────────
const PatientAnalytics = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getPatientAnalytics();
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

  // Chart data
  const monthlyChart = data?.monthlyPrescriptions?.length ? {
    labels:   data.monthlyPrescriptions.map((m) => m.label),
    datasets: [{
      label: 'Prescriptions',
      data:  data.monthlyPrescriptions.map((m) => m.count),
      borderColor:     '#10b981',
      backgroundColor: 'rgba(16,185,129,0.1)',
      borderWidth: 2.5,
      pointBackgroundColor: '#059669',
      pointRadius: 5,
      fill: true,
      tension: 0.45,
    }],
  } : null;

  const statusChart = data?.statusBreakdown ? {
    labels: ['Active', 'Completed', 'Cancelled'],
    datasets: [{
      data: [data.statusBreakdown.active, data.statusBreakdown.completed, data.statusBreakdown.cancelled],
      backgroundColor: ['#22c55e', '#64748b', '#ef4444'],
      borderWidth: 3,
      borderColor: '#fff',
      hoverOffset: 6,
    }],
  } : null;

  const medChart = data?.topMedicines?.length ? {
    labels:   data.topMedicines.map((m) => m.label),
    datasets: [{
      label: 'Times Prescribed',
      data:  data.topMedicines.map((m) => m.count),
      backgroundColor: MED_COLORS,
      borderWidth: 0,
      borderRadius: 6,
      borderSkipped: false,
    }],
  } : null;

  const lineOpts = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { ...tooltipBase, mode: 'index', intersect: false } },
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

  const barOpts = {
    indexAxis: 'y',
    responsive: true,
    plugins: { legend: { display: false }, tooltip: tooltipBase },
    scales: {
      x: { grid: GRID, border: BORDER, ticks: { font: FONT }, beginAtZero: true },
      y: { grid: { display: false }, border: BORDER, ticks: { font: FONT } },
    },
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Personal health trends and prescription analytics.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="Total Prescriptions" value={kpis.totalPrescriptions}
          sub="All time"
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
          loading={loading}
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <KPICard
          label="Active Prescriptions" value={kpis.activePrescriptions}
          sub="Currently ongoing"
          gradient="bg-gradient-to-br from-teal-500 to-teal-700"
          loading={loading}
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KPICard
          label="Completed Prescriptions" value={kpis.completedPrescriptions}
          sub="Treatment history"
          gradient="bg-gradient-to-br from-violet-500 to-violet-700"
          loading={loading}
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
        />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Prescription History" sub="Last 6 months" loading={loading} span="lg:col-span-2">
          {monthlyChart ? <Line data={monthlyChart} options={lineOpts} /> : <NoData />}
        </ChartCard>
        <ChartCard title="Prescription Status" sub="Breakdown by status" loading={loading}>
          {statusChart ? <Doughnut data={statusChart} options={doughnutOpts} /> : <NoData />}
        </ChartCard>
      </div>

      {/* Row 2 */}
      <ChartCard title="Most Prescribed Medicines" sub="Medicines you've been prescribed most" loading={loading}>
        {medChart ? <Bar data={medChart} options={barOpts} /> : <NoData msg="No medicines prescribed yet" />}
      </ChartCard>
    </div>
  );
};

export default PatientAnalytics;
