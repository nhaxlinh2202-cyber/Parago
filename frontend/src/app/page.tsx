"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button, Card, Avatar, StarRating, Badge } from "@/components/ui";
import { ParagoLogo } from "@/components/ui/logo";
import {
  IconCar,
  IconShieldCheck,
  IconLeaf,
  IconMapPin,
  IconUsers,
  IconMessageCircle,
  IconArrowRight,
  IconChevronRight,
  IconDeviceMobile,
  IconHeart,
  IconSearch,
} from "@tabler/icons-react";
import { ThemeProvider, useTheme } from "@/components/providers/theme-provider";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-hidden">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <ParagoLogo size={32} color="#D32F2F" showText />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#features" className="text-[var(--text-secondary)] hover:text-primary-500 transition-colors">Tính năng</Link>
            <Link href="#how-it-works" className="text-[var(--text-secondary)] hover:text-primary-500 transition-colors">Cách hoạt động</Link>
            <Link href="#premium" className="text-[var(--text-secondary)] hover:text-primary-500 transition-colors">Premium</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:block text-sm font-medium text-[var(--text-heading)] hover:text-primary-500 transition-colors">
              Đăng nhập
            </Link>
            <Link href="/home">
              <Button size="sm" variant="primary">Bắt đầu ngay</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden gradient-mesh">
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="text-center lg:text-left"
              >
                <motion.div variants={fadeIn} className="mb-4 inline-flex">
                  <Badge variant="primary" className="px-3 py-1 text-sm rounded-full">
                    🎉 Nền tảng đi chung xe #1 cho sinh viên
                  </Badge>
                </motion.div>
                <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-extrabold tracking-tight text-[var(--text-heading)] mb-6 leading-tight">
                  Kết nối sinh viên <br />
                  <span className="text-gradient-primary">Đi chung an toàn</span>
                </motion.h1>
                <motion.p variants={fadeIn} className="text-lg text-[var(--text-muted)] mb-8 max-w-xl mx-auto lg:mx-0">
                  Tiết kiệm chi phí, giảm ùn tắc, bảo vệ môi trường và kết nối những người bạn mới trên mọi chuyến đi đến trường.
                </motion.p>
                <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link href="/home">
                    <Button size="lg" variant="primary" icon={<IconArrowRight size={20} />} className="w-full sm:w-auto">
                      Tìm chuyến đi ngay
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-surface-0">
                    Trở thành tài xế
                  </Button>
                </motion.div>

                {/* Stats */}
                <motion.div variants={fadeIn} className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-[var(--border-default)]">
                  <div>
                    <h3 className="text-3xl font-bold text-[var(--text-heading)]">12k+</h3>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Sinh viên</p>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-[var(--text-heading)]">28k+</h3>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Chuyến đi</p>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-[var(--text-heading)]">50+</h3>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Trường ĐH</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Hero Illustration (CSS shapes + Framer Motion) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:block relative h-[500px]"
              >
                <div className="absolute inset-0 bg-primary-500/5 rounded-full blur-3xl animate-pulse-soft" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-[500px] bg-surface-0 rounded-[40px] shadow-xl border-8 border-surface-100 overflow-hidden">
                  <div className="h-full w-full bg-surface-50 p-4 flex flex-col">
                    <div className="h-40 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl mb-4 relative overflow-hidden">
                       <div className="absolute inset-0 bg-black/10" />
                       <div className="absolute bottom-4 left-4 text-white">
                         <div className="text-xs opacity-80 mb-1">Điểm đón</div>
                         <div className="font-semibold text-lg flex items-center gap-1"><IconMapPin size={18}/> KTX Bách Khoa</div>
                       </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-16 bg-surface-0 rounded-xl shadow-sm border border-surface-100 p-3 flex gap-3 animate-float" style={{animationDelay: '0ms'}}>
                        <div className="w-10 h-10 rounded-full bg-primary-100" />
                        <div className="flex-1 space-y-2 py-1"><div className="h-3 w-2/3 bg-surface-200 rounded" /><div className="h-2 w-1/3 bg-surface-200 rounded" /></div>
                      </div>
                      <div className="h-16 bg-surface-0 rounded-xl shadow-sm border border-surface-100 p-3 flex gap-3 animate-float" style={{animationDelay: '500ms'}}>
                        <div className="w-10 h-10 rounded-full bg-gold-100" />
                        <div className="flex-1 space-y-2 py-1"><div className="h-3 w-3/4 bg-surface-200 rounded" /><div className="h-2 w-1/2 bg-surface-200 rounded" /></div>
                      </div>
                      <div className="h-16 bg-surface-0 rounded-xl shadow-sm border border-surface-100 p-3 flex gap-3 animate-float" style={{animationDelay: '1000ms'}}>
                        <div className="w-10 h-10 rounded-full bg-green-100" />
                        <div className="flex-1 space-y-2 py-1"><div className="h-3 w-1/2 bg-surface-200 rounded" /><div className="h-2 w-1/4 bg-surface-200 rounded" /></div>
                      </div>
                    </div>
                    <div className="mt-auto h-12 bg-primary-500 rounded-xl flex items-center justify-center text-white font-medium text-sm">
                      Ghép xe ngay
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 bg-surface-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[var(--text-heading)] mb-4">3 bước đơn giản</h2>
              <p className="text-[var(--text-muted)] max-w-2xl mx-auto">Sẵn sàng trải nghiệm chuyến đi an toàn và tiện lợi cùng bạn bè cùng trường.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <IconDeviceMobile size={32} />, title: "Đăng ký & Xác thực", desc: "Tạo tài khoản và xác minh thẻ sinh viên để đảm bảo an toàn cộng đồng." },
                { icon: <IconSearch size={32} />, title: "Tìm chuyến phù hợp", desc: "Nhập điểm đón, điểm đến và thời gian. Parago sẽ gợi ý chuyến đi tốt nhất." },
                { icon: <IconCar size={32} />, title: "Đi chung vui vẻ", desc: "Gặp gỡ, đi chung và chia sẻ chi phí một cách dễ dàng và minh bạch." },
              ].map((step, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  key={i}
                  className="relative text-center p-6 bg-surface-0 rounded-3xl shadow-sm border border-[var(--border-default)] card-hover"
                >
                  <div className="w-16 h-16 mx-auto bg-primary-50 text-primary-500 rounded-2xl flex items-center justify-center mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-heading)] mb-3">{step.title}</h3>
                  <p className="text-[var(--text-muted)]">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[var(--text-heading)] mb-4">Tính năng nổi bật</h2>
              <p className="text-[var(--text-muted)] max-w-2xl mx-auto">Được thiết kế dành riêng cho nhu cầu di chuyển của sinh viên Việt Nam.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <IconUsers className="text-blue-500"/>, title: "Smart Matching", desc: "Thuật toán ghép chuyến thông minh dựa trên lộ trình, trường học, và lịch học." },
                { icon: <IconHeart className="text-red-500"/>, title: "Cộng đồng & Gas+Tip", desc: "Lựa chọn đi chung miễn phí hoặc chia sẻ chi phí xăng xe linh hoạt." },
                { icon: <IconMessageCircle className="text-green-500"/>, title: "Chat an toàn", desc: "Nhắn tin trực tiếp trong ứng dụng, bảo mật số điện thoại cá nhân." },
                { icon: <IconMapPin className="text-purple-500"/>, title: "Theo dõi GPS", desc: "Cập nhật vị trí chuyến đi theo thời gian thực, dễ dàng chia sẻ lộ trình." },
                { icon: <IconShieldCheck className="text-orange-500"/>, title: "SOS Khẩn cấp", desc: "Nút SOS luôn hiện diện, gửi cảnh báo ngay lập tức đến người thân." },
                { icon: <IconLeaf className="text-emerald-500"/>, title: "Eco Points", desc: "Tích điểm thưởng cho mỗi chuyến đi xanh, đổi voucher hấp dẫn." },
              ].map((feat, i) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                >
                  <Card padding="lg" hover className="h-full">
                    <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center mb-4">
                      {feat.icon}
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-heading)] mb-2">{feat.title}</h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">{feat.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PREMIUM SECTION */}
        <section id="premium" className="py-24 bg-surface-900 text-white relative overflow-hidden gradient-dark">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="max-w-7xl mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Badge variant="gold" className="mb-4">👑 Parago Premium</Badge>
              <h2 className="text-4xl font-bold mb-6">Bạn Đồng Hành</h2>
              <p className="text-lg text-gray-400 mb-8 max-w-md">
                Trải nghiệm đỉnh cao với các đặc quyền riêng biệt. Ghép chuyến ưu tiên, lọc giới tính, và chọn tài xế yêu thích.
              </p>
              <ul className="space-y-4 mb-8">
                {['Không quảng cáo', 'Ưu tiên ghép xe', 'Bộ lọc giới tính', 'Ghép theo khoa/ngành'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-500 flex items-center justify-center">
                      <IconShieldCheck size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Button size="lg" variant="gold" className="w-full sm:w-auto">
                Nâng cấp ngay từ 20.000đ/tháng
              </Button>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
               <div className="absolute -inset-4 bg-gold-500/20 blur-3xl rounded-full" />
               <Card variant="glass" className="border-gold-500/30 bg-black/40 backdrop-blur-xl p-8 relative">
                 <div className="flex justify-between items-start mb-6">
                   <div>
                     <h3 className="text-2xl font-bold text-white mb-1">Gói Học Kỳ</h3>
                     <p className="text-gold-400">Tiết kiệm 20%</p>
                   </div>
                   <div className="text-right">
                     <span className="text-3xl font-extrabold text-white">50.000đ</span>
                     <span className="text-gray-400">/kỳ</span>
                   </div>
                 </div>
                 <div className="h-px bg-white/10 my-6" />
                 <p className="text-sm text-gray-300 italic">"Đáng từng đồng! Mình lọc được toàn các bạn nữ cùng trường đi chung, rất an tâm." - Mai Anh</p>
               </Card>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-[var(--text-heading)] mb-6">Sẵn sàng lên xe?</h2>
            <p className="text-lg text-[var(--text-muted)] mb-8">Tham gia mạng lưới đi chung xe sinh viên lớn nhất Việt Nam ngay hôm nay.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button size="xl" variant="primary" className="w-full sm:w-auto text-lg px-12">Tạo tài khoản miễn phí</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border-default)] bg-surface-50 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <ParagoLogo size={28} color="#D32F2F" showText className="mb-4" />
              <p className="text-sm text-[var(--text-muted)] max-w-sm">
                Nền tảng kết nối sinh viên đi chung xe an toàn, tiện lợi và tiết kiệm. Sản phẩm được phát triển vì cộng đồng sinh viên Việt Nam.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[var(--text-heading)] mb-4">Sản phẩm</h4>
              <ul className="space-y-3 text-sm text-[var(--text-muted)]">
                <li><Link href="#" className="hover:text-primary-500">Tính năng</Link></li>
                <li><Link href="#" className="hover:text-primary-500">An toàn</Link></li>
                <li><Link href="#" className="hover:text-primary-500">Premium</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[var(--text-heading)] mb-4">Hỗ trợ</h4>
              <ul className="space-y-3 text-sm text-[var(--text-muted)]">
                <li><Link href="#" className="hover:text-primary-500">Trung tâm trợ giúp</Link></li>
                <li><Link href="#" className="hover:text-primary-500">Quy tắc cộng đồng</Link></li>
                <li><Link href="#" className="hover:text-primary-500">Liên hệ</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[var(--border-default)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[var(--text-muted)]">
            <p>© 2026 Parago. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-primary-500">Điều khoản</Link>
              <Link href="#" className="hover:text-primary-500">Bảo mật</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
