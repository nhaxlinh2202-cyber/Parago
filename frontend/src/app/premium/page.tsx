"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout, AppHeader } from "@/components/layout";
import { Button, Card, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  IconCrown,
  IconCheck,
  IconStarFilled,
  IconChevronDown,
} from "@tabler/icons-react";

export default function PremiumPage() {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "semester">("semester");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const benefits = [
    "Không hiển thị quảng cáo",
    "Ưu tiên ghép xe (Match nhanh x2)",
    "Bộ lọc giới tính (Chỉ đi cùng nữ/nam)",
    "Ghép theo Khoa/Ngành",
    "Tùy chọn tài xế có đánh giá > 4.8⭐",
    "Hỗ trợ khách hàng ưu tiên 24/7"
  ];

  const faqs = [
    { q: "Tôi có thể hủy gói Premium bất cứ lúc nào không?", a: "Có, bạn có thể hủy gia hạn tự động bất cứ lúc nào trong phần Cài đặt tài khoản. Quyền lợi Premium sẽ được giữ cho đến hết chu kỳ đã thanh toán." },
    { q: "Gói Học Kỳ kéo dài bao lâu?", a: "Gói Học Kỳ có thời hạn 5 tháng (tương đương 1 học kỳ chính), giúp bạn tiết kiệm 20% so với mua từng tháng." },
    { q: "Lọc giới tính hoạt động như thế nào?", a: "Bạn có thể chọn chỉ hiển thị các chuyến đi có tài xế/hành khách cùng giới tính với bạn, giúp tăng cường cảm giác an tâm và thoải mái." },
  ];

  return (
    <AppLayout>
      <AppHeader title="Premium" showBack />

      {/* HERO SECTION */}
      <div className="relative pt-8 pb-12 px-4 overflow-hidden gradient-dark text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/20 blur-3xl rounded-full" />
        
        <div className="max-w-2xl mx-auto relative z-10 text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gold-300 to-gold-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,193,7,0.3)] mb-6">
            <IconCrown size={36} className="text-white" />
          </div>
          <Badge variant="gold" className="mb-4">Parago Premium</Badge>
          <h1 className="text-3xl font-extrabold mb-3">Bạn Đồng Hành</h1>
          <p className="text-gold-100/80 text-sm max-w-md mx-auto">
            Mở khóa tất cả các đặc quyền. Tận hưởng trải nghiệm đi chung xe ưu tiên, an toàn và thoải mái nhất.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 -mt-6 relative z-20 space-y-8 pb-24">
        {/* PRICING CARDS */}
        <div className="grid grid-cols-2 gap-4">
          {/* Monthly Plan */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <Card
              className={cn(
                "h-full p-4 cursor-pointer transition-all border-2 relative",
                selectedPlan === "monthly" 
                  ? "border-gold-500 bg-surface-0 shadow-lg shadow-gold-500/10" 
                  : "border-transparent bg-surface-100"
              )}
              onClick={() => setSelectedPlan("monthly")}
            >
              {selectedPlan === "monthly" && (
                <div className="absolute top-3 right-3 text-gold-500">
                  <IconCircleCheckFilled size={20} />
                </div>
              )}
              <h3 className="font-bold text-[var(--text-heading)] mb-1">Hàng tháng</h3>
              <p className="text-2xl font-extrabold text-gold-600 mb-1">20k</p>
              <p className="text-xs text-[var(--text-muted)]">/tháng</p>
            </Card>
          </motion.div>

          {/* Semester Plan */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <Card
              className={cn(
                "h-full p-4 cursor-pointer transition-all border-2 relative",
                selectedPlan === "semester" 
                  ? "border-gold-500 bg-surface-0 shadow-lg shadow-gold-500/10" 
                  : "border-transparent bg-surface-100"
              )}
              onClick={() => setSelectedPlan("semester")}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                Tiết kiệm 20%
              </div>
              {selectedPlan === "semester" && (
                <div className="absolute top-3 right-3 text-gold-500">
                  <IconCircleCheckFilled size={20} />
                </div>
              )}
              <h3 className="font-bold text-[var(--text-heading)] mb-1">Gói Học Kỳ</h3>
              <p className="text-2xl font-extrabold text-gold-600 mb-1">80k</p>
              <p className="text-xs text-[var(--text-muted)]">/5 tháng</p>
            </Card>
          </motion.div>
        </div>

        {/* BENEFITS LIST */}
        <Card className="p-5 bg-surface-0 border-[var(--border-default)]">
          <h3 className="font-bold text-[var(--text-heading)] mb-4">Đặc quyền bao gồm:</h3>
          <ul className="space-y-3">
            {benefits.map((benefit, i) => (
              <motion.li 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-gold-50 flex items-center justify-center shrink-0 mt-0.5">
                  <IconCheck size={14} className="text-gold-600" />
                </div>
                <span className="text-sm text-[var(--text-secondary)]">{benefit}</span>
              </motion.li>
            ))}
          </ul>
        </Card>

        {/* TESTIMONIAL */}
        <div className="bg-surface-50 rounded-2xl p-5 border border-surface-200">
          <div className="flex items-center gap-1 mb-3">
            {[1,2,3,4,5].map(i => <IconStarFilled key={i} size={16} className="text-gold-500" />)}
          </div>
          <p className="text-sm text-[var(--text-secondary)] italic mb-4">
            "Mình mua gói Học Kỳ vì có tính năng lọc giới tính. Là con gái đi học về muộn, việc chọn đi chung với các bạn nữ cùng trường giúp mình an tâm hơn rất nhiều."
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">MA</div>
            <div className="text-xs">
              <span className="font-semibold text-[var(--text-heading)]">Mai Anh</span>
              <span className="text-[var(--text-muted)] block">ĐH Ngoại Thương</span>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h3 className="font-bold text-[var(--text-heading)] mb-4">Câu hỏi thường gặp</h3>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-surface-0 border border-[var(--border-default)] rounded-xl overflow-hidden">
                <button 
                  className="w-full p-4 text-left flex justify-between items-center"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-semibold text-[var(--text-heading)] pr-4">{faq.q}</span>
                  <IconChevronDown size={18} className={cn("text-[var(--text-muted)] transition-transform", openFaq === i && "rotate-180")} />
                </button>
                {openFaq === i && (
                  <div className="p-4 pt-0 text-sm text-[var(--text-secondary)] border-t border-[var(--border-light)] mt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface-0 border-t border-[var(--border-default)] z-40 pb-safe">
          <div className="max-w-2xl mx-auto">
            <Button variant="gold" fullWidth size="lg">
              Nâng cấp ngay • {selectedPlan === "semester" ? "80.000đ" : "20.000đ"}
            </Button>
            <p className="text-center text-[10px] text-[var(--text-muted)] mt-2">
              Bằng việc đăng ký, bạn đồng ý với Điều khoản dịch vụ & Chính sách của Parago.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Added missing icon component for use in this file
function IconCircleCheckFilled({ size, className }: { size?: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" />
    </svg>
  );
}
