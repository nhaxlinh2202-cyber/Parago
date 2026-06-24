"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button, Card, Input } from "@/components/ui";
import { ParagoLogo } from "@/components/ui/logo";
import { IconMail, IconLock, IconUser, IconSchool, IconBook, IconAlertCircle } from "@tabler/icons-react";
import { apiClient } from "@/lib/api-client";

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    university: "",
    faculty: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await apiClient.post("/auth/register", formData);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(
        typeof err.response?.data?.message === 'string' 
          ? err.response?.data?.message 
          : err.response?.data?.message?.[0] || "Đã có lỗi xảy ra. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg-primary)] p-4 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-[var(--text-heading)] mb-2">Đăng ký thành công!</h2>
          <p className="text-[var(--text-muted)] max-w-md mx-auto">
            Tài khoản của bạn đã được tạo. Bạn sẽ được chuyển hướng tới trang đăng nhập trong giây lát...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg-primary)] p-4 relative overflow-hidden py-12">
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <Link href="/">
            <ParagoLogo size={40} color="#D32F2F" showText className="mx-auto justify-center mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text-heading)]">Tạo tài khoản</h1>
          <p className="text-[var(--text-muted)] mt-2">Gia nhập cộng đồng đi chung xe sinh viên ngay!</p>
        </div>

        <Card padding="lg" variant="glass" className="border-surface-200">
          <form onSubmit={handleRegister} className="space-y-4">
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-start gap-2 border border-red-100"
              >
                <IconAlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            <Input
              label="Họ và tên"
              name="name"
              placeholder="Nguyễn Văn A"
              value={formData.name}
              onChange={handleChange}
              icon={<IconUser size={18} />}
              required
            />

            <Input
              label="Email trường"
              name="email"
              placeholder="sv@hust.edu.vn"
              type="email"
              value={formData.email}
              onChange={handleChange}
              icon={<IconMail size={18} />}
              required
            />
            <p className="text-xs text-[var(--text-muted)] -mt-2">
              Chỉ chấp nhận email đuôi .edu.vn (vd: hust.edu.vn, vnu.edu.vn)
            </p>
            
            <Input
              label="Mật khẩu"
              name="password"
              placeholder="••••••••"
              type="password"
              value={formData.password}
              onChange={handleChange}
              icon={<IconLock size={18} />}
              required
              minLength={6}
            />

            <Input
              label="Trường đại học"
              name="university"
              placeholder="ĐH Bách Khoa Hà Nội"
              value={formData.university}
              onChange={handleChange}
              icon={<IconSchool size={18} />}
              required
            />

            <Input
              label="Khoa / Viện"
              name="faculty"
              placeholder="Công nghệ Thông tin"
              value={formData.faculty}
              onChange={handleChange}
              icon={<IconBook size={18} />}
            />

            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              className="w-full mt-6"
              loading={isLoading}
            >
              Đăng ký tài khoản
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-primary-600 font-medium hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
