"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";

import { PatientMedicalHistory } from "./patient-medical-history";
import { PatientMedicineTimeline } from "./patient-medicine-timeline";
import { PatientPrescriptions } from "./patient-prescriptions";
import { PatientAiAssistant } from "./patient-ai-assistant";

export function PatientDashboard() {
  const { user } = useAuthStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["patient", user?.id, "dashboard"],
    queryFn: () => api.get<any>(`/api/patients/${user?.id}/history`),
    enabled: !!user?.id,
  });

  if (isError) {
    return (
      <div className="text-center py-12 bg-destructive/5 rounded-xl border border-destructive/20 text-destructive mt-6">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-80" />
        <p className="font-medium">Failed to load health records. Please try again.</p>
      </div>
    );
  }

  const p = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name.split(" ")[0]}! Here is your current health overview.
          </p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Left Column - History */}
        <div className="col-span-1">
          <PatientMedicalHistory data={p?.patientProfile} isLoading={isLoading} />
        </div>

        {/* Middle Column - Timeline */}
        <div className="col-span-1">
          <PatientMedicineTimeline prescriptions={p?.prescriptionsReceived} isLoading={isLoading} />
        </div>

        {/* Right Column - Prescriptions */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <PatientPrescriptions prescriptions={p?.prescriptionsReceived} isLoading={isLoading} />
        </div>
      </div>
      
      {/* AI Assistant FAB */}
      <PatientAiAssistant />
    </div>
  );
}
