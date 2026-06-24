"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

const publicRoutes = ["/", "/login", "/register"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated && !publicRoutes.includes(pathname)) {
        router.push("/login");
      }
      
      // Optional: redirect authenticated users away from public auth routes
      if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
        router.push("/home");
      }
    }
  }, [isInitialized, isAuthenticated, pathname, router]);

  // Show loading screen while auth state is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <img src="/logo/logo-parago-icon-1024.png" alt="Loading Logo" className="w-24 h-24 object-contain" />
          <p className="text-[var(--text-muted)] text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Prevent flashing protected content to unauthenticated users
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
