"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

// Import new Dashboard Components
import { AnalyticsCards } from "@/components/dashboard/analytics-cards";
import { PrescriptionTrends } from "@/components/dashboard/prescription-trends";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { PatientDashboard } from "@/components/dashboard/patient-dashboard";

export default function DashboardIndex() {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  // Fetch Analytics Data if user is a DOCTOR
  const { data: analyticsData, isLoading, isError } = useQuery({
    queryKey: ["analytics", "doctor", timeRange],
    queryFn: () => api.get<{ data: any }>(`/api/analytics/doctor?timeRange=${timeRange}`),
    enabled: user?.role === "DOCTOR",
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (user.role === "PATIENT") {
    return <PatientDashboard />;
  }

  const d = analyticsData?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, Dr. {user.name.split(" ")[0]}! Here&apos;s your clinic&apos;s activity.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center bg-card/40 backdrop-blur-sm border border-border/50 rounded-lg p-1">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "secondary" : "ghost"}
              size="sm"
              className={`h-8 px-3 text-xs ${timeRange === range ? "shadow-sm" : ""}`}
              onClick={() => setTimeRange(range)}
              disabled={isLoading}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
            </Button>
          ))}
        </div>
      </div>

      {isError ? (
        <div className="text-center py-12 bg-destructive/5 rounded-xl border border-destructive/20 text-destructive">
          <p>Failed to load analytics data. Please try again.</p>
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <AnalyticsCards data={d?.kpis} isLoading={isLoading} />

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-4 lg:grid-rows-[minmax(0,1fr)_auto]">
            {/* Main Trend Chart - Takes 4 cols on small, 3/4 cols depending on layout */}
            <div className="lg:col-span-4 h-[400px]">
              <PrescriptionTrends data={d?.trendData} isLoading={isLoading} />
            </div>

            {/* Bottom Row - Recent Activity (3 cols) & Quick Actions (1 col) */}
            <div className="lg:col-span-3">
              <RecentActivity data={d?.recentActivity} isLoading={isLoading} />
            </div>
            <div className="lg:col-span-1">
              <QuickActions />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
