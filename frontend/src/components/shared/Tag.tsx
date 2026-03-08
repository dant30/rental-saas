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
  default: "bg-gray-100 text-gray-700",
  primary: "bg-primary-100 text-primary-700",
  success: "bg-success-100 text-success-700",
  warning: "bg-warning-100 text-warning-700",
  danger: "bg-danger-100 text-danger-700",
  info: "bg-blue-100 text-blue-700",
  dark: "bg-slate-800 text-white",
};

const Tag = ({ children, variant = "default", onRemove, className, ...props }: TagProps) => (
  <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium", variantClasses[variant], className)} {...props}>
    {children}
    {onRemove ? (
      <button type="button" onClick={onRemove} className="rounded-full p-0.5 hover:bg-black/10" aria-label="Remove tag">
        <X className="h-3 w-3" />
      </button>
    ) : null}
  </span>
);

export default Tag;
