"use client";

import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TrendData {
  date: string;
  count: number;
}

interface PrescriptionTrendsProps {
  data?: TrendData[];
  isLoading: boolean;
}

export function PrescriptionTrends({ data, isLoading }: PrescriptionTrendsProps) {
  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-4 border-border/50 bg-card/40 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Ensure data exists, fallback to empty array
  const chartData = data || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="col-span-1 lg:col-span-4"
    >
      <Card className="border-border/50 bg-card/40 backdrop-blur-sm h-full">
        <CardHeader>
          <CardTitle>Prescription Volume</CardTitle>
          <CardDescription>
            Overview of prescriptions issued over the selected time period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No data available for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: -20,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => {
                      try {
                        return format(parseISO(val), "MMM d");
                      } catch {
                        return val;
                      }
                    }}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md">
                            <p className="text-sm font-medium mb-1">
                              {format(parseISO(label as string), "MMMM d, yyyy")}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <p className="text-sm text-muted-foreground">
                                <span className="font-bold text-foreground">{payload[0]?.value}</span> Prescriptions
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--primary))" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
