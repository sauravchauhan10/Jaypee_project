"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  FileText,
  User,
  Stethoscope,
  Calendar,
  Pill,
  Download,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// This would typically match the type returned by the backend `findById`
interface PrescriptionDetail {
  id: string;
  status: string;
  diagnosis: string;
  symptoms?: string;
  notes?: string;
  createdAt: string;
  qrToken: string;
  pdfUrl?: string | null;
  patient: {
    name: string;
    email: string;
    phone: string | null;
  };
  doctor: {
    name: string;
    doctorProfile: {
      specialty: string;
      clinicName: string | null;
    } | null;
  };
  medicines: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    timing: string;
    duration: string;
    instructions?: string;
  }>;
}

export default function PrescriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [isDownloading, setIsDownloading] = React.useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["prescription", id],
    queryFn: () => api.get<PrescriptionDetail>(`/api/prescriptions/${id}`),
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
        <h2 className="text-lg font-semibold">Prescription not found</h2>
        <p className="text-sm opacity-80 mt-1">It may have been deleted or you don&apos;t have access.</p>
        <Button variant="outline" className="mt-6" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const p = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full print:hidden" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Prescription Details</h1>
              <Badge variant={p.status === "ACTIVE" ? "success" : "secondary"}>
                {p.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              Issued on {format(new Date(p.createdAt), "MMMM d, yyyy")}
            </p>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="gap-2 print:hidden" 
          onClick={async () => {
            if (p.pdfUrl) {
              window.open(p.pdfUrl, '_blank');
              return;
            }
            
            setIsDownloading(true);
            try {
              const res = await api.get<{ status: string, url?: string }>(`/api/prescriptions/${id}/pdf-url`);
              if (res.url) {
                window.open(res.url, '_blank');
              } else {
                toast.info("PDF is still generating. Please try again in a few seconds.");
              }
            } catch (err) {
              toast.error("Failed to fetch PDF.");
            } finally {
              setIsDownloading(false);
            }
          }}
          disabled={isDownloading}
        >
          {isDownloading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
          <span className="hidden sm:inline-block">Download PDF</span>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content - Left Col (2/3) */}
        <div className="md:col-span-2 space-y-6">
          {/* Clinical Info */}
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/50 bg-primary/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Clinical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Diagnosis
                </h4>
                <p className="text-lg font-medium">{p.diagnosis}</p>
              </div>
              
              {p.symptoms && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Symptoms
                  </h4>
                  <p>{p.symptoms}</p>
                </div>
              )}

              {p.notes && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Doctor&apos;s Notes
                  </h4>
                  <p className="text-sm leading-relaxed">{p.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medications List */}
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/50 bg-primary/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                Prescribed Medications ({p.medicines.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {p.medicines.map((med, i) => (
                  <div key={med.id || i} className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-lg text-primary">{med.name}</h4>
                      <Badge variant="outline">{med.duration}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mt-4">
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase mb-1">Dosage</span>
                        <span className="font-medium">{med.dosage}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase mb-1">Frequency</span>
                        <span className="font-medium">{med.frequency}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase mb-1">Timing</span>
                        <span className="font-medium capitalize">{med.timing.replace('_', ' ').toLowerCase()}</span>
                      </div>
                    </div>

                    {med.instructions && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm border border-border/50">
                        <span className="font-semibold mr-2">Instructions:</span>
                        {med.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Col (1/3) */}
        <div className="space-y-6">
          {/* Doctor Info */}
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Prescribed By
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">Dr. {p.doctor.name}</p>
              {p.doctor.doctorProfile && (
                <>
                  <p className="text-sm text-muted-foreground">{p.doctor.doctorProfile.specialty}</p>
                  {p.doctor.doctorProfile.clinicName && (
                    <p className="text-sm mt-2 font-medium">{p.doctor.doctorProfile.clinicName}</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Patient Info */}
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" />
                Patient
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">{p.patient.name}</p>
              <div className="text-sm text-muted-foreground space-y-1 mt-2">
                <p>{p.patient.email}</p>
                {p.patient.phone && <p>{p.patient.phone}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Verification QR */}
          <Card className="border-border/50 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-32 h-32 bg-white rounded-xl mx-auto mb-4 p-2 shadow-sm flex items-center justify-center">
                {/* Placeholder for actual QR code */}
                <div className="text-xs text-muted-foreground font-mono break-all text-center">
                  [QR Code placeholder for Token:<br/>{p.qrToken}]
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Scan to verify authenticity of this prescription.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
