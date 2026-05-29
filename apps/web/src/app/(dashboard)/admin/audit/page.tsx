"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, Search, ShieldCheck, User } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

interface AuditLog {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

interface AuditResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, search],
    queryFn: () => api.get<AuditResponse>(`/api/audit?page=${page}&limit=50${search ? `&userId=${search}` : ''}`),
  });

  const exportCsv = () => {
    if (!data?.data) return;
    
    const headers = ["Timestamp", "Actor Name", "Actor Role", "Action", "Resource Type", "Resource ID", "IP Address"];
    const csvContent = [
      headers.join(","),
      ...data.data.map(log => [
        `"${new Date(log.createdAt).toISOString()}"`,
        `"${log.user.name}"`,
        `"${log.user.role}"`,
        `"${log.action}"`,
        `"${log.resourceType}"`,
        `"${log.resourceId || 'N/A'}"`,
        `"${log.ipAddress || 'N/A'}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_export_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            Immutable tracking of all system and user actions for HIPAA compliance.
          </p>
        </div>

        <Button onClick={exportCsv} variant="outline" className="gap-2 shrink-0">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <Card className="border-border/50 shadow-sm bg-card/40 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">System Activity</CardTitle>
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Filter by User ID..." 
                className="pl-9 h-9 bg-background/50 border-border/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">Actor</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                  <th className="px-6 py-4 font-medium">Resource</th>
                  <th className="px-6 py-4 font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : data?.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  data?.data.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium flex items-center gap-1">
                            <User className="w-3 h-3 text-muted-foreground" />
                            {log.user.name}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            {log.user.email}
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                              {log.user.role}
                            </Badge>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="font-mono text-[10px]">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{log.resourceType}</span>
                          <span className="text-xs font-mono text-muted-foreground mt-0.5">
                            {log.resourceId || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                        {log.ipAddress || "Unknown"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20">
            <div className="text-xs text-muted-foreground">
              Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, data?.meta.total || 0)} of {data?.meta.total || 0} entries
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={!data?.meta.totalPages || page >= data.meta.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
