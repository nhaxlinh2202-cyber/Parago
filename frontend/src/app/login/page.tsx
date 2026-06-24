"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button, Card, Input } from "@/components/ui";
import { ParagoLogo } from "@/components/ui/logo";
import { IconMail, IconLock, IconArrowRight, IconAlertCircle } from "@tabler/icons-react";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const setTokens = useAuthStore((state) => state.setTokens);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });

      const { accessToken, refreshToken } = response.data;
      setTokens(accessToken, refreshToken);
      
      const userResponse = await apiClient.get("/auth/me");
      useAuthStore.getState().setUser(userResponse.data);
      
      router.push("/home");
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg-primary)] p-4 relative overflow-hidden">
      {/* Background decoration */}
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
          <h1 className="text-2xl font-bold text-[var(--text-heading)]">Chào mừng trở lại!</h1>
          <p className="text-[var(--text-muted)] mt-2">Đăng nhập để tiếp tục hành trình của bạn.</p>
        </div>

        <Card padding="lg" variant="glass" className="border-surface-200">
          <form onSubmit={handleLogin} className="space-y-4">
            
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
              label="Email trường"
              placeholder="sv@hust.edu.vn"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<IconMail size={18} />}
              required
            />
            
            <div>
              <Input
                label="Mật khẩu"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<IconLock size={18} />}
                required
              />
              <div className="flex justify-end mt-2">
                <Link href="#" className="text-sm text-primary-600 font-medium hover:underline">Quên mật khẩu?</Link>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              className="w-full mt-6"
              loading={isLoading}
              icon={!isLoading && <IconArrowRight size={18} />}
            >
              Đăng nhập
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-primary-600 font-medium hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
