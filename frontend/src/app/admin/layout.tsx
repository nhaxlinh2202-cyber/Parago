"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth-store";
import { ThemeProvider, useTheme } from "@/components/providers/theme-provider";
import { ParagoLogo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  IconLayoutDashboard,
  IconUsers,
  IconRoute,
  IconAlertTriangle,
  IconSearch,
  IconBell,
  IconDotsVertical,
  IconSettings,
} from "@tabler/icons-react";

const navItems = [
  { icon: IconLayoutDashboard, label: "Tổng quan", href: "/admin" },
  { icon: IconUsers, label: "Người dùng", href: "/admin/users" },
  { icon: IconRoute, label: "Chuyến đi", href: "/admin/rides" },
  { icon: IconAlertTriangle, label: "SOS", href: "/admin/sos", badgeColor: "bg-red-500" },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isInitialized, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated || (user?.systemRole !== 'ADMIN' && user?.systemRole !== 'MODERATOR')) {
        router.replace("/home");
      }
    }
  }, [isInitialized, isAuthenticated, user, router]);

  if (!isInitialized || !isAuthenticated || (user?.systemRole !== 'ADMIN' && user?.systemRole !== 'MODERATOR')) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-50">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-slate-950 font-sans text-sm">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto hidden lg:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <ParagoLogo size={28} color="#FFFFFF" showText />
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">Quản trị hệ thống</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                  isActive 
                    ? "bg-primary-600 text-white font-medium shadow-sm" 
                    : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span className="flex-1">{item.label}</span>
                {item.badgeColor && (
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    item.badgeColor
                  )} />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar name={user.name} size="sm" src={user.avatarUrl} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.systemRole}</p>
            </div>
            <IconSettings size={16} className="text-slate-500 cursor-pointer hover:text-white" />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-surface-0 border-b border-surface-200 flex items-center justify-between px-6 shrink-0 z-10 relative">
          <div className="flex items-center gap-4 lg:hidden">
             <ParagoLogo size={24} color="#D32F2F" />
             <span className="font-bold text-lg">Admin</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="w-full h-10 pl-10 pr-4 bg-surface-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-surface-500 hover:text-surface-700 transition-colors">
              <IconBell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="h-8 w-px bg-surface-200 mx-2" />
            <Link href="/home" target="_blank" className="text-sm font-medium text-primary-500 hover:underline">
              Tới App →
            </Link>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ThemeProvider>
  );
}
