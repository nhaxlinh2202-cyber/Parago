"use client";

import React, { useState, useEffect, useRef } from "react";
import { IconBell, IconBellRinging, IconCheck, IconCar, IconX, IconInfoCircle, IconChecks } from "@tabler/icons-react";
import { cn, formatTime } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, Notification } from "@/components/providers/notification-provider";

export function NotificationBell() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIconForType = (type: string) => {
    switch (type) {
      case "RIDE_ACCEPTED":
        return <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0"><IconCheck size={18} /></div>;
      case "RIDE_REJECTED":
        return <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0"><IconX size={18} /></div>;
      case "NEW_JOIN_REQUEST":
        return <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0"><IconCar size={18} /></div>;
      case "RIDE_CANCELLED":
        return <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0"><IconInfoCircle size={18} /></div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0"><IconBell size={18} /></div>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors text-[var(--text-muted)] relative"
      >
        {unreadCount > 0 ? (
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
            className="text-primary-500"
          >
            <IconBellRinging size={20} />
          </motion.div>
        ) : (
          <IconBell size={20} />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 rounded-full bg-primary-500 text-white text-[9px] font-bold flex items-center justify-center px-1 border border-[var(--bg-card)] shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-hidden bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xl rounded-2xl z-50 flex flex-col"
          >
            <div className="p-3 border-b border-[var(--border-default)] flex items-center justify-between sticky top-0 bg-[var(--bg-card)]/90 backdrop-blur-md z-10">
              <h3 className="font-bold text-sm">Thông báo</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
                >
                  <IconChecks size={14} />
                  Đã đọc tất cả
                </button>
              )}
            </div>
            
            <div className="flex flex-col overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-muted)] text-sm flex flex-col items-center gap-2">
                  <IconBell size={32} className="opacity-20" />
                  Không có thông báo nào
                </div>
              ) : (
                notifications.map((n: Notification) => (
                  <Link 
                    href={n.link || '#'} 
                    key={n.id}
                    onClick={() => {
                      if (!n.isRead) markAsRead(n.id);
                      setShowDropdown(false);
                    }}
                    className={cn(
                      "p-3 border-b border-[var(--border-default)] last:border-0 hover:bg-surface-50 dark:hover:bg-surface-200 transition-colors flex gap-3 relative overflow-hidden",
                      !n.isRead ? "bg-primary-50/30 dark:bg-primary-500/5" : ""
                    )}
                  >
                    {!n.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
                    )}
                    {getIconForType(n.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={cn("text-sm font-semibold truncate", !n.isRead ? "text-[var(--text-heading)]" : "text-[var(--text-secondary)]")}>
                          {n.title}
                        </h4>
                      </div>
                      <p className={cn("text-xs line-clamp-2 mb-1", !n.isRead ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]")}>
                        {n.message}
                      </p>
                      <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">
                        {formatTime(new Date(n.createdAt))}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
