import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@utils/cn";

type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "outline";
type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: "md" | "full";
  dot?: boolean;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
  secondary: "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-200",
  success: "bg-success-100 text-success-700",
  warning: "bg-warning-100 text-warning-700",
  danger: "bg-danger-100 text-danger-700",
  info: "bg-blue-100 text-blue-700",
  outline: "border border-gray-300 text-gray-700 dark:border-slate-600 dark:text-gray-200",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

const Badge = ({ variant = "primary", size = "md", rounded = "full", dot = false, className, children, ...props }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 border border-transparent font-semibold tracking-wide",
      rounded === "full" ? "rounded-full" : "rounded-md",
      sizeClasses[size],
      variantClasses[variant],
      className,
    )}
    {...props}
  >
    {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
    {children}
  </span>
);

export default Badge;
