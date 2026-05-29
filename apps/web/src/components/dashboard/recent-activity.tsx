"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { FileText, UserPlus, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Activity {
  id: string;
  type: string;
  patientName: string;
  diagnosis: string;
  createdAt: string;
  status: string;
}

interface RecentActivityProps {
  data?: Activity[];
  isLoading: boolean;
}

export function RecentActivity({ data, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-3 border-border/50 bg-card/40 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
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

  const activities = data || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="col-span-1 lg:col-span-3 h-full"
    >
      <Card className="border-border/50 bg-card/40 backdrop-blur-sm h-full flex flex-col">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest prescriptions and system events.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {activities.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              No recent activity.
            </div>
          ) : (
            <div className="space-y-6">
              {activities.map((activity, i) => (
                <Link key={activity.id} href={`/prescriptions/${activity.id}`} className="block group">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-start gap-4 relative"
                  >
                    {/* Timeline connecting line */}
                    {i !== activities.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-border/50 group-hover:bg-primary/20 transition-colors" />
                    )}

                    {/* Icon */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors z-10 text-primary">
                      {activity.status === 'COMPLETED' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          Prescription for {activity.patientName}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground truncate">
                          {activity.diagnosis}
                        </p>
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
