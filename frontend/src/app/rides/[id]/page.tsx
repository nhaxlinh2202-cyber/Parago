"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { motion } from "framer-motion";
import { AppLayout, AppHeader } from "@/components/layout";
import { Card, Avatar, StarRating, Badge, Button, Skeleton } from "@/components/ui";
import { apiClient } from "@/lib/api-client";
import { format } from "date-fns";
import { formatCurrency, cn } from "@/lib/utils";
import {
  IconMessage,
  IconClock,
  IconMapPin,
  IconCheck,
  IconSchool,
  IconBook,
  IconCircleCheckFilled,
  IconChevronRight,
  IconShieldCheck,
  IconTrash,
  IconX,
  IconAlertTriangle,
} from "@tabler/icons-react";

export default function RideDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const [ride, setRide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"cancel" | "delete" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messaging, setMessaging] = useState(false);

  const handleMessage = async () => {
    if (!ride || !ride.driverId) return;
    setMessaging(true);
    try {
      const res = await apiClient.post(`/conversations`, {
        targetUserId: ride.driverId,
        rideId: ride.id
      });
      router.push(`/messages/${res.data.id}`);
    } catch (error) {
      console.error("Failed to start conversation", error);
    } finally {
      setMessaging(false);
    }
  };

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await apiClient.get(`/rides/${id}`);
        const r = res.data;
        const dateObj = new Date(r.departureAt);
        setRide({
          ...r,
          pickupShort: r.pickupLocation.split(",")[0],
          pickup: r.pickupLocation,
          destinationShort: r.destinationLocation.split(",")[0],
          destination: r.destinationLocation,
          departureTime: format(dateObj, "HH:mm"),
          date: format(dateObj, "dd/MM"),
          seats: r.totalSeats,
          distance: r.distance ? `${(r.distance / 1000).toFixed(1)} km` : "--",
          mode: r.mode === "GAS_TIP" ? "gas-tip" : "community",
          notes: r.notes,
          status: r.status,
          passengers: r.passengers || [],
          passengersCount: r.passengers?.filter((p: any) => p.status === 'ACCEPTED').length || 0,
          matchScore: 95, // Stub match score
        });
      } catch (error) {
        console.error("Failed to fetch ride", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchRide();
  }, [id]);

  const [score, setScore] = useState(0);
  const targetScore = ride?.matchScore || 95;

  useEffect(() => {
    // Animate circular progress
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        setScore(current);
        if (current >= targetScore) clearInterval(interval);
      }, 15);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(timer);
    return () => clearTimeout(timer);
  }, [targetScore, isLoading]);

  const handleAction = async () => {
    if (!modalType || !id) return;
    setIsProcessing(true);
    try {
      if (modalType === "cancel") {
        await apiClient.patch(`/rides/${id}/cancel`);
        alert("Huỷ chuyến thành công");
      } else if (modalType === "delete") {
        await apiClient.delete(`/rides/${id}`);
        alert("Xoá chuyến thành công");
      }
      router.push("/home");
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
      setShowModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const isOwner = currentUser?.id === ride?.driverId;
  const isAdmin = currentUser?.systemRole === "ADMIN";
  const canManage = isOwner || isAdmin;

  const myRequest = ride?.passengers?.find((p: any) => p.passengerId === currentUser?.id);

  const handleRequestJoin = async () => {
    setIsProcessing(true);
    try {
      await apiClient.post(`/rides/${id}/request-join`);
      alert("Đã gửi yêu cầu thành công!");
      // reload
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi gửi yêu cầu");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!confirm("Bạn muốn huỷ yêu cầu ghép xe này?")) return;
    setIsProcessing(true);
    try {
      await apiClient.delete(`/rides/${id}/request-join`);
      alert("Đã huỷ yêu cầu");
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi huỷ yêu cầu");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessPassenger = async (passengerId: string, action: 'ACCEPT' | 'REJECT') => {
    if (action === 'REJECT' && !confirm("Bạn có chắc chắn muốn từ chối hành khách này? Hành động này không thể hoàn tác.")) {
      return;
    }
    setIsProcessing(true);
    try {
      await apiClient.patch(`/rides/${id}/passengers/${passengerId}`, { action });
      alert("Đã xử lý yêu cầu!");
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi xử lý yêu cầu");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !ride) {
    return (
      <AppLayout>
        <AppHeader title="Chi tiết chuyến đi" showBack />
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <Skeleton className="w-full h-48 rounded-2xl" />
          <Skeleton className="w-full h-64 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout hideBottomNav>
      <AppHeader title={ride.destinationShort} showBack />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* TOP ROUTE CARD */}
        <Card variant="elevated" className="overflow-hidden">
          <div className="bg-primary-500 p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full uppercase tracking-wider">
                {ride.date} • {ride.departureTime}
              </span>
              <span className="text-sm font-bold">
                {ride.mode === "community" ? "Miễn phí" : formatCurrency(ride.price)}
              </span>
            </div>
            
            <div className="flex gap-4 mt-4">
              <div className="flex flex-col items-center mt-1">
                <div className="w-3 h-3 rounded-full bg-white border-2 border-primary-500 shadow-sm" />
                <div className="w-0.5 h-10 bg-white/40 my-1" />
                <div className="w-3 h-3 rounded-full bg-gold-400 border-2 border-white shadow-sm" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="font-bold text-lg leading-tight">{ride.pickupShort}</p>
                  <p className="text-sm text-white/80 line-clamp-1">{ride.pickup}</p>
                </div>
                <div>
                  <p className="font-bold text-lg leading-tight">{ride.destinationShort}</p>
                  <p className="text-sm text-white/80 line-clamp-1">{ride.destination}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={ride.driver.name} size="lg" verified={ride.driver.verified} premium={ride.driver.isPremium} />
              <div>
                <p className="font-bold text-[var(--text-heading)]">{ride.driver.name}</p>
                <div className="flex items-center gap-1">
                  <StarRating rating={ride.driver.rating} size="sm" />
                  <span className="text-xs text-[var(--text-muted)]">({ride.driver.totalRides} chuyến)</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="mb-1">{ride.vehicleName}</Badge>
              <p className="text-xs text-[var(--text-muted)]">{ride.seatsAvailable} chỗ trống</p>
            </div>
          </div>
        </Card>

        {/* NOTES SECTION */}
        {ride.notes && (
          <div className="bg-surface-50 rounded-2xl p-4 space-y-3 text-left border border-surface-200">
            <h4 className="font-semibold text-[var(--text-heading)] text-sm mb-1">Ghi chú từ tài xế</h4>
            <p className="text-sm text-surface-600 italic">"{ride.notes}"</p>
          </div>
        )}

        {/* MATCH SCORE SECTION */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-[var(--text-heading)] mb-6">Mức độ phù hợp</h3>
          <div className="relative w-40 h-40 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-surface-200)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="45" fill="none"
                stroke={score >= 80 ? "#4CAF50" : score >= 60 ? "#FFC107" : "#F44336"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 283} 283`}
                initial={{ strokeDasharray: "0 283" }}
                animate={{ strokeDasharray: `${(score / 100) * 283} 283` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-[var(--text-heading)]">{score}%</span>
              <span className="text-xs text-green-500 font-semibold uppercase mt-1 tracking-wider">Tuyệt vời</span>
            </div>
          </div>

          <div className="bg-surface-50 rounded-2xl p-4 space-y-3 text-left border border-surface-200">
            <div className="flex items-center gap-3">
              <IconCircleCheckFilled className="text-green-500" size={20} />
              <span className="text-sm flex-1">Cùng trường đại học</span>
              <Badge variant="success" size="sm">+20%</Badge>
            </div>
            <div className="flex items-center gap-3">
              <IconCircleCheckFilled className="text-green-500" size={20} />
              <span className="text-sm flex-1">Cùng khoa viện</span>
              <Badge variant="success" size="sm">+15%</Badge>
            </div>
            <div className="flex items-center gap-3">
              <IconCircleCheckFilled className="text-green-500" size={20} />
              <span className="text-sm flex-1">Gần điểm xuất phát (1.2km)</span>
              <Badge variant="success" size="sm">+25%</Badge>
            </div>
            <div className="flex items-center gap-3">
              <IconCircleCheckFilled className="text-green-500" size={20} />
              <span className="text-sm flex-1">Tài xế đánh giá cao</span>
              <Badge variant="success" size="sm">+15%</Badge>
            </div>
          </div>
        </div>

        {/* PASSENGER MANAGEMENT (For Driver) */}
        {canManage && ride.passengers?.length > 0 && (
          <div className="bg-surface-50 rounded-2xl p-4 space-y-4 border border-surface-200">
            <h3 className="text-lg font-bold text-[var(--text-heading)]">Hành khách ghép xe</h3>
            <div className="space-y-3">
              {ride.passengers.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)]">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.passenger.name} size="md" />
                    <div>
                      <p className="font-semibold text-sm">{p.passenger.name}</p>
                      <span className={cn(
                        "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                        p.status === 'PENDING' ? "bg-yellow-100 text-yellow-700" :
                        p.status === 'ACCEPTED' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                  {p.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleProcessPassenger(p.id, 'REJECT')} disabled={isProcessing}>
                        <IconX size={16} />
                      </Button>
                      {ride.seatsAvailable > 0 ? (
                        <Button size="sm" variant="primary" className="h-8 px-2" onClick={() => handleProcessPassenger(p.id, 'ACCEPT')} disabled={isProcessing}>
                          <IconCheck size={16} />
                        </Button>
                      ) : (
                        <span className="text-[10px] text-red-500 font-bold self-center px-1">Đầy chỗ</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRUST & SAFETY */}
        <Card className="bg-primary-50 dark:bg-primary-900 border-primary-100 dark:border-primary-800 p-4 flex gap-3">
          <IconShieldCheck className="text-primary-500 shrink-0 mt-0.5" size={24} />
          <div>
            <h4 className="font-semibold text-primary-700 dark:text-primary-300 text-sm mb-1">Chuyến đi an toàn</h4>
            <p className="text-xs text-primary-600 dark:text-primary-400">Tài xế đã được xác thực sinh viên và có hồ sơ lái xe uy tín trên Parago.</p>
          </div>
        </Card>

        {/* BOTTOM ACTION BAR */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface-0 border-t border-[var(--border-default)] z-30 pb-safe">
          <div className="max-w-2xl mx-auto flex gap-3">
            {canManage ? (
              <>
                <Button variant="outline" className="flex-1 text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" 
                  onClick={() => { setModalType("cancel"); setShowModal(true); }}
                  disabled={ride.status === 'CANCELLED'}
                >
                  {ride.status === 'CANCELLED' ? "Đã huỷ" : "Huỷ chuyến"}
                </Button>
                <Button variant="primary" className="flex-[2] bg-red-600 hover:bg-red-700 text-white" 
                  onClick={() => { setModalType("delete"); setShowModal(true); }}
                >
                  Xoá chuyến
                </Button>
              </>
            ) : (
              <>
                {myRequest?.status === 'ACCEPTED' ? (
                  <Button variant="primary" className="flex-1 w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleMessage} loading={messaging} disabled={ride.status === 'CANCELLED'}>
                    Nhắn tin với tài xế
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="secondary" 
                      className="flex-1" 
                      icon={<IconMessage size={18} />}
                      onClick={handleMessage}
                      disabled={messaging || ride.status === 'CANCELLED'}
                    >
                      {messaging ? "Đang mở..." : "Nhắn tin"}
                    </Button>
                    {myRequest ? (
                      <Button 
                        variant={myRequest.status === 'REJECTED' ? 'secondary' : myRequest.status === 'ACCEPTED' ? 'primary' : 'outline'} 
                        className={cn("flex-[2]", myRequest.status === 'PENDING' && "border-yellow-500 text-yellow-600")}
                        disabled={myRequest.status === 'REJECTED' || myRequest.status === 'ACCEPTED' || isProcessing || ride.status === 'CANCELLED'}
                        onClick={myRequest.status === 'PENDING' ? handleCancelRequest : undefined}
                      >
                        {myRequest.status === 'PENDING' ? "Chờ đồng ý ghép (Huỷ)" : myRequest.status === 'ACCEPTED' ? "Đã được ghép" : "Bị từ chối"}
                      </Button>
                    ) : (
                      <Button variant="primary" className="flex-[2]" onClick={handleRequestJoin} loading={isProcessing} disabled={ride.status === 'CANCELLED' || ride.seatsAvailable <= 0}>
                        {ride.status === 'CANCELLED' ? "Chuyến đi đã huỷ" : ride.seatsAvailable <= 0 ? "Đã hết chỗ" : "Ghép xe ngay"}
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* CUSTOM CONFIRM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isProcessing && setShowModal(false)}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-surface-0 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-surface-200"
          >
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <IconAlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-center text-[var(--text-heading)] mb-2">
              {modalType === "cancel" ? "Xác nhận huỷ chuyến?" : "Xác nhận xoá chuyến?"}
            </h3>
            <p className="text-center text-sm text-[var(--text-muted)] mb-6">
              {modalType === "cancel" 
                ? (ride.passengersCount > 0 
                  ? `CẢNH BÁO: Chuyến đi này đã có ${ride.passengersCount} hành khách ghép. Họ sẽ nhận được thông báo huỷ chuyến.`
                  : "Bạn có chắc chắn muốn huỷ chuyến đi này không? Hành động này không thể hoàn tác.")
                : (isAdmin && ride.passengersCount > 0 
                  ? `CẢNH BÁO ADMIN: Chuyến đi đã có ${ride.passengersCount} khách ghép. Việc xoá sẽ làm mất dữ liệu ghép chuyến của họ!`
                  : "Chuyến đi sẽ bị xoá vĩnh viễn khỏi hệ thống. Hành động này không thể hoàn tác.")}
            </p>
            
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)} disabled={isProcessing}>
                Đóng
              </Button>
              <Button variant="primary" className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleAction} loading={isProcessing}>
                Đồng ý {modalType === "cancel" ? "huỷ" : "xoá"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AppLayout>
  );
}
