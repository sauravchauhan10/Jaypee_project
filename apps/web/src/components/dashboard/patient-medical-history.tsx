"use client";

import { motion } from "framer-motion";
import { Activity, Droplets, HeartPulse, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface PatientMedicalHistoryProps {
  data?: {
    bloodGroup: string | null;
    height: number | null;
    weight: number | null;
    allergies: string[];
    conditions: string[];
  };
  isLoading: boolean;
}

export function PatientMedicalHistory({ data, isLoading }: PatientMedicalHistoryProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/40 backdrop-blur-sm h-full">
        <CardHeader>
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const profile = data || {
    bloodGroup: "Unknown",
    height: null,
    weight: null,
    allergies: [],
    conditions: [],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-full"
    >
      <Card className="border-border/50 bg-card/40 backdrop-blur-sm h-full flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-primary" />
            Medical History
          </CardTitle>
          <CardDescription>Your vitals and chronic records.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-6">
          {/* Vitals Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-primary/5 rounded-xl p-4 text-center border border-primary/10">
              <Droplets className="w-5 h-5 mx-auto text-rose-500 mb-2" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Blood</p>
              <p className="font-semibold">{profile.bloodGroup || "N/A"}</p>
            </div>
            <div className="bg-primary/5 rounded-xl p-4 text-center border border-primary/10">
              <Activity className="w-5 h-5 mx-auto text-blue-500 mb-2" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Height</p>
              <p className="font-semibold">{profile.height ? `${profile.height} cm` : "N/A"}</p>
            </div>
            <div className="bg-primary/5 rounded-xl p-4 text-center border border-primary/10">
              <Activity className="w-5 h-5 mx-auto text-emerald-500 mb-2" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Weight</p>
              <p className="font-semibold">{profile.weight ? `${profile.weight} kg` : "N/A"}</p>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Records */}
          <div className="grid gap-6">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-destructive" />
                Allergies
              </h4>
              {profile.allergies?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.allergies.map((allergy) => (
                    <Badge key={allergy} variant="destructive" className="bg-destructive/15 text-destructive hover:bg-destructive/25 border-transparent">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No known allergies recorded.</p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Chronic Conditions
              </h4>
              {profile.conditions?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.conditions.map((condition) => (
                    <Badge key={condition} variant="secondary">
                      {condition}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No chronic conditions recorded.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
