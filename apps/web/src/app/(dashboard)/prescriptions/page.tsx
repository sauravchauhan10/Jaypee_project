"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Plus, ChevronRight, Pill } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { AdvancedFilters } from "@/components/dashboard/advanced-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

interface Prescription {
  id: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";
  diagnosis: string;
  createdAt: string;
  patient: { id: string; name: string };
  doctor: { id: string; name: string };
  medicines: Array<{ id: string; name: string }>;
}

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

export default function PrescriptionsList() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read URL params
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const medicineName = searchParams.get("medicineName") || "";
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["prescriptions", page, search, status, startDate, endDate, medicineName],
    queryFn: async () => {
      const qs = new URLSearchParams();
      qs.append("page", page.toString());
      qs.append("limit", limit.toString());
      if (search) qs.append("search", search);
      if (status && status !== "all") qs.append("status", status);
      if (startDate) qs.append("startDate", startDate);
      if (endDate) qs.append("endDate", endDate);
      if (medicineName) qs.append("medicineName", medicineName);

      return api.get<{ 
        data: Prescription[];
        meta: { total: number; totalPages: number }
      }>(`/api/prescriptions?${qs.toString()}`);
    },
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const columns: ColumnDef<Prescription>[] = [
    {
      accessorKey: user?.role === "DOCTOR" ? "patient.name" : "doctor.name",
      header: user?.role === "DOCTOR" ? "Patient" : "Doctor",
      cell: ({ row }) => {
        const name = user?.role === "DOCTOR" ? row.original.patient.name : `Dr. ${row.original.doctor.name}`;
        return <div className="font-medium text-foreground">{name}</div>;
      }
    },
    {
      accessorKey: "diagnosis",
      header: "Diagnosis",
    },
    {
      accessorKey: "medicines",
      header: "Medicines",
      cell: ({ row }) => {
        const count = row.original.medicines.length;
        return (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Pill className="w-3.5 h-3.5" />
            {count} Medication{count !== 1 ? 's' : ''}
          </div>
        );
      }
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => format(new Date(row.original.createdAt), "MMM d, yyyy"),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Link href={`/prescriptions/${row.original.id}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              View <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

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

      {/* Advanced Filters */}
      <AdvancedFilters />

      {/* Data Table */}
      <div className="bg-card rounded-xl border-border/50 shadow-sm p-4">
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          pageCount={data?.meta?.totalPages || 1}
          currentPage={page}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

