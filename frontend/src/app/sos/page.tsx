"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IconShieldCheck, IconPhone, IconX, IconCurrentLocation, IconAlertTriangleFilled } from "@tabler/icons-react";

export default function SOSPage() {
  const router = useRouter();
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "holding" | "activated" | "confirmed">("idle");
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = () => {
    if (status === "activated" || status === "confirmed") return;
    setIsHolding(true);
    setStatus("holding");
    
    let progress = 0;
    intervalRef.current = setInterval(() => {
      progress += 2; // 50 steps = 3000ms / 60ms
      setHoldProgress(Math.min(progress, 100));
    }, 60);

    holdTimerRef.current = setTimeout(() => {
      activateSOS();
    }, 3000);
  };

  const cancelHold = () => {
    if (status === "activated" || status === "confirmed") return;
    setIsHolding(false);
    setStatus("idle");
    setHoldProgress(0);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const activateSOS = () => {
    setIsHolding(false);
    setStatus("activated");
    setHoldProgress(100);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Simulate sending SOS
    setTimeout(() => {
      setStatus("confirmed");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden text-white selection:bg-red-500/30">
      {/* Background Gradient & Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/40 via-slate-950 to-slate-950" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Cancel Button */}
      <button 
        onClick={() => router.back()}
        className="absolute top-6 left-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-20"
      >
        <IconX size={24} />
      </button>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <IconAlertTriangleFilled size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Tín hiệu khẩn cấp</h1>
          <p className="text-white/60 text-sm max-w-[250px] mx-auto">
            {status === "idle" && "Sử dụng trong trường hợp bạn cảm thấy không an toàn."}
            {status === "holding" && "Giữ nút để kích hoạt SOS..."}
            {status === "activated" && "Đang gửi cảnh báo..."}
            {status === "confirmed" && "Cảnh báo đã được gửi!"}
          </p>
        </motion.div>

        {/* SOS Button Area */}
        <div className="relative mb-20 w-64 h-64 flex items-center justify-center">
          <AnimatePresence>
            {status === "holding" && (
              <motion.div
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-full bg-red-600/30"
              />
            )}
            {status === "confirmed" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 rounded-full border-[12px] border-green-500 flex items-center justify-center bg-green-500/20"
              >
                <IconShieldCheck size={80} className="text-green-400" />
              </motion.div>
            )}
          </AnimatePresence>

          {status !== "confirmed" && (
            <div className="relative w-full h-full">
              {/* Progress Ring */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="46" fill="none"
                  stroke="#ef4444"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(holdProgress / 100) * 289} 289`}
                  className="transition-all duration-75 ease-linear"
                />
              </svg>
              
              {/* Main Button */}
              <button
                onMouseDown={startHold}
                onMouseUp={cancelHold}
                onMouseLeave={cancelHold}
                onTouchStart={startHold}
                onTouchEnd={cancelHold}
                disabled={status === "activated"}
                className="absolute inset-4 rounded-full bg-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)] flex flex-col items-center justify-center active:scale-95 transition-transform duration-200"
              >
                <span className="text-5xl font-black tracking-widest text-white mt-2">SOS</span>
                <span className="text-xs text-red-200 mt-2 font-medium">Nhấn giữ 3 giây</span>
              </button>
            </div>
          )}
        </div>

        {/* Location Notice */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full flex items-center gap-4 mb-6"
        >
          <div className="relative w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
            <div className="absolute inset-0 rounded-full border border-blue-400 animate-ping opacity-50" />
            <IconCurrentLocation size={20} className="text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Vị trí đang được chia sẻ</h4>
            <p className="text-xs text-white/50 leading-relaxed">Thông tin chuyến đi và vị trí của bạn sẽ được gửi đến Danh bạ khẩn cấp.</p>
          </div>
        </motion.div>

        {/* Contacts list */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Liên hệ khẩn cấp</span>
          </div>
          {["Bố (090xxxx123)", "Mẹ (091xxxx456)"].map((contact, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 flex items-center justify-between border border-white/5">
              <span className="text-sm font-medium">{contact}</span>
              <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-colors">
                <IconPhone size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
