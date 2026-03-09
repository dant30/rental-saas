import type { HTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@utils/cn";

type TagVariant = "default" | "primary" | "success" | "warning" | "danger" | "info" | "dark";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: TagVariant;
  onRemove?: () => void;
}

const variantClasses: Record<TagVariant, string> = {
  default: "border border-gray-200 bg-gray-100 text-gray-700",
  primary: "border border-primary-200 bg-primary-100 text-primary-700",
  success: "border border-success-200 bg-success-100 text-success-700",
  warning: "border border-warning-200 bg-warning-100 text-warning-700",
  danger: "border border-danger-200 bg-danger-100 text-danger-700",
  info: "border border-blue-200 bg-blue-100 text-blue-700",
  dark: "border border-slate-700 bg-slate-800 text-white",
};

const Tag = ({ children, variant = "default", onRemove, className, ...props }: TagProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
      variantClasses[variant],
      className,
    )}
    {...props}
  >
    {children}
    {onRemove ? (
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 transition-colors hover:bg-black/10"
        aria-label="Remove tag"
      >
        <X className="h-3 w-3" />
      </button>
    ) : null}
  </span>
);

export default Tag;
