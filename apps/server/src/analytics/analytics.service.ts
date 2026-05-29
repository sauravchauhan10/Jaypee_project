import { prisma } from '@prescribeflow/db';
import type { Prisma } from '@prescribeflow/db';

import type { AnalyticsQueryInput } from './analytics.schema.js';

export const getDoctorDashboardMetrics = async (doctorId: string, query: AnalyticsQueryInput) => {
  const { timeRange } = query;
  
  // Calculate start date based on timeRange
  const now = new Date();
  const startDate = new Date();
  if (timeRange === '7d') startDate.setDate(now.getDate() - 7);
  else if (timeRange === '30d') startDate.setDate(now.getDate() - 30);
  else if (timeRange === '90d') startDate.setDate(now.getDate() - 90);

  // 1. Total unique patients prescribed to by this doctor
  // (We'll count distinct patientIds in prescriptions)
  const uniquePatientsData = await prisma.prescription.groupBy({
    by: ['patientId'],
    where: {
      doctorId,
      deletedAt: null,
    },
  });
  const totalPatients = uniquePatientsData.length;

  // 2. Prescriptions count within time range
  const activePrescriptionsCount = await prisma.prescription.count({
    where: {
      doctorId,
      status: 'ACTIVE',
      createdAt: { gte: startDate },
      deletedAt: null,
    },
  });

  const totalPrescriptionsTimeRange = await prisma.prescription.count({
    where: {
      doctorId,
      createdAt: { gte: startDate },
      deletedAt: null,
    },
  });

  // 3. Adherence rate approximation (for UI demo purposes)
  // We'll calculate a mock percentage or base it on adherence logs if we want
  const adherenceRate = 84; // Mocked for now, in a real system we'd aggregate logs

  // 4. Alerts (Mocked for now)
  const alertsCount = 3;

  // 5. Recent Activity (latest prescriptions)
  const recentActivity = await prisma.prescription.findMany({
    where: { doctorId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      patient: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  // 6. Trend data (Prescriptions per day)
  // Since Prisma doesn't have native date_trunc, we fetch and group in memory for simplicity (fine for small scale)
  const prescriptionsForTrend = await prisma.prescription.findMany({
    where: {
      doctorId,
      createdAt: { gte: startDate },
      deletedAt: null,
    },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const trendMap = new Map<string, number>();
  // Initialize map with all dates in range
  for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
    trendMap.set(d.toISOString().split('T')[0] as string, 0);
  }

  prescriptionsForTrend.forEach((p: { createdAt: Date }) => {
    const dateStr = p.createdAt.toISOString().split('T')[0] as string;
    trendMap.set(dateStr, (trendMap.get(dateStr) || 0) + 1);
  });

  const trendData = Array.from(trendMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  return {
    kpis: {
      totalPatients,
      activePrescriptions: activePrescriptionsCount,
      totalPrescriptions: totalPrescriptionsTimeRange,
      adherenceRate,
      alerts: alertsCount,
    },
    trendData,
    recentActivity: recentActivity.map((r: any) => ({
      id: r.id,
      type: 'PRESCRIPTION',
      patientName: r.patient.name,
      diagnosis: r.diagnosis,
      createdAt: r.createdAt,
      status: r.status,
    })),
  };
};
