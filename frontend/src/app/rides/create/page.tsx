"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout, AppHeader } from "@/components/layout";
import { Card, Input, Button, Badge, LocationPicker, LocationData } from "@/components/ui";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  IconMapPin,
  IconUsers,
  IconCar,
  IconCalendarEvent,
  IconClock,
  IconLeaf,
  IconGasStation,
  IconNotes,
  IconCheck,
  IconCurrentLocation,
} from "@tabler/icons-react";

export default function CreateRidePage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const [formData, setFormData] = useState({
    pickup: null as LocationData | null,
    destination: null as LocationData | null,
    date: "",
    time: "",
    seats: 2,
    mode: "community", // community | gas-tip
    price: "",
    vehicle: "motorcycle",
    gender: "any",
    recurring: false,
    notes: "",
  });

  const updateForm = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const [routeInfo, setRouteInfo] = useState<{distanceText: string, durationText: string, polyline: string} | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  const router = useRouter();

  const nextStep = async () => {
    if (step === 1) {
      if (!formData.pickup || !formData.destination) {
        alert("Vui lòng chọn điểm đón và điểm đến!");
        return;
      }
      
      // Fetch route estimation when advancing to step 2
      try {
        setIsEstimating(true);
        const res = await apiClient.post("/maps/estimate-route", {
          originLat: formData.pickup.lat,
          originLng: formData.pickup.lng,
          destLat: formData.destination.lat,
          destLng: formData.destination.lng
        });
        setRouteInfo(res.data);
      } catch (error) {
        console.error("Lỗi khi tính toán tuyến đường:", error);
      } finally {
        setIsEstimating(false);
      }
    }

    if (step === 3) {
      // SUBMIT TO BACKEND
      try {
        setIsEstimating(true);
        const payload = {
          pickupLocation: formData.pickup?.address || "",
          pickupLat: formData.pickup?.lat,
          pickupLng: formData.pickup?.lng,
          destinationLocation: formData.destination?.address || "",
          destLat: formData.destination?.lat,
          destLng: formData.destination?.lng,
          distance: routeInfo?.distanceText ? parseFloat(routeInfo.distanceText.replace(',', '.')) * 1000 : 0, // quick hack to send meters
          duration: routeInfo?.durationText ? parseInt(routeInfo.durationText) * 60 : 0, // quick hack to send seconds
          departureAt: `${formData.date}T${formData.time}:00.000Z`,
          seatsAvailable: formData.seats,
          price: Number(formData.price) || 0,
          vehicleType: formData.vehicle,
          genderPreference: formData.gender,
          mode: formData.mode === "gas-tip" ? "GAS_TIP" : "COMMUNITY",
          notes: formData.notes || undefined,
        };

        const res = await apiClient.post("/rides", payload);
        if (res.status === 201 || res.status === 200) {
          alert("Đăng chuyến đi thành công!");
          router.push("/home");
        }
      } catch (error: any) {
        console.error("Lỗi khi đăng chuyến đi:", error);
        alert(error.response?.data?.message || "Có lỗi xảy ra khi đăng chuyến đi. Vui lòng thử lại.");
      } finally {
        setIsEstimating(false);
      }
      return;
    }

    if (step < 3) {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
    }),
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2 px-2">
        <span className={cn("text-xs font-semibold", step >= 1 ? "text-primary-500" : "text-surface-400")}>Lộ trình</span>
        <span className={cn("text-xs font-semibold", step >= 2 ? "text-primary-500" : "text-surface-400")}>Chi tiết</span>
        <span className={cn("text-xs font-semibold", step >= 3 ? "text-primary-500" : "text-surface-400")}>Xác nhận</span>
      </div>
      <div className="relative h-2 bg-surface-200 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-primary-500 rounded-full"
          initial={{ width: "33%" }}
          animate={{ width: `${(step / 3) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );

  return (
    <AppLayout hideBottomNav>
      <AppHeader title="Đăng chuyến đi" showBack onBack={prevStep} />

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 overflow-hidden relative min-h-[80vh] flex flex-col">
        {renderStepIndicator()}

        <div className="relative flex-1">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-heading)] mb-2">Bạn đi từ đâu đến đâu?</h2>
                  <p className="text-[var(--text-muted)] text-sm mb-6">Nhập điểm xuất phát và điểm đến của bạn.</p>
                </div>

                <div className="space-y-4 relative">
                  <div className="absolute left-[19px] top-10 bottom-10 w-0.5 bg-surface-200 dark:bg-surface-300 z-0" />
                  <div className="z-20 relative">
                    <LocationPicker
                      label="Điểm đón"
                      placeholder="VD: KTX Bách Khoa"
                      value={formData.pickup || undefined}
                      onChange={(val) => updateForm("pickup", val)}
                      isPickup={true}
                    />
                  </div>
                  <div className="z-10 relative mt-4">
                    <LocationPicker
                      label="Điểm đến"
                      placeholder="VD: ĐH Kinh tế Quốc dân"
                      value={formData.destination || undefined}
                      onChange={(val) => updateForm("destination", val)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label="Ngày đi"
                    icon={<IconCalendarEvent size={18} />}
                    value={formData.date}
                    onChange={(e) => updateForm("date", e.target.value)}
                  />
                  <Input
                    type="time"
                    label="Giờ xuất phát"
                    icon={<IconClock size={18} />}
                    value={formData.time}
                    onChange={(e) => updateForm("time", e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-heading)] mb-2">Chi tiết chuyến đi</h2>
                  <p className="text-[var(--text-muted)] text-sm mb-6">Tùy chỉnh các lựa chọn cho chuyến đi của bạn.</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-[var(--text-heading)] block mb-3">Hình thức chia sẻ</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      onClick={() => updateForm("mode", "community")}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all",
                        formData.mode === "community" ? "border-green-500 bg-green-50 dark:bg-green-500/10" : "border-surface-200 bg-surface-0"
                      )}
                    >
                      <IconLeaf className={formData.mode === "community" ? "text-green-500" : "text-surface-400"} size={24} />
                      <div className="mt-3 font-semibold text-sm">Đi chung miễn phí</div>
                      <div className="text-xs text-surface-500 mt-1">Giao lưu cộng đồng, tích lũy Eco Points.</div>
                    </div>
                    <div
                      onClick={() => updateForm("mode", "gas-tip")}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all",
                        formData.mode === "gas-tip" ? "border-gold-500 bg-gold-50 dark:bg-gold-500/10" : "border-surface-200 bg-surface-0"
                      )}
                    >
                      <IconGasStation className={formData.mode === "gas-tip" ? "text-gold-500" : "text-surface-400"} size={24} />
                      <div className="mt-3 font-semibold text-sm">Gas & Tip</div>
                      <div className="text-xs text-surface-500 mt-1">Chia sẻ một phần chi phí xăng xe.</div>
                    </div>
                  </div>
                </div>

                {formData.mode === "gas-tip" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <Input
                      label="Mức đóng góp dự kiến (VNĐ / người)"
                      type="number"
                      placeholder="VD: 15000"
                      value={formData.price}
                      onChange={(e) => updateForm("price", e.target.value)}
                    />
                  </motion.div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--text-heading)] block mb-2">Số chỗ trống</label>
                    <div className="flex bg-surface-100 rounded-xl p-1 h-11 items-center justify-between">
                      <button onClick={() => updateForm("seats", Math.max(1, formData.seats - 1))} className="w-10 h-10 rounded-lg bg-surface-0 shadow-sm font-bold text-lg">-</button>
                      <span className="font-semibold text-lg">{formData.seats}</span>
                      <button onClick={() => updateForm("seats", Math.min(4, formData.seats + 1))} className="w-10 h-10 rounded-lg bg-surface-0 shadow-sm font-bold text-lg">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--text-heading)] block mb-2">Phương tiện</label>
                    <select
                      className="w-full h-11 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-4 text-sm focus:ring-2 focus:ring-primary-500"
                      value={formData.vehicle}
                      onChange={(e) => updateForm("vehicle", e.target.value)}
                    >
                      <option value="motorcycle">Xe máy</option>
                      <option value="car">Ô tô</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-[var(--text-heading)] block mb-2">Ghi chú thêm (Tùy chọn)</label>
                  <textarea
                    rows={3}
                    placeholder="VD: Mình hay nghe nhạc chill lúc lái xe..."
                    className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-3 text-sm focus:ring-2 focus:ring-primary-500 resize-none"
                    value={formData.notes}
                    onChange={(e) => updateForm("notes", e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                className="space-y-6"
              >
                <div className="text-center pt-4">
                  <div className="w-16 h-16 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconCheck size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--text-heading)] mb-2">Kiểm tra thông tin</h2>
                  <p className="text-[var(--text-muted)] text-sm mb-6">Chuyến đi của bạn đã sẵn sàng để đăng tải.</p>
                </div>

                <Card variant="elevated" className="bg-surface-50 border-primary-100 p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                      <div className="w-0.5 h-8 bg-surface-300 my-0.5" />
                      <div className="w-2.5 h-2.5 rounded-full bg-gold-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--text-heading)]">{formData.pickup?.address || "Điểm đón chưa nhập"}</p>
                      <p className="text-xs text-[var(--text-muted)] mb-3">Đón lúc {formData.time || "--:--"}, {formData.date || "--/--"}</p>
                      <p className="text-sm font-medium text-[var(--text-heading)]">{formData.destination?.address || "Điểm đến chưa nhập"}</p>
                    </div>
                  </div>

                  {routeInfo && (
                    <div className="bg-primary-50 dark:bg-primary-500/10 p-3 rounded-lg flex justify-between items-center text-sm border border-primary-100 dark:border-primary-500/20">
                      <div>
                        <span className="text-primary-600 dark:text-primary-400 font-medium block">Khoảng cách</span>
                        <span className="text-primary-800 dark:text-primary-300">{routeInfo.distanceText}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-primary-600 dark:text-primary-400 font-medium block">Thời gian dự kiến</span>
                        <span className="text-primary-800 dark:text-primary-300">{routeInfo.durationText}</span>
                      </div>
                    </div>
                  )}

                  <div className="h-px bg-surface-200 w-full" />

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-surface-500">Chỗ trống</span>
                    <span className="font-semibold">{formData.seats} chỗ ({formData.vehicle === "car" ? "Ô tô" : "Xe máy"})</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-surface-500">Hình thức</span>
                    <Badge variant={formData.mode === "community" ? "success" : "gold"}>
                      {formData.mode === "community" ? "Miễn phí" : `${formData.price || 0}đ / người`}
                    </Badge>
                  </div>
                  {formData.notes && (
                    <div className="bg-surface-0 p-3 rounded-lg text-xs italic text-surface-600 border border-surface-200">
                      "{formData.notes}"
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface-0 border-t border-[var(--border-default)] z-40 pb-safe">
          <div className="max-w-2xl mx-auto flex gap-3">
            {step > 1 && (
              <Button variant="secondary" onClick={prevStep} className="flex-1">
                Quay lại
              </Button>
            )}
            <Button variant="primary" onClick={nextStep} loading={isEstimating} className="flex-[2]">
              {step === 3 ? "Đăng chuyến đi" : "Tiếp tục"}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
