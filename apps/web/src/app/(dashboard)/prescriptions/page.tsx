"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { FileText, Plus, Search, Calendar, ChevronRight, Pill } from "lucide-react";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Prescription {
  id: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";
  diagnosis: string;
  createdAt: string;
  patient: { id: string; name: string };
  doctor: { id: string; name: string };
  medicines: Array<{ id: string; name: string }>;
}

export default function PrescriptionsList() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["prescriptions", search],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (search) qs.append("search", search);
      // In a real app, you might want to paginate. Let's get up to 50 for now.
      qs.append("limit", "50");

      return api.get<{ data: Prescription[] }>(`/api/prescriptions?${qs.toString()}`);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Active</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "COMPLETED":
        return <Badge variant="default">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "EXPIRED":
        return <Badge variant="warning">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === "DOCTOR"
              ? "Manage and create prescriptions for your patients."
              : "View your medical prescriptions and instructions."}
          </p>
        </div>

        {user?.role === "DOCTOR" && (
          <Link href="/prescriptions/new">
            <Button variant="gradient" className="gap-2">
              <Plus className="w-4 h-4" />
              New Prescription
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={
              user?.role === "DOCTOR" ? "Search by patient name..." : "Search by doctor or diagnosis..."
            }
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/50 bg-card/40">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-24 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-24 px-4 rounded-xl border border-dashed border-border/50 bg-card/20">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No prescriptions found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {user?.role === "DOCTOR"
              ? "You haven't written any prescriptions yet. Click the button above to create one."
              : "You don't have any prescriptions on file."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.data.map((prescription) => (
            <Link key={prescription.id} href={`/prescriptions/${prescription.id}`}>
              <Card className="group overflow-hidden border-border/50 bg-card/40 hover:bg-accent/10 hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center p-6 gap-6">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-shrink-0 items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                          {user?.role === "DOCTOR"
                            ? prescription.patient.name
                            : `Dr. ${prescription.doctor.name}`}
                        </h3>
                        {getStatusBadge(prescription.status)}
                      </div>
                      
                      <p className="text-sm text-foreground/80 font-medium truncate mb-1">
                        Diagnosis: {prescription.diagnosis}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(prescription.createdAt), "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5" />
                          {prescription.medicines.length} Medication{prescription.medicines.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center bg-background border shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all">
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
