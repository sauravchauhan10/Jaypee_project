"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import { FileText, Stethoscope, ArrowRight, Download } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PatientPrescriptionsProps {
  prescriptions?: any[];
  isLoading: boolean;
}

export function PatientPrescriptions({ prescriptions, isLoading }: PatientPrescriptionsProps) {
  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-2 border-border/50 bg-card/40 backdrop-blur-sm h-full">
        <CardHeader>
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const rxList = prescriptions || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="col-span-1 lg:col-span-2 h-full"
    >
      <Card className="border-border/50 bg-card/40 backdrop-blur-sm h-full flex flex-col">
        <CardHeader className="pb-4 flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Recent Prescriptions
            </CardTitle>
            <CardDescription>Your latest digital records.</CardDescription>
          </div>
          <Link href="/prescriptions">
            <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary hover:bg-primary/10 -mt-1">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {rxList.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm border border-dashed border-border/50 rounded-xl p-6">
              No prescriptions found on your record.
            </div>
          ) : (
            <div className="space-y-4">
              {rxList.slice(0, 4).map((rx, i) => (
                <motion.div 
                  key={rx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <Link href={`/prescriptions/${rx.id}`}>
                    <div className="group border border-border/50 rounded-xl p-4 bg-background/50 hover:bg-accent/10 hover:border-primary/30 transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-base truncate group-hover:text-primary transition-colors pr-2">
                          {rx.diagnosis}
                        </div>
                        <Badge variant={rx.status === "ACTIVE" ? "success" : "secondary"} className="shrink-0">
                          {rx.status}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Stethoscope className="w-3.5 h-3.5" /> Dr. {rx.doctor.name}
                        </span>
                        <span className="opacity-50">|</span>
                        <span>{format(new Date(rx.createdAt), "MMM d, yyyy")}</span>
                        <span className="opacity-50">|</span>
                        <span>{rx.medicines.length} medications</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
