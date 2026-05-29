"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, Users, ChevronRight, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  patientProfile?: {
    gender: string;
    bloodGroup: string | null;
  };
}

export default function PatientsListPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["patients", search],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (search) qs.append("search", search);
      qs.append("limit", "50");

      return api.get<{ data: Patient[] }>(`/api/patients?${qs.toString()}`);
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
        <p className="text-muted-foreground mt-1">
          Manage your patient directory and view their medical history.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
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
              <CardContent className="p-6 flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-24 px-4 rounded-xl border border-dashed border-border/50 bg-card/20">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No patients found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search query.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.data.map((patient) => (
            <Link key={patient.id} href={`/patients/${patient.id}`}>
              <Card className="group overflow-hidden border-border/50 bg-card/40 hover:bg-accent/10 hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center p-6 gap-6">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex flex-shrink-0 items-center justify-center border border-primary/10">
                      <span className="text-lg font-bold text-primary">
                        {patient.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                          {patient.name}
                        </h3>
                        {patient.patientProfile?.bloodGroup && (
                          <Badge variant="outline" className="text-xs">
                            Blood: {patient.patientProfile.bloodGroup}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs capitalize">
                          {patient.patientProfile?.gender?.toLowerCase() || 'Unknown'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          {patient.email}
                        </span>
                        {patient.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            {patient.phone}
                          </span>
                        )}
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
