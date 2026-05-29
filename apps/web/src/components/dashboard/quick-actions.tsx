"use client";

import { motion } from "framer-motion";
import { Plus, Users, Search, Activity } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  const actions = [
    {
      title: "New Prescription",
      description: "Create a digital Rx",
      icon: Plus,
      href: "/prescriptions/new",
      primary: true,
    },
    {
      title: "View Patients",
      description: "Browse directory",
      icon: Users,
      href: "/patients",
    },
    {
      title: "Search Catalog",
      description: "Find medicines",
      icon: Search,
      href: "#", // Unimplemented in this MVP layout link
    },
    {
      title: "Clinical Reports",
      description: "Generate stats",
      icon: Activity,
      href: "#", // Unimplemented
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden h-full">
        <CardHeader className="pb-4">
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {actions.map((action, i) => (
            <Link key={i} href={action.href} className={action.href === "#" ? "pointer-events-none opacity-50" : ""}>
              <Button
                variant={action.primary ? "gradient" : "outline"}
                className={`w-full justify-start h-auto py-3 px-4 ${
                  !action.primary && "bg-card/50 hover:bg-accent/50 border-border/50"
                }`}
              >
                <div className="flex items-center gap-3 w-full text-left">
                  <div className={`p-2 rounded-lg ${action.primary ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold">{action.title}</div>
                    <div className={`text-xs ${action.primary ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
