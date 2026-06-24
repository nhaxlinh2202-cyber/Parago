"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const loadUserFromStorage = useAuthStore((state) => state.loadUserFromStorage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadUserFromStorage();
    setMounted(true);
  }, [loadUserFromStorage]);

  // Optionally avoid rendering children until mounted if strict hydration is needed,
  // but to avoid layout shift, it's often fine to just render children immediately
  return <>{children}</>;
}
