"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeProvider, useTheme } from "@/components/providers/theme-provider";
import { ParagoLogo } from "@/components/ui/logo";
import { Avatar, Badge, Button, Card } from "@/components/ui";
import { mockAdminStats, mockChartData } from "@/lib/mock-data";
import { formatCurrency, cn } from "@/lib/utils";
import {
  IconLayoutDashboard,
  IconUsers,
  IconSteeringWheel,
  IconShieldCheck,
  IconRoute,
  IconReportAnalytics,
  IconAlertTriangle,
  IconCreditCard,
  IconSpeakerphone,
  IconCrown,
  IconChartBar,
  IconDownload,
  IconCalendarEvent,
  IconTrendingUp,
  IconTrendingDown,
  IconSearch,
  IconBell,
  IconDotsVertical,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from "recharts";

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("Dashboard"); // Keep for local states if needed
  
  return (
    <>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-heading)]">Tổng quan</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Cập nhật lúc {new Date().toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={<IconCalendarEvent size={16} />} className="bg-surface-0">
            Tháng này
          </Button>
          <Button variant="primary" size="sm" icon={<IconDownload size={16} />}>
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <motion.div 
        initial="hidden" animate="visible" variants={stagger}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { title: "Tổng người dùng", value: "12,847", trend: "+23.5%", icon: IconUsers, color: "text-blue-500", bg: "bg-blue-50" },
          { title: "Chuyến đi hôm nay", value: "342", trend: "+12.4%", icon: IconRoute, color: "text-green-500", bg: "bg-green-50" },
          { title: "Doanh thu (VNĐ)", value: formatCurrency(37480000), trend: "+18.2%", icon: IconCreditCard, color: "text-purple-500", bg: "bg-purple-50" },
          { title: "Premium Sub", value: "1,247", trend: "+5.1%", icon: IconCrown, color: "text-gold-500", bg: "bg-gold-50" },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="p-5 flex items-start gap-4 bg-surface-0 border-surface-200 shadow-sm">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-muted)] mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-[var(--text-heading)]">{stat.value}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <IconTrendingUp size={14} className="text-green-500" />
                  <span className="text-xs font-semibold text-green-500">{stat.trend}</span>
                  <span className="text-xs text-[var(--text-muted)] ml-1">vs tháng trước</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="p-5 bg-surface-0 border-surface-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[var(--text-heading)]">Tăng trưởng người dùng</h3>
            <IconDotsVertical size={16} className="text-surface-400 cursor-pointer" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData.userGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D32F2F" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D32F2F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-surface-200)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#D32F2F', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="users" stroke="#D32F2F" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue Chart */}
        <Card className="p-5 bg-surface-0 border-surface-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[var(--text-heading)]">Doanh thu & Đăng ký Premium</h3>
            <IconDotsVertical size={16} className="text-surface-400 cursor-pointer" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData.revenueByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-surface-200)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                <RechartsTooltip 
                  cursor={{fill: 'var(--color-surface-100)'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#FFC107" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Quick Stats & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Verifications */}
        <Card className="col-span-1 lg:col-span-1 p-5 bg-surface-0 border-surface-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[var(--text-heading)]">Chờ xác minh (12)</h3>
            <Badge variant="primary">Mới</Badge>
          </div>
          <div className="space-y-4 flex-1">
            {[
              { name: "Lê Văn C", uni: "ĐH Bách Khoa", time: "10 phút trước" },
              { name: "Phạm Thị D", uni: "ĐH KTQD", time: "1 giờ trước" },
              { name: "Hoàng Văn E", uni: "ĐH Quốc Gia", time: "3 giờ trước" },
            ].map((user, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-surface-100 hover:border-surface-300 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} size="sm" />
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{user.uni}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors">
                    <IconCheck size={16} />
                  </button>
                  <button className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors">
                    <IconX size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" fullWidth className="mt-4 text-primary-500">Xem tất cả yêu cầu</Button>
        </Card>

        {/* Recent Activity Table */}
        <Card className="col-span-1 lg:col-span-2 p-0 bg-surface-0 border-surface-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-surface-200 flex justify-between items-center">
            <h3 className="font-bold text-[var(--text-heading)]">Hoạt động gần đây</h3>
            <button className="text-sm font-medium text-primary-500 hover:underline">Xem lịch sử</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50 text-xs text-[var(--text-muted)] uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Người dùng</th>
                  <th className="px-5 py-3 font-semibold">Hoạt động</th>
                  <th className="px-5 py-3 font-semibold">Thời gian</th>
                  <th className="px-5 py-3 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { name: "Trần Văn A", action: "Đăng ký tài xế", time: "Vừa xong", status: "pending", statusText: "Chờ duyệt" },
                  { name: "Nguyễn Thị B", action: "Nâng cấp Premium", time: "5 phút trước", status: "success", statusText: "Thành công" },
                  { name: "Lê C", action: "Hủy chuyến đi #1024", time: "15 phút trước", status: "warning", statusText: "Cảnh cáo 1" },
                  { name: "Phạm D", action: "Gửi báo cáo sự cố", time: "1 giờ trước", status: "danger", statusText: "Khẩn cấp" },
                  { name: "Hoàng E", action: "Rút tiền về ngân hàng", time: "2 giờ trước", status: "success", statusText: "Đã xử lý" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-surface-100 hover:bg-surface-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium flex items-center gap-2">
                      <Avatar name={row.name} size="xs" /> {row.name}
                    </td>
                    <td className="px-5 py-3 text-[var(--text-secondary)]">{row.action}</td>
                    <td className="px-5 py-3 text-[var(--text-muted)]">{row.time}</td>
                    <td className="px-5 py-3">
                      <Badge 
                        variant={row.status === "success" ? "success" : row.status === "danger" ? "danger" : row.status === "warning" ? "warning" : "default"} 
                        size="sm"
                      >
                        {row.statusText}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
