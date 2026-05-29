"use client";

import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Calendar,
  Pill,
  Settings
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const getNavigation = (role?: string) => {
  const base = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Prescriptions", href: "/prescriptions", icon: FileText },
  ];

  if (role === "DOCTOR") {
    return [
      ...base,
      { name: "Patients", href: "/patients", icon: Users },
      { name: "Settings", href: "/settings", icon: Settings },
    ];
  }

  if (role === "PATIENT") {
    return [
      ...base,
      { name: "Medication Schedule", href: "/schedule", icon: Calendar },
      { name: "Settings", href: "/settings", icon: Settings },
    ];
  }

  return base;
};

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const navigation = getNavigation(user?.role);

  return (
    <div className="flex h-full w-64 flex-col bg-card/50 backdrop-blur-xl border-r border-border/50">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
            <Pill className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold">
            Prescribe<span className="text-primary">Flow</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              {item.name}
              
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full animate-in fade-in-0 zoom-in-95 duration-200" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile snippet at bottom */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate text-foreground">
              {user?.name || "Loading..."}
            </span>
            <span className="text-xs truncate text-muted-foreground capitalize">
              {user?.role?.toLowerCase() || "User"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
