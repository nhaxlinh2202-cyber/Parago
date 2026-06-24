"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppLayout, AppHeader } from "@/components/layout";
import { Card, Avatar, Badge, Input, StarRating, Skeleton, Button } from "@/components/ui";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";
import { type Ride } from "@/lib/mock-data";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api-client";
import { format } from "date-fns";
import {
  IconSearch,
  IconClock,
  IconCalendar,
  IconUsers,
  IconCar,
  IconMotorbike,
  IconLeaf,
  IconGasStation,
  IconChevronRight,
  IconMapPin,
  IconArrowRight,
  IconPlus,
} from "@tabler/icons-react";

// Shared status colors mapping
const statusColors: Record<string, {bg: string, text: string, label: string}> = {
  published: { bg: "bg-green-50 dark:bg-green-500/10", text: "text-green-600 dark:text-green-400", label: "Đang mở" },
  matched: { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", label: "Đã ghép" },
  confirmed: { bg: "bg-primary-50 dark:bg-primary-500/10", text: "text-primary-600 dark:text-primary-400", label: "Đã xác nhận" },
  "in-progress": { bg: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", label: "Đang đi" },
  completed: { bg: "bg-surface-100 dark:bg-surface-200", text: "text-text-secondary", label: "Hoàn thành" },
  cancelled: { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-600 dark:text-red-400", label: "Đã hủy" },
  // Real API statuses
  PENDING: { bg: "bg-green-50 dark:bg-green-500/10", text: "text-green-600 dark:text-green-400", label: "Đang mở" },
  ACTIVE: { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", label: "Đã ghép" },
  COMPLETED: { bg: "bg-surface-100 dark:bg-surface-200", text: "text-text-secondary", label: "Hoàn thành" },
  CANCELLED: { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-600 dark:text-red-400", label: "Đã hủy" },
};

function RideCard({ ride, index }: { ride: Ride; index: number }) {
  const status = statusColors[ride.status] || { bg: "bg-surface-100", text: "text-text-secondary", label: ride.status || "Unknown" };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <Link href={`/rides/${ride.id}`}>
        <Card variant="elevated" hover className="overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Avatar name={ride.driver.name} size="md" verified={ride.driver.verified} premium={ride.driver.isPremium} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-[var(--text-heading)]">{ride.driver.name}</span>
                  {ride.createdAt && (
                    <span className="text-[11px] text-[var(--text-muted)] font-normal ml-1">
                      • {formatRelativeTime(ride.createdAt)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <StarRating rating={ride.driver.rating} size="sm" />
                  <span className="text-xs text-[var(--text-muted)]">{ride.driver.rating}</span>
                </div>
              </div>
            </div>
            {ride.matchScore && (
              <Badge variant="primary" size="sm">
                {ride.matchScore}% phù hợp
              </Badge>
            )}
          </div>

          {/* Route */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex flex-col items-center mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
              <div className="w-0.5 h-8 bg-surface-200 dark:bg-surface-300 my-0.5" />
              <div className="w-2.5 h-2.5 rounded-full bg-gold-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-heading)] truncate">{ride.pickupShort}</p>
              <p className="text-[11px] text-[var(--text-muted)] truncate mb-2">{ride.pickup}</p>
              <p className="text-sm font-medium text-[var(--text-heading)] truncate">{ride.destinationShort}</p>
              <p className="text-[11px] text-[var(--text-muted)] truncate">{ride.destination}</p>
            </div>
          </div>

          {/* Info row */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              <IconClock size={14} /> {ride.departureTime}
            </div>
            <span className="text-surface-300">•</span>
            <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              <IconCalendar size={14} /> {ride.date}
            </div>
            <span className="text-surface-300">•</span>
            <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              <IconUsers size={14} /> {ride.seatsAvailable}/{ride.seats} chỗ
            </div>
            <span className="text-surface-300">•</span>
            <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              {ride.vehicleType === "car" ? <IconCar size={14} /> : <IconMotorbike size={14} />}
              {ride.distance}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-light)]">
            <div className="flex items-center gap-2">
              {ride.mode === "community" ? (
                <Badge variant="success" size="sm">
                  <IconLeaf size={12} /> Miễn phí
                </Badge>
              ) : (
                <Badge variant="gold" size="sm">
                  <IconGasStation size={12} /> {formatCurrency(ride.price)}
                </Badge>
              )}
            </div>
            <Button size="sm" variant="primary">
              Ghép xe <IconChevronRight size={14} />
            </Button>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

function RideCardSkeleton() {
  return (
    <Card variant="elevated" className="space-y-3">
      <div className="flex items-center gap-2.5">
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="space-y-1.5">
          <Skeleton className="w-28 h-3.5" />
          <Skeleton className="w-16 h-3" />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <Skeleton variant="circular" className="w-2.5 h-2.5" />
          <Skeleton className="w-0.5 h-8" />
          <Skeleton variant="circular" className="w-2.5 h-2.5" />
        </div>
        <div className="flex-1 space-y-2">
          <Skeleton className="w-3/4 h-3.5" />
          <Skeleton className="w-1/2 h-3" />
          <Skeleton className="w-2/3 h-3.5" />
          <Skeleton className="w-1/3 h-3" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="w-16 h-5 rounded-full" />
        <Skeleton className="w-20 h-5 rounded-full" />
      </div>
    </Card>
  );
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [rides, setRides] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get("/rides?status=PENDING");
        
        // Map API data to UI format
        const formattedRides = res.data.map((r: any) => {
          const dateObj = new Date(r.departureAt);
          return {
            ...r,
            pickupShort: r.pickupLocation.split(",")[0],
            pickup: r.pickupLocation,
            destinationShort: r.destinationLocation.split(",")[0],
            destination: r.destinationLocation,
            departureTime: format(dateObj, "HH:mm"),
            date: format(dateObj, "dd/MM"),
            createdAt: r.createdAt,
            seats: r.totalSeats,
            distance: typeof r.distance === 'number' && !isNaN(r.distance) ? `${(r.distance / 1000).toFixed(1)} km` : "--",
            mode: r.mode === "GAS_TIP" ? "gas-tip" : "community",
          };
        });
        
        setRides(formattedRides);
      } catch (error) {
        console.error("Failed to fetch rides:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRides();
  }, []);

  const sortedRides = [...rides].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <AppLayout>
      <AppHeader title="Trang chủ" showNotification showLogo />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-6 pb-24">
        {/* GREETING */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name || "User"} src={user?.avatarUrl} size="lg" verified={user?.verified} premium={user?.isPremium} />
            <div>
              <p className="text-sm text-[var(--text-muted)]">Chào buổi sáng,</p>
              <h2 className="text-xl font-bold text-[var(--text-heading)]">
                {user?.name ? user.name.trim().split(" ").pop() : "Bạn"}! 👋
              </h2>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="success" className="mb-1">
              <IconLeaf size={12} className="mr-1" /> {user?.ecoPoints || 0}
            </Badge>
            <div className="text-xs text-[var(--text-muted)]">Eco Points</div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <Link href="/rides" className="block">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary-500/10 blur-xl rounded-2xl group-hover:bg-primary-500/20 transition-all duration-300" />
            <Card variant="glass" className="relative flex items-center gap-3 p-4 border-primary-100 dark:border-primary-900 shadow-lg shadow-primary-500/10">
              <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-500/20 flex items-center justify-center text-primary-500">
                <IconSearch size={20} />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-[var(--text-heading)]">Bạn muốn đi đâu?</p>
                <p className="text-sm text-[var(--text-muted)]">Tìm chuyến đi cùng trường...</p>
              </div>
            </Card>
          </div>
        </Link>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/rides">
            <Card variant="elevated" hover className="h-full flex flex-col items-center justify-center p-4 text-center border border-transparent hover:border-primary-500/30">
              <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-200 flex items-center justify-center text-primary-500 mb-3">
                <IconSearch size={24} />
              </div>
              <h3 className="font-semibold text-[var(--text-heading)]">Tìm xe</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">Ghép chuyến đi chung</p>
            </Card>
          </Link>
          <Link href="/rides/create">
            <Card variant="elevated" hover className="h-full flex flex-col items-center justify-center p-4 text-center border border-transparent hover:border-primary-500/30">
              <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-500/20 flex items-center justify-center text-primary-500 mb-3">
                <IconPlus size={24} />
              </div>
              <h3 className="font-semibold text-[var(--text-heading)]">Đăng chuyến</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">Chia sẻ chỗ trống</p>
            </Card>
          </Link>
        </div>

        {/* FILTER CHIPS */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pt-2">
          {["Tất cả", "Cùng trường", "Miễn phí", "Ô tô", "Xe máy"].map((filter, i) => (
            <button
              key={filter}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200",
                i === 0
                  ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                  : "bg-surface-100 text-text-secondary hover:bg-surface-200 dark:bg-surface-200 dark:hover:bg-surface-300"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* FEED SECTION */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--text-heading)]">Chuyến đi gợi ý</h3>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="text-sm bg-surface-100 dark:bg-surface-200 border-none rounded-lg px-2 py-1 text-[var(--text-heading)] focus:ring-1 focus:ring-primary-500 font-medium cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <RideCardSkeleton key={i} />)
              : sortedRides.length > 0 ? sortedRides.slice(0, 10).map((ride, i) => (
                  <RideCard key={ride.id} ride={ride} index={i} />
                )) : (
                  <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                    Chưa có chuyến đi nào phù hợp
                  </div>
                )}
          </div>
        </div>

        {/* WEEKEND FEATURE */}
        <div className="pt-4 border-t border-[var(--border-default)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-heading)] flex items-center gap-2">
                🏡 Về quê cuối tuần
              </h3>
              <p className="text-sm text-[var(--text-muted)]">Chia sẻ chi phí chặng đường dài</p>
            </div>
            <Link href="/rides/weekend" className="text-sm font-medium text-primary-500 hover:text-primary-600">
              Khám phá
            </Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {["Hải Phòng", "Thái Bình", "Nam Định", "Thanh Hóa"].map((province, i) => (
              <Card key={province} className="min-w-[160px] shrink-0 p-3 bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-100 dark:to-surface-200" hover>
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-3">
                  <IconMapPin size={20} />
                </div>
                <p className="font-semibold text-[var(--text-heading)] mb-1">Hà Nội <IconArrowRight size={12} className="inline" /> {province}</p>
                <p className="text-xs text-[var(--text-muted)]">12+ chuyến đi</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
