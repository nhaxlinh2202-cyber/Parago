"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  IconHome,
  IconCar,
  IconMessage,
  IconUser,
  IconPlus,
  IconBell,
  IconSearch,
  IconMoon,
  IconSun,
  IconChevronLeft,
} from "@tabler/icons-react";
import { ParagoLogo } from "@/components/ui/logo";
import { Badge as UIBadge, FAB } from "@/components/ui";
import { useTheme } from "@/components/providers/theme-provider";
import { NotificationBell } from "./NotificationBell";
import { useMessageStore } from "@/store/message-store";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

// ==========================================
// BOTTOM NAVIGATION (Mobile)
// ==========================================
export function BottomNav() {
  const pathname = usePathname();
  const unreadCount = useMessageStore((state) => state.unreadCount);

  const navItems = [
    { href: "/home", icon: IconHome, label: "Trang chủ" },
    { href: "/rides/my", icon: IconCar, label: "Chuyến đi" },
    { href: "/messages", icon: IconMessage, label: "Tin nhắn", badge: unreadCount },
    { href: "/profile", icon: IconUser, label: "Cá nhân" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-strong safe-bottom md:hidden">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto relative">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-16 py-1 transition-all duration-200",
                isActive ? "text-primary-500" : "text-[var(--text-muted)]"
              )}
            >
              <div className="relative">
                <item.icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={cn(
                    "transition-all duration-200",
                    isActive && "scale-110"
                  )}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full bg-primary-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all",
                isActive ? "text-primary-500" : "text-[var(--text-muted)]"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ==========================================
// TOP HEADER (App Header)
// ==========================================
interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  showLogo?: boolean;
  showSearch?: boolean;
  showNotification?: boolean;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  onBack?: () => void;
}

export function AppHeader({
  title,
  showBack,
  showLogo = false,
  showSearch = false,
  showNotification = false,
  rightAction,
  transparent = false,
  onBack,
}: AppHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 safe-top",
        transparent ? "bg-transparent" : "glass-strong"
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
        {/* Left */}
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors"
            >
              <IconChevronLeft size={20} />
            </button>
          )}
          {showLogo && (
            <Link href="/home" className="flex items-center gap-2">
              <ParagoLogo size={28} color="#D32F2F" showText />
            </Link>
          )}
          {title && (
            <h1 className="text-lg font-bold text-[var(--text-heading)]">{title}</h1>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors text-[var(--text-muted)]">
              <IconSearch size={20} />
            </button>
          )}
          {showNotification && (
            <NotificationBell />
          )}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors text-[var(--text-muted)]"
          >
            {resolvedTheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
          </button>
          {rightAction}
        </div>
      </div>
    </header>
  );
}

// ==========================================
// SIDEBAR (Desktop)
// ==========================================
export function Sidebar() {
  const pathname = usePathname();
  const unreadCount = useMessageStore((state) => state.unreadCount);

  const sidebarItems = [
    { href: "/home", icon: IconHome, label: "Trang chủ" },
    { href: "/rides/my", icon: IconCar, label: "Chuyến đi" },
    { href: "/messages", icon: IconMessage, label: "Tin nhắn", badge: unreadCount },
    { href: "/profile", icon: IconUser, label: "Cá nhân" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-[var(--border-default)] bg-[var(--bg-card)] z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--border-default)]">
        <ParagoLogo size={32} color="#D32F2F" showText />
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 h-11 px-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
                  : "text-[var(--text-secondary)] hover:bg-surface-100 dark:hover:bg-surface-200"
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{item.label}</span>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className="ml-auto min-w-[20px] h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center px-1.5">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Create ride button */}
      <div className="p-4 border-t border-[var(--border-default)]">
        <Link
          href="/rides/create"
          className="flex items-center justify-center gap-2 h-11 w-full rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-all btn-press"
        >
          <IconPlus size={18} />
          Tạo chuyến đi
        </Link>
      </div>
    </aside>
  );
}

// ==========================================
// MAIN LAYOUT
// ==========================================
import { ChatbotWidget } from "@/components/ui/chatbot-widget";

export function AppLayout({ children, hideBottomNav = false }: { children: React.ReactNode, hideBottomNav?: boolean }) {
  const { fetchUnreadCount } = useMessageStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchUnreadCount]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Sidebar />
      <main className={cn("md:ml-64", hideBottomNav ? "pb-0" : "pb-20 md:pb-0")}>
        {children}
      </main>
      {!hideBottomNav && (
        <>
          <BottomNav />
          {/* Mobile FAB */}
          <div className="fixed right-4 bottom-20 z-30 md:hidden">
            <Link href="/rides/create">
              <FAB icon={<IconPlus size={24} />} size="lg" />
            </Link>
          </div>
          <ChatbotWidget />
        </>
      )}
    </div>
  );
}
