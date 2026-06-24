"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppLayout, AppHeader } from "@/components/layout";
import { Card, Avatar, Badge, Input, StarRating, Skeleton, Button } from "@/components/ui";
import { apiClient } from "@/lib/api-client";
import { format } from "date-fns";
import { type Ride } from "@/lib/mock-data";
import { RideCard } from "@/components/ui/RideCard";
import { cn } from "@/lib/utils";
import {
  IconSearch,
  IconFilter,
  IconCalendar,
  IconClock,
  IconUsers,
  IconMapPin,
  IconArrowRight,
  IconCar,
  IconMotorbike,
  IconLeaf,
  IconGasStation,
  IconStar,
  IconChevronRight,
  IconAdjustments,
} from "@tabler/icons-react";

const filters = [
  { id: "all", label: "Tất cả" },
  { id: "university", label: "Cùng trường" },
  { id: "car", label: "Ô tô" },
  { id: "motorcycle", label: "Xe máy" },
  { id: "community", label: "Miễn phí" },
  { id: "gas-tip", label: "Gas & Tip" },
  { id: "recurring", label: "Lịch trình" },
];

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

export default function RidesPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [rides, setRides] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    const fetchRides = async () => {
      try {
        setIsLoading(true);
        let query = "?status=PENDING";
        if (activeFilter === "community") query += "&mode=COMMUNITY";
        if (activeFilter === "gas-tip") query += "&mode=GAS_TIP";
        
        const res = await apiClient.get(`/rides${query}`);
        
        let formattedRides = res.data.map((r: any) => {
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
            distance: r.distance,
            mode: r.mode === "GAS_TIP" ? "gas-tip" : "community",
          };
        });

        // Apply client-side filters for vehicleType if needed
        if (activeFilter === "car") formattedRides = formattedRides.filter((r: any) => r.vehicleType === "car");
        if (activeFilter === "motorcycle") formattedRides = formattedRides.filter((r: any) => r.vehicleType === "motorcycle");
        
        setRides(formattedRides);
      } catch (error) {
        console.error("Failed to fetch rides:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRides();
  }, [activeFilter]);

  const sortedRides = [...rides].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <AppLayout>
      <AppHeader title="Chuyến đi" showSearch showNotification />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Tìm điểm đón, điểm đến..."
            icon={<IconSearch size={18} />}
            rightIcon={
              <button className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center">
                <IconAdjustments size={16} />
              </button>
            }
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200",
                activeFilter === filter.id
                  ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                  : "bg-surface-100 text-text-secondary hover:bg-surface-200 dark:bg-surface-200 dark:hover:bg-surface-300"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">
            {rides.length} chuyến đi có sẵn
          </p>
          <div className="flex items-center gap-3">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="text-xs bg-surface-100 dark:bg-surface-200 border-none rounded-lg px-2 py-1.5 text-[var(--text-heading)] focus:ring-1 focus:ring-primary-500 font-medium cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
            <button className="text-xs text-primary-500 font-medium flex items-center gap-1">
              <IconFilter size={14} /> Bộ lọc
            </button>
          </div>
        </div>

        {/* Rides list */}
        <div className="space-y-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <RideCardSkeleton key={i} />)
            : sortedRides.length > 0 ? sortedRides.map((ride, i) => (
                <RideCard key={ride.id} ride={ride} index={i} />
              )) : (
                <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                  Không tìm thấy chuyến đi nào phù hợp
                </div>
              )}
        </div>
      </div>
    </AppLayout>
  );
}
