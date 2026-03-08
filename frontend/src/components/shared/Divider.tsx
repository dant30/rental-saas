import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@utils/cn";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
}

const Divider = ({ label, className, ...props }: DividerProps) => (
  <div className={cn("flex items-center gap-3", className)} {...props}>
    <div className="h-px flex-1 bg-gray-200 dark:bg-slate-700" />
    {label ? <span className="text-xs uppercase tracking-[0.18em] text-app-muted">{label}</span> : null}
    <div className="h-px flex-1 bg-gray-200 dark:bg-slate-700" />
  </div>
);

export default Divider;
