"use client";

import { Bell, LogOut, Search, User } from "lucide-react";

import { NotificationBell } from "@/components/notification-bell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogout } from "@/hooks/use-auth";

export function Navbar() {
  const logoutMutation = useLogout();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-card/50 backdrop-blur-xl px-6">
      {/* Search Bar */}
      <div className="flex flex-1">
        <div className="w-full max-w-md relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search prescriptions, patients..." 
            className="pl-10 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary transition-all duration-300 rounded-full h-10"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationBell />

        <div className="h-6 w-px bg-border/50 mx-1" />

        {/* Profile / Logout */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline-block">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
