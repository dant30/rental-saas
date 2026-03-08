import type { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@utils/cn";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  hint?: ReactNode;
}

const Label = ({ children, className, required, hint, ...props }: LabelProps) => (
  <label className={cn("ui-label", className)} {...props}>
    <span className="inline-flex items-center gap-1">
      {children}
      {required ? <span className="text-danger-500">*</span> : null}
    </span>
    {hint ? <span className="ml-2 text-xs text-app-muted">{hint}</span> : null}
  </label>
);

export default Label;
