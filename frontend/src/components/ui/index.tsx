"use client";

export * from './GlobalApiErrorBoundary';


import React from "react";
import { cn } from "@/lib/utils";

// ==========================================
// BUTTON
// ==========================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg active:shadow-sm",
    secondary: "bg-surface-100 hover:bg-surface-200 text-text-primary dark:bg-surface-200 dark:hover:bg-surface-300",
    outline: "border-2 border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10",
    ghost: "text-text-secondary hover:bg-surface-100 hover:text-text-primary dark:hover:bg-surface-200",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-md",
    gold: "bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white shadow-md shadow-gold-500/20",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
    md: "h-10 px-4 text-sm rounded-xl gap-2",
    lg: "h-12 px-6 text-base rounded-xl gap-2.5",
    xl: "h-14 px-8 text-lg rounded-2xl gap-3",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-200 btn-press",
        "disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

// ==========================================
// CARD
// ==========================================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "glass";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  variant = "default",
  hover = false,
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  const variants = {
    default: "bg-[var(--bg-card)] border border-[var(--border-default)]",
    elevated: "bg-[var(--bg-card)] shadow-md",
    outlined: "bg-transparent border-2 border-[var(--border-default)]",
    glass: "glass",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-200",
        variants[variant],
        paddings[padding],
        hover && "card-hover cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ==========================================
// AVATAR
// ==========================================
interface AvatarProps {
  src?: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  verified?: boolean;
  premium?: boolean;
  className?: string;
}

export function Avatar({ src, name, size = "md", verified, premium, className }: AvatarProps) {
  const sizes = {
    xs: "w-6 h-6 text-[8px]",
    sm: "w-8 h-8 text-[10px]",
    md: "w-10 h-10 text-xs",
    lg: "w-12 h-12 text-sm",
    xl: "w-16 h-16 text-lg",
  };

  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold",
          "bg-primary-50 text-primary-500 dark:bg-primary-500/20",
          premium && "ring-2 ring-gold-400",
          sizes[size]
        )}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          initials
        )}
      </div>
      {verified && (
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ==========================================
// BADGE
// ==========================================
interface BadgeProps {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "gold" | "outline";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant = "default", size = "sm", children, className, dot }: BadgeProps) {
  const variants = {
    default: "bg-surface-100 text-text-secondary dark:bg-surface-200",
    primary: "bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400",
    success: "bg-success-50 text-success-600 dark:bg-green-500/15 dark:text-green-400",
    warning: "bg-warning-50 text-warning-600 dark:bg-orange-500/15 dark:text-orange-400",
    danger: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
    gold: "bg-gold-50 text-gold-700 dark:bg-gold-500/15 dark:text-gold-400",
    outline: "border border-[var(--border-default)] text-text-secondary",
  };

  const sizes = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

// ==========================================
// INPUT
// ==========================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({ label, error, icon, leftIcon, rightIcon, className, ...props }: InputProps) {
  const renderIcon = leftIcon || icon;
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--text-heading)]">{label}</label>
      )}
      <div className="relative">
        {renderIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {renderIcon}
          </div>
        )}
        <input
          className={cn(
            "w-full h-11 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]",
            "text-sm text-[var(--text-heading)] placeholder:text-[var(--text-muted)]",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500",
            "transition-all duration-200",
            renderIcon ? "pl-10" : "pl-4",
            rightIcon ? "pr-10" : "pr-4",
            error && "border-red-500 focus:ring-red-500/30",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ==========================================
// SKELETON
// ==========================================
interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
}

export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  const variants = {
    text: "h-4 rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-2xl",
  };

  return (
    <div className={cn("animate-shimmer", variants[variant], className)} />
  );
}

// ==========================================
// FLOATING ACTION BUTTON
// ==========================================
interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  size?: "md" | "lg";
  variant?: "primary" | "gold" | "danger";
}

export function FAB({ icon, size = "lg", variant = "primary", className, ...props }: FABProps) {
  const variants = {
    primary: "bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30",
    gold: "bg-gold-500 hover:bg-gold-600 text-white shadow-lg shadow-gold-500/30",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30",
  };

  const sizes = {
    md: "w-12 h-12",
    lg: "w-14 h-14",
  };

  return (
    <button
      className={cn(
        "rounded-full flex items-center justify-center transition-all duration-200",
        "hover:scale-105 active:scale-95",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
}

// ==========================================
// STAR RATING
// ==========================================
interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({ rating, maxStars = 5, size = "sm", interactive = false, onChange }: StarRatingProps) {
  const sizes = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-7 h-7" };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(i + 1)}
          className={cn(interactive && "cursor-pointer hover:scale-110 transition-transform")}
        >
          <svg
            className={cn(
              sizes[size],
              i < Math.floor(rating) ? "text-gold-500" : "text-surface-300 dark:text-surface-400"
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

// ==========================================
// BOTTOM SHEET (placeholder wrapper)
// ==========================================
interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function BottomSheet({ open, onClose, children, title }: BottomSheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-h-[85vh] bg-[var(--bg-card)] rounded-t-3xl overflow-y-auto animate-[slide-up_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[var(--bg-card)] pt-3 pb-2 px-6 z-10">
          <div className="w-10 h-1 bg-surface-300 rounded-full mx-auto mb-3" />
          {title && <h3 className="text-lg font-bold text-[var(--text-heading)]">{title}</h3>}
        </div>
        <div className="px-6 pb-8">{children}</div>
      </div>
    </div>
  );
}

// ==========================================
// EMPTY STATE
// ==========================================
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-200 flex items-center justify-center mb-4 text-text-tertiary">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[var(--text-heading)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] max-w-xs mb-4">{description}</p>
      {action}
    </div>
  );
}

export * from "./LocationPicker";
