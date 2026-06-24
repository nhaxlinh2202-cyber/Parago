"use client";

import React, { useState, useEffect } from "react";
import { AppLayout, AppHeader } from "@/components/layout";
import { RideCard } from "@/components/ui/RideCard";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { motion } from "framer-motion";
import { IconCar, IconUser, IconAlertCircle } from "@tabler/icons-react";

export default function MyRidesPage() {
  const [activeTab, setActiveTab] = useState<"driver" | "passenger">("driver");
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) return;
    
    const fetchMyRides = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/rides/my?role=${activeTab}`);
        // For driver, parse some fields properly if needed
        const data = res.data.map((r: any) => ({
          ...r,
          pickupShort: r.pickupLocation?.split(",")[0],
          destinationShort: r.destinationLocation?.split(",")[0],
          date: r.departureAt ? new Date(r.departureAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '',
          departureTime: r.departureAt ? new Date(r.departureAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
        }));
        setRides(data);
      } catch (err) {
        console.error("Lỗi khi tải chuyến đi", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRides();
  }, [activeTab, user]);

  return (
    <AppLayout>
      <AppHeader title="Chuyến đi của tôi" showBack={false} />

      <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
        {/* TABS */}
        <div className="flex bg-surface-100 dark:bg-surface-200 p-1 rounded-2xl mb-6">
          <button
            className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              activeTab === "driver" 
                ? "bg-white dark:bg-surface-0 shadow-sm text-[var(--text-heading)]" 
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
            onClick={() => setActiveTab("driver")}
          >
            <IconCar size={18} />
            Tôi lái
          </button>
          <button
            className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              activeTab === "passenger" 
                ? "bg-white dark:bg-surface-0 shadow-sm text-[var(--text-heading)]" 
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
            onClick={() => setActiveTab("passenger")}
          >
            <IconUser size={18} />
            Tôi đi
          </button>
        </div>

        {/* LIST */}
        {loading ? (
          <div className="text-center py-10 text-[var(--text-muted)]">Đang tải dữ liệu...</div>
        ) : rides.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center text-surface-400 mb-4">
              <IconAlertCircle size={32} />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-heading)] mb-2">Chưa có chuyến đi nào</h3>
            <p className="text-sm text-[var(--text-muted)] max-w-sm">
              {activeTab === "driver" 
                ? "Bạn chưa tạo chuyến đi nào với vai trò tài xế." 
                : "Bạn chưa gửi yêu cầu ghép chuyến nào."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride, idx) => (
              <RideCard 
                key={ride.id} 
                ride={ride} 
                index={idx} 
                isMyRequest={activeTab === "passenger"} 
                showAction={true}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
