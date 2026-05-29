"use client";

import { motion } from "framer-motion";
import { Users, FileText, Pill, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsCardsProps {
  data?: {
    totalPatients: number;
    activePrescriptions: number;
    totalPrescriptions: number;
    adherenceRate: number;
    alerts: number;
  };
  isLoading: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function AnalyticsCards({ data, isLoading }: AnalyticsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border/50 bg-card/40 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px] mb-2" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Patients",
      value: data?.totalPatients ?? 0,
      icon: Users,
      trend: "+12%",
      trendUp: true,
      description: "from last month",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Active Prescriptions",
      value: data?.activePrescriptions ?? 0,
      icon: FileText,
      trend: "+4%",
      trendUp: true,
      description: "currently active",
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      title: "Avg Adherence Rate",
      value: `${data?.adherenceRate ?? 0}%`,
      icon: Pill,
      trend: "-2%",
      trendUp: false,
      description: "across all patients",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Critical Alerts",
      value: data?.alerts ?? 0,
      icon: AlertTriangle,
      trend: "Requires attention",
      trendUp: false,
      description: "interactions or missed",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card, i) => (
        <motion.div key={i} variants={itemVariants as any}>
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm hover:bg-accent/10 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {card.title !== "Critical Alerts" && (
                  <span className={card.trendUp ? "text-emerald-500 flex items-center" : "text-destructive flex items-center"}>
                    {card.trendUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    {card.trend}
                  </span>
                )}
                {card.title === "Critical Alerts" && (
                  <span className="text-amber-500">{card.trend}</span>
                )}
                <span className="opacity-70">{card.description}</span>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
