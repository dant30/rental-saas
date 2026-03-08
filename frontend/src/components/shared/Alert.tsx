import type { HTMLAttributes, ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@utils/cn";

type AlertVariant = "info" | "success" | "warning" | "danger";

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: AlertVariant;
  title?: ReactNode;
  description?: ReactNode;
  onDismiss?: () => void;
}

const iconMap = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle,
} satisfies Record<AlertVariant, typeof Info>;

const variantClasses: Record<AlertVariant, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-800",
  success: "border-success-200 bg-success-50 text-success-800",
  warning: "border-warning-200 bg-warning-50 text-warning-800",
  danger: "border-danger-200 bg-danger-50 text-danger-800",
};

const Alert = ({ variant = "info", title, description, onDismiss, children, className, ...props }: AlertProps) => {
  const Icon = iconMap[variant];

  return (
    <div className={cn("rounded-xl border p-4", variantClasses[variant], className)} role="alert" {...props}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1 space-y-1">
          {title ? <div className="font-semibold">{title}</div> : null}
          {description ? <div className="text-sm opacity-90">{description}</div> : null}
          {children}
        </div>
        {onDismiss ? (
          <button type="button" onClick={onDismiss} className="rounded p-1 hover:bg-black/5" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default Alert;
