import React from "react";
import Image from "next/image";

interface ParagoLogoProps {
  size?: number;
  color?: string;
  className?: string;
  showText?: boolean;
}

export function ParagoLogo({ size = 40, color = "currentColor", className = "", showText = false }: ParagoLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div style={{ width: size, height: size, position: 'relative' }}>
        <Image 
          src="/logo/logo-parago-transparent.png" 
          alt="Parago Logo" 
          fill
          sizes={`${size}px`}
          style={{ objectFit: 'contain' }}
        />
      </div>
      {showText && (
        <span className="text-xl font-bold tracking-wide" style={{ color }}>
          parago
        </span>
      )}
    </div>
  );
}
