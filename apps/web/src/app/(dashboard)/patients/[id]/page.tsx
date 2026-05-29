"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  User,
  Phone,
  Mail,
  Activity,
  Droplets,
  Calendar,
  AlertCircle,
  FileText,
  Pill,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["patient", id, "history"],
    queryFn: () => api.get<any>(`/api/patients/${id}/history`),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-24 bg-card/30 rounded-xl border border-destructive/20 text-destructive">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h2 className="text-lg font-semibold">Patient not found</h2>
        <Button variant="outline" className="mt-6" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const p = data;
  const profile = p.patientProfile;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Profile</h1>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Demographics */}
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden text-center">
            <div className="h-24 bg-gradient-to-r from-violet-600/20 to-indigo-600/20" />
            <div className="px-6 pb-6 relative">
              <div className="w-20 h-20 rounded-full bg-background border-4 border-background flex items-center justify-center mx-auto -mt-10 shadow-sm relative z-10">
                <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  {p.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <h2 className="text-xl font-bold mt-4">{p.name}</h2>
              <p className="text-sm text-muted-foreground mt-1 capitalize">
                {profile.gender.toLowerCase()}, {Math.floor((new Date().getTime() - new Date(profile.dob).getTime()) / 3.15576e+10)} years old
              </p>
            </div>
          </Card>

          <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/50 bg-primary/5">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{p.email}</span>
              </div>
              {p.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{p.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/50 bg-primary/5">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Vitals & Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Droplets className="w-4 h-4" /> Blood Group
                </span>
                <span className="font-semibold">{profile.bloodGroup || "Unknown"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Height</span>
                <span className="font-semibold">{profile.height ? `${profile.height} cm` : "N/A"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Weight</span>
                <span className="font-semibold">{profile.weight ? `${profile.weight} kg` : "N/A"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Medical History & Prescriptions */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/50 bg-primary/5 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Health Profile
              </CardTitle>
              <Button variant="outline" size="sm">Edit Records</Button>
            </CardHeader>
            <CardContent className="pt-6 grid sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Allergies
                </h4>
                {profile.allergies?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.allergies.map((allergy: string) => (
                      <Badge key={allergy} variant="destructive" className="bg-destructive/15 text-destructive hover:bg-destructive/25 border-transparent">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No known allergies</p>
                )}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Chronic Conditions
                </h4>
                {profile.conditions?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.conditions.map((condition: string) => (
                      <Badge key={condition} variant="secondary">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No chronic conditions</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/50 bg-primary/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Prescription History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {p.prescriptionsReceived?.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground italic">
                  No prescriptions on record.
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {p.prescriptionsReceived?.map((rx: any) => (
                    <Link key={rx.id} href={`/prescriptions/${rx.id}`}>
                      <div className="p-4 hover:bg-accent/30 transition-colors group cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium group-hover:text-primary transition-colors">
                            {rx.diagnosis}
                          </h4>
                          <Badge variant={rx.status === "ACTIVE" ? "success" : "secondary"} className="text-[10px]">
                            {rx.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(rx.createdAt), "MMM d, yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Pill className="w-3 h-3" />
                            {rx.medicines.length} meds
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
