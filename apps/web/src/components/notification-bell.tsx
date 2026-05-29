"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Bell, Check, Info, FileText, Pill } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { useSocket } from "@/hooks/use-socket";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

export function NotificationBell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // Fetch unread history
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["notifications", "unread"],
    queryFn: () => api.get("/api/notifications/unread").then((res: any) => res.data?.data || res.data),
    staleTime: 60000, // 1 minute
  });

  // Listen to live events
  React.useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      // Optimistically prepend to React Query cache
      queryClient.setQueryData(["notifications", "unread"], (old: Notification[] = []) => {
        return [notification, ...old];
      });
      
      // Show native toast
      toast(notification.title, {
        description: notification.message,
        icon: getIconForType(notification.type),
      });
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket, queryClient]);

  // Mark single as read
  const markRead = useMutation({
    mutationFn: (id: string) => api.put(`/api/notifications/${id}/read`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications", "unread"] });
      const prev = queryClient.getQueryData<Notification[]>(["notifications", "unread"]);
      
      queryClient.setQueryData(["notifications", "unread"], (old: Notification[] = []) => 
        old.filter(n => n.id !== id)
      );

      return { prev };
    },
    onError: (err, id, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["notifications", "unread"], context.prev);
      }
    }
  });

  // Mark all as read
  const markAllRead = useMutation({
    mutationFn: () => api.put("/api/notifications/mark-all-read"),
    onSuccess: () => {
      queryClient.setQueryData(["notifications", "unread"], []);
    }
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'PRESCRIPTION_CREATED': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'MEDICATION_REMINDER': return <Pill className="w-4 h-4 text-emerald-500" />;
      default: return <Info className="w-4 h-4 text-indigo-500" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markRead.mutate(notification.id);
    
    // Navigate based on type
    if (notification.metadata?.prescriptionId) {
      router.push(`/prescriptions/${notification.metadata.prescriptionId}`);
    }
  };

  const unreadCount = notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 border-border/50">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.preventDefault();
                markAllRead.mutate();
              }}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {unreadCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Check className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5 shrink-0">
                      {getIconForType(notification.type)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{notification.title}</p>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/80 font-mono mt-1">
                        {format(new Date(notification.createdAt), "h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
