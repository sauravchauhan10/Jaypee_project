"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Pill,
  Sun,
  Sunset,
  Moon,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TIMING_CONFIG = {
  MORNING: { icon: Sun, label: "Morning", color: "text-amber-500", bg: "bg-amber-500/10" },
  AFTERNOON: { icon: Sun, label: "Afternoon", color: "text-orange-500", bg: "bg-orange-500/10" },
  EVENING: { icon: Sunset, label: "Evening", color: "text-indigo-500", bg: "bg-indigo-500/10" },
  NIGHT: { icon: Moon, label: "Night", color: "text-violet-500", bg: "bg-violet-500/10" },
  AS_NEEDED: { icon: Pill, label: "As Needed", color: "text-emerald-500", bg: "bg-emerald-500/10" },
};

export default function SchedulePage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedDate] = useState<Date>(new Date()); // Simplified to today for now

  // In a real app, we'd have a specific endpoint for today's schedule.
  // For now, we fetch the patient's history which includes active prescriptions.
  const { data, isLoading } = useQuery({
    queryKey: ["patient", user?.id, "history"],
    queryFn: () => api.get<any>(`/api/patients/${user?.id}/history`),
    enabled: !!user?.id,
  });

  const adherenceMutation = useMutation({
    mutationFn: (data: { prescriptionMedicineId: string; date: string; timeSlot: string; taken: boolean }) =>
      api.post("/api/patients/adherence", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", user?.id, "history"] });
      toast.success("Schedule updated");
    },
    onError: () => {
      toast.error("Failed to update schedule");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Extract all medicines from ACTIVE prescriptions
  const activePrescriptions = data?.prescriptionsReceived?.filter((p: any) => p.status === "ACTIVE") || [];
  
  // Group medicines by timing slot
  const schedule: Record<string, any[]> = {
    MORNING: [],
    AFTERNOON: [],
    EVENING: [],
    NIGHT: [],
    AS_NEEDED: [],
  };

  activePrescriptions.forEach((p: any) => {
    p.medicines.forEach((med: any) => {
      const slot = schedule[med.timing];
      if (slot) {
        // Find if taken today
        const todayStr = format(selectedDate, "yyyy-MM-dd");
        // Due to basic string date matching, we need to handle timezone safely
        const takenToday = med.adherenceLogs?.some((log: any) => 
          new Date(log.date).toISOString().startsWith(todayStr) && 
          log.timeSlot === med.timing && 
          log.taken
        );

        slot.push({
          ...med,
          prescriptionId: p.id,
          doctorName: p.doctor.name,
          takenToday: !!takenToday,
        });
      }
    });
  });

  const handleToggleTaken = (med: any) => {
    adherenceMutation.mutate({
      prescriptionMedicineId: med.id,
      date: format(selectedDate, "yyyy-MM-dd"),
      timeSlot: med.timing,
      taken: !med.takenToday,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medication Schedule</h1>
          <p className="text-muted-foreground mt-1">Track your daily prescriptions and adherence.</p>
        </div>
        
        <Card className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 border-transparent">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium opacity-90">Today</p>
              <p className="font-bold">{format(selectedDate, "EEEE, MMMM d")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {activePrescriptions.length === 0 ? (
        <div className="text-center py-24 bg-card/30 rounded-xl border border-dashed border-border/50">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-lg font-semibold">No active prescriptions</h2>
          <p className="text-muted-foreground">You don't have any medications scheduled for today.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {(Object.keys(TIMING_CONFIG) as Array<keyof typeof TIMING_CONFIG>).map((timing) => {
            const meds = schedule[timing];
            if (!meds || meds.length === 0) return null;

            const config = TIMING_CONFIG[timing];
            const Icon = config.icon;

            return (
              <Card key={timing} className="border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
                <CardHeader className={`pb-3 border-b border-border/50 flex flex-row items-center gap-3 ${config.bg}`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <CardTitle className="text-lg">{config.label}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {meds.map((med) => (
                      <div key={med.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-accent/10 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${med.takenToday ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {med.takenToday ? <CheckCircle2 className="w-5 h-5" /> : <Pill className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className={`font-bold text-lg ${med.takenToday ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              {med.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="font-medium bg-muted px-2 py-0.5 rounded-md">{med.dosage}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {med.frequency}</span>
                              <span className="hidden sm:inline-block border-l border-border/50 h-3" />
                              <span className="text-xs">Dr. {med.doctorName}</span>
                            </div>
                            {med.instructions && !med.takenToday && (
                              <p className="text-sm mt-2 text-primary font-medium">
                                Note: {med.instructions}
                              </p>
                            )}
                          </div>
                        </div>

                        <Button
                          variant={med.takenToday ? "outline" : "gradient"}
                          className={`sm:w-32 ${med.takenToday ? 'opacity-70' : ''}`}
                          onClick={() => handleToggleTaken(med)}
                          disabled={adherenceMutation.isPending}
                        >
                          {adherenceMutation.isPending && adherenceMutation.variables?.prescriptionMedicineId === med.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : med.takenToday ? (
                            "Undo"
                          ) : (
                            "Mark Taken"
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
