"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api-client";
import { useNotificationsSocket } from "@/hooks/useNotificationsSocket";
import { AnimatePresence, motion } from "framer-motion";
import { IconBellRinging, IconCheck, IconCar, IconX, IconInfoCircle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "RIDE_ACCEPTED" | "RIDE_REJECTED" | "NEW_JOIN_REQUEST" | "RIDE_CANCELLED" | "SYSTEM";
  isRead: boolean;
  link?: string;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeToasts, setActiveToasts] = useState<Notification[]>([]);
  const token = useAuthStore((state) => state.accessToken);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiClient.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token, fetchNotifications]);

  useNotificationsSocket({
    token,
    onNewNotification: (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      
      // Add to toast, limit to 3
      setActiveToasts((prev) => {
        const newToasts = [notification, ...prev];
        return newToasts.slice(0, 3);
      });

      // Auto dismiss after 4s
      setTimeout(() => {
        setActiveToasts((prev) => prev.filter((t) => t.id !== notification.id));
      }, 4000);
    },
  });

  const markAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch(`/notifications/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const removeToast = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getToastStyle = (type: string) => {
    switch (type) {
      case "RIDE_ACCEPTED":
        return { icon: <IconCheck size={20} className="text-white" />, bg: "bg-green-500" };
      case "RIDE_REJECTED":
        return { icon: <IconX size={20} className="text-white" />, bg: "bg-red-500" };
      case "NEW_JOIN_REQUEST":
        return { icon: <IconCar size={20} className="text-white" />, bg: "bg-blue-500" };
      case "RIDE_CANCELLED":
        return { icon: <IconInfoCircle size={20} className="text-white" />, bg: "bg-orange-500" };
      default:
        return { icon: <IconBellRinging size={20} className="text-white" />, bg: "bg-primary-500" };
    }
  };

  const handleToastClick = (toast: Notification) => {
    if (!toast.isRead) markAsRead(toast.id);
    removeToast(toast.id);
    
    // Navigate based on type or link
    if (toast.link) {
      router.push(toast.link);
    } else if (toast.type === "RIDE_ACCEPTED") {
      router.push(`/messages`);
    } else if (toast.type === "NEW_JOIN_REQUEST") {
      router.push(`/rides/my`);
    } else if (toast.type === "RIDE_CANCELLED") {
      router.push(`/rides`);
    }
  };

  if (!token) return <>{children}</>;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-32px)] pointer-events-none">
        <AnimatePresence>
          {activeToasts.map((toast) => {
            const style = getToastStyle(toast.type);
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={cn(
                  "pointer-events-auto flex items-start gap-3 rounded-xl shadow-2xl p-3 cursor-pointer",
                  "bg-[var(--bg-card)] border border-[var(--border-default)]"
                )}
                onClick={() => handleToastClick(toast)}
              >
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", style.bg)}>
                  {style.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[var(--text-heading)] line-clamp-1">{toast.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-0.5">{toast.message}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  className="p-1 rounded-full hover:bg-[var(--surface-hover)] text-[var(--text-muted)] transition-colors shrink-0"
                >
                  <IconX size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}
