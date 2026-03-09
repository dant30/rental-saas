import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@utils/cn";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success"
  | "warning"
  | "info";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon";
type IconPosition = "left" | "right";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  icon?: ReactNode;
  iconPosition?: IconPosition;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 text-white shadow-sm hover:bg-brand-700 hover:shadow-md active:bg-brand-900",
  secondary:
    "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-100 dark:hover:bg-slate-600",
  outline:
    "border border-gray-300 text-gray-800 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-100 dark:hover:bg-slate-700",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-200 dark:hover:bg-slate-700",
  danger:
    "bg-[var(--danger)] text-white shadow-sm hover:brightness-95 active:brightness-90",
  success:
    "bg-[var(--success)] text-white shadow-sm hover:brightness-95 active:brightness-90",
  warning:
    "bg-[var(--warning)] text-[var(--color-ink-950)] hover:brightness-95 active:brightness-90",
  info: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1.5 text-xs h-7",
  sm: "px-3 py-2 text-xs h-8",
  md: "px-4 py-2.5 text-sm h-10",
  lg: "px-5 py-3 text-base h-12",
  icon: "p-2 h-10 w-10",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      loadingText,
      fullWidth = false,
      leadingIcon,
      trailingIcon,
      icon,
      iconPosition = "left",
      disabled = false,
      children,
      className,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const resolvedLeadingIcon = leadingIcon ?? (iconPosition === "left" ? icon : null);
    const resolvedTrailingIcon = trailingIcon ?? (iconPosition === "right" ? icon : null);
    const isDisabled = disabled || loading;
    const hasOnlyIcon = !children && (resolvedLeadingIcon || resolvedTrailingIcon) && size === "icon";

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold tracking-tight transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          hasOnlyIcon && "aspect-square",
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>{loadingText || "Loading..."}</span>
          </>
        ) : (
          <>
            {resolvedLeadingIcon ? (
              <span className={cn(children && "mr-2", "inline-flex items-center")}>{resolvedLeadingIcon}</span>
            ) : null}
            {children}
            {resolvedTrailingIcon ? (
              <span className={cn(children && "ml-2", "inline-flex items-center")}>{resolvedTrailingIcon}</span>
            ) : null}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
