"use client";

import React from "react";
import Link from "next/link";

type MenuItem = {
  icon: any;
  label: string;
  href?: string;
  color: string;
  bg: string;
  isNew?: boolean;
  badge?: string;
  value?: string;
  isToggle?: boolean;
  toggleValue?: boolean;
  onClick?: () => void;
};
import { motion } from "framer-motion";
import { AppLayout, AppHeader } from "@/components/layout";
import { Avatar, Badge, StarRating } from "@/components/ui";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import {
  IconChevronRight,
  IconHistory,
  IconBookmark,
  IconCar,
  IconSteeringWheel,
  IconSettings,
  IconLanguage,
  IconMoon,
  IconSun,
  IconHelpCircle,
  IconMessageReport,
  IconLogout,
  IconCrown,
  IconShieldCheck,
  IconLeaf,
} from "@tabler/icons-react";

export default function ProfilePage() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (e) {
      console.error("Logout failed on server", e);
    } finally {
      logout();
      router.push("/login");
    }
  };

  const currentUser = user || {
    name: "Loading...",
    university: "...",
    faculty: "...",
    avatar: undefined,
    verified: false,
    isPremium: false,
    ecoPoints: 0,
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: "Chuyến đi",
      items: [
        { icon: IconHistory, label: "Lịch sử chuyến đi", href: "#", color: "text-blue-500", bg: "bg-blue-50" },
        { icon: IconBookmark, label: "Chuyến đi đã lưu", href: "#", color: "text-orange-500", bg: "bg-orange-50" },
      ]
    },
    {
      title: "Tài khoản",
      items: [
        { icon: IconCar, label: "Quản lý phương tiện", href: "#", color: "text-indigo-500", bg: "bg-indigo-50" },
        { icon: IconSteeringWheel, label: "Đăng ký tài xế", href: "#", color: "text-green-500", bg: "bg-green-50", isNew: true },
        { icon: IconCrown, label: "Bạn Đồng Hành Premium", href: "/premium", color: "text-gold-500", bg: "bg-gold-50", badge: "Nâng cấp" },
      ]
    },
    {
      title: "Cài đặt & Hỗ trợ",
      items: [
        { icon: IconSettings, label: "Cài đặt tài khoản", href: "#", color: "text-slate-500", bg: "bg-slate-50" },
        { icon: IconLanguage, label: "Ngôn ngữ", href: "#", color: "text-slate-500", bg: "bg-slate-50", value: "Tiếng Việt" },
        { 
          icon: resolvedTheme === "dark" ? IconMoon : IconSun, 
          label: "Chế độ tối", 
          onClick: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
          color: "text-slate-500", 
          bg: "bg-slate-50",
          isToggle: true,
          toggleValue: resolvedTheme === "dark"
        },
        { icon: IconHelpCircle, label: "Trợ giúp & Hỗ trợ", href: "#", color: "text-slate-500", bg: "bg-slate-50" },
        { icon: IconMessageReport, label: "Báo cáo vấn đề", href: "#", color: "text-slate-500", bg: "bg-slate-50" },
      ]
    }
  ];

  return (
    <AppLayout>
      <AppHeader title="Cá nhân" showLogo />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-6 pb-24">
        {/* PROFILE HEADER CARD */}
        <div className="bg-surface-0 rounded-3xl p-5 border border-surface-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="relative">
              <Avatar name={currentUser.name} src={(currentUser as any).avatarUrl || (currentUser as any).avatar} size="xl" />
              {currentUser.verified && (
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm">
                  <IconShieldCheck size={20} className="text-primary-500" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[var(--text-heading)] mb-1 flex items-center gap-2">
                {currentUser.name}
                {currentUser.isPremium && <IconCrown size={18} className="text-gold-500" />}
              </h2>
              <p className="text-sm text-[var(--text-muted)]">{currentUser.university}</p>
              <p className="text-sm text-[var(--text-muted)]">{currentUser.faculty}</p>
            </div>
            
            <button className="w-10 h-10 bg-surface-100 hover:bg-surface-200 rounded-full flex items-center justify-center transition-colors">
              <IconSettings size={20} className="text-surface-600" />
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-surface-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="font-bold text-lg text-[var(--text-heading)]">4.9</span>
                <IconStarFilled size={14} className="text-gold-500" />
              </div>
              <span className="text-xs text-[var(--text-muted)]">Đánh giá</span>
            </div>
            <div className="text-center border-l border-r border-surface-200">
              <div className="font-bold text-lg text-[var(--text-heading)] mb-1">98%</div>
              <span className="text-xs text-[var(--text-muted)]">Hoàn thành</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="font-bold text-lg text-[var(--text-heading)]">{currentUser.ecoPoints}</span>
                <IconLeaf size={14} className="text-green-500" />
              </div>
              <span className="text-xs text-[var(--text-muted)]">Eco Points</span>
            </div>
          </div>

          {/* Trust Score */}
          <div className="mt-6 pt-6 border-t border-surface-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold flex items-center gap-1.5">
                <IconShieldCheck size={16} className="text-primary-500" /> 
                Điểm tin cậy
              </span>
              <span className="text-sm font-bold text-primary-500">Tuyệt vời</span>
            </div>
            <div className="h-2 w-full bg-surface-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-red-500" style={{ width: '20%' }} />
              <div className="h-full bg-gold-400" style={{ width: '40%' }} />
              <div className="h-full bg-green-500" style={{ width: '40%' }} />
            </div>
          </div>
        </div>

        {/* MENU SECTIONS */}
        <div className="space-y-6">
          {menuSections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-3 px-2 uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="bg-surface-0 rounded-2xl border border-surface-200 overflow-hidden">
                {section.items.map((item, itemIdx) => {
                  const isLast = itemIdx === section.items.length - 1;
                  const Wrapper = item.href ? Link : "div";
                  
                  return (
                    <Wrapper
                      key={itemIdx}
                      href={item.href || "#"}
                      onClick={item.onClick}
                      className={cn(
                        "flex items-center p-4 transition-colors cursor-pointer",
                        !isLast && "border-b border-surface-100",
                        item.href && "hover:bg-surface-50"
                      )}
                    >
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mr-3 shrink-0 dark:bg-opacity-10", item.bg, item.color)}>
                        <item.icon size={20} />
                      </div>
                      
                      <div className="flex-1 font-medium text-sm text-[var(--text-heading)]">
                        {item.label}
                      </div>

                      <div className="flex items-center gap-3">
                        {item.isNew && (
                          <Badge variant="primary" size="sm" className="h-5">Mới</Badge>
                        )}
                        {item.badge && (
                          <Badge variant="gold" size="sm" className="h-5">{item.badge}</Badge>
                        )}
                        {item.value && (
                          <span className="text-sm text-[var(--text-muted)]">{item.value}</span>
                        )}
                        {item.isToggle && (
                          <div className={cn(
                            "w-11 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer",
                            item.toggleValue ? "bg-primary-500" : "bg-surface-200"
                          )}>
                            <div className={cn(
                              "w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                              item.toggleValue ? "translate-x-5" : "translate-x-0"
                            )} />
                          </div>
                        )}
                        {!item.isToggle && (
                          <IconChevronRight size={20} className="text-surface-300" />
                        )}
                      </div>
                    </Wrapper>
                  );
                })}
              </div>
            </div>
          ))}

          {/* LOGOUT BUTTON */}
          <div className="bg-surface-0 rounded-2xl border border-surface-200 overflow-hidden">
            <button onClick={handleLogout} className="w-full flex items-center p-4 hover:bg-red-50/50 transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mr-3 shrink-0 group-hover:bg-red-100 transition-colors">
                <IconLogout size={20} />
              </div>
              <div className="flex-1 font-medium text-sm text-red-600 text-left">
                Đăng xuất
              </div>
            </button>
          </div>
          
          <div className="text-center pb-6 pt-2 text-xs text-[var(--text-muted)]">
            Phiên bản 1.0.0 (Build 2026)
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Added missing icon component for use in this file
function IconStarFilled({ size, className }: { size?: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
    </svg>
  );
}
