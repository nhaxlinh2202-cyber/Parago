import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, Avatar, Badge, StarRating, Button } from "@/components/ui";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";
import {
  IconClock,
  IconCalendar,
  IconUsers,
  IconCar,
  IconMotorbike,
  IconLeaf,
  IconGasStation,
  IconChevronRight,
} from "@tabler/icons-react";

export const statusColors: Record<string, {bg: string, text: string, label: string}> = {
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

export function RideCard({ ride, index, isMyRequest, showAction = true }: { ride: any; index: number; isMyRequest?: boolean; showAction?: boolean }) {
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
              <Avatar name={ride.driver?.name || "Driver"} size="md" verified={ride.driver?.verified} premium={ride.driver?.isPremium} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-[var(--text-heading)]">{ride.driver?.name || "Driver"}</span>
                  {ride.createdAt && (
                    <span className="text-[11px] text-[var(--text-muted)] font-normal ml-1">
                      • {formatRelativeTime(ride.createdAt)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <StarRating rating={ride.driver?.rating || 5} size="sm" />
                  <span className="text-xs text-[var(--text-muted)]">{ride.driver?.rating || "5.0"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {ride.matchScore && (
                <Badge variant="primary" size="sm">
                  {ride.matchScore}% phù hợp
                </Badge>
              )}
            </div>
          </div>

          {/* Route */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex flex-col items-center mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
              <div className="w-0.5 h-8 bg-surface-200 dark:bg-surface-300 my-0.5" />
              <div className="w-2.5 h-2.5 rounded-full bg-gold-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-heading)] truncate">{ride.pickupShort || ride.pickupLocation}</p>
              <p className="text-[11px] text-[var(--text-muted)] truncate mb-2">{ride.pickupLocation}</p>
              <p className="text-sm font-medium text-[var(--text-heading)] truncate">{ride.destinationShort || ride.destinationLocation}</p>
              <p className="text-[11px] text-[var(--text-muted)] truncate">{ride.destinationLocation}</p>
            </div>
          </div>

          {/* Info row */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              <IconClock size={14} />
              {ride.departureTime || ride.departureAt?.substring(11, 16)}
            </div>
            <span className="text-surface-300">•</span>
            <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              <IconCalendar size={14} />
              {ride.date || ride.departureAt?.substring(5, 10)}
            </div>
            <span className="text-surface-300">•</span>
            <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              <IconUsers size={14} />
              {ride.seatsAvailable}/{ride.seats || ride.totalSeats} chỗ
            </div>
            <span className="text-surface-300">•</span>
            <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              {ride.vehicleType === "car" ? <IconCar size={14} /> : <IconMotorbike size={14} />}
              {typeof ride.distance === 'number' && !isNaN(ride.distance) ? `${(ride.distance/1000).toFixed(1)} km` : (ride.distance || "N/A")}
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
              
              {isMyRequest && ride.myRequestStatus ? (
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", 
                  ride.myRequestStatus === 'PENDING' ? "bg-yellow-100 text-yellow-700" :
                  ride.myRequestStatus === 'ACCEPTED' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {ride.myRequestStatus === 'PENDING' ? 'Đang chờ' : ride.myRequestStatus === 'ACCEPTED' ? 'Đã duyệt' : 'Từ chối'}
                </span>
              ) : (
                <span className={cn("text-xs px-2 py-0.5 rounded-full", status.bg, status.text)}>
                  {status.label}
                </span>
              )}
            </div>
            {showAction && (
              <Button size="sm" variant="primary">
                Chi tiết <IconChevronRight size={14} />
              </Button>
            )}
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
