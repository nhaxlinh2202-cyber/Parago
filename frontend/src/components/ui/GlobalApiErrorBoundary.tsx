"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './index';
import { IconServerOff } from '@tabler/icons-react';

export function GlobalApiErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleApiError = (e: any) => {
      if (e.detail?.status >= 500) {
        setHasError(true);
      }
    };
    window.addEventListener('api-error', handleApiError);
    return () => window.removeEventListener('api-error', handleApiError);
  }, []);

  if (hasError) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[var(--bg-default)] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-6 shadow-sm">
          <IconServerOff size={40} />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-heading)] mb-2">Hệ thống đang bận</h2>
        <p className="text-[var(--text-body)] mb-8 max-w-sm leading-relaxed">
          Đường truyền tới máy chủ đang gặp sự cố hoặc máy chủ quá tải. Vui lòng thử lại sau giây lát.
        </p>
        <Button 
          variant="primary" 
          size="lg"
          onClick={() => window.location.reload()}
          className="min-w-[200px]"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
