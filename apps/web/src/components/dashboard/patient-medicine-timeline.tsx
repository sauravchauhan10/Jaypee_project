"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import { Pill, CheckCircle2, Clock, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MedicineTimelineProps {
  prescriptions?: any[];
  isLoading: boolean;
}

export function PatientMedicineTimeline({ prescriptions, isLoading }: MedicineTimelineProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/40 backdrop-blur-sm h-full">
        <CardHeader>
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Extract all medicines from ACTIVE prescriptions
  const activePrescriptions = prescriptions?.filter((p: any) => p.status === "ACTIVE") || [];
  const todayMeds: any[] = [];
  
  const todayStr = format(new Date(), "yyyy-MM-dd");

  activePrescriptions.forEach((p: any) => {
    p.medicines.forEach((med: any) => {
      const takenToday = med.adherenceLogs?.some((log: any) => 
        new Date(log.date).toISOString().startsWith(todayStr) && 
        log.timeSlot === med.timing && 
        log.taken
      );
      todayMeds.push({
        ...med,
        doctorName: p.doctor.name,
        takenToday: !!takenToday,
      });
    });
  });

  // Sort by taken status (untaken first)
  todayMeds.sort((a, b) => (a.takenToday === b.takenToday ? 0 : a.takenToday ? 1 : -1));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="h-full"
    >
      <Card className="border-border/50 bg-card/40 backdrop-blur-sm h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Today's Schedule
              </CardTitle>
              <CardDescription>Your medication for {format(new Date(), "EEEE, MMM d")}</CardDescription>
            </div>
            <Link href="/schedule">
              <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary hover:bg-primary/10">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {todayMeds.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6 border border-dashed border-border/50 rounded-xl">
              <Pill className="w-8 h-8 mb-3 opacity-20" />
              <p>No active medications scheduled for today.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {todayMeds.slice(0, 5).map((med, i) => (
                <motion.div 
                  key={med.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-4 relative group"
                >
                  {/* Timeline connecting line */}
                  {i !== Math.min(todayMeds.length, 5) - 1 && (
                    <div className="absolute left-5 top-10 bottom-[-20px] w-px bg-border/50" />
                  )}

                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${med.takenToday ? 'bg-success/20 text-success' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                    {med.takenToday ? <CheckCircle2 className="w-5 h-5" /> : <Pill className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm font-semibold truncate ${med.takenToday ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {med.name}
                      </h4>
                      <span className="text-xs font-medium text-muted-foreground capitalize">
                        {med.timing.toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="font-medium bg-muted/50 px-1.5 py-0.5 rounded">{med.dosage}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {med.frequency}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {todayMeds.length > 5 && (
                <div className="pt-2 text-center">
                  <span className="text-xs text-muted-foreground font-medium">
                    +{todayMeds.length - 5} more medications today
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
