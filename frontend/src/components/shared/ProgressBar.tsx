import type { HTMLAttributes } from "react";
import { cn } from "@utils/cn";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
}

const ProgressBar = ({ value, max = 100, className, ...props }: ProgressBarProps) => {
  const safeValue = Math.max(0, Math.min(value, max));
  const percent = (safeValue / max) * 100;

  return (
    <div className={cn("h-2.5 w-full rounded-full bg-gray-200 dark:bg-slate-700", className)} {...props}>
      <div className="h-full rounded-full bg-brand-500 transition-[width]" style={{ width: `${percent}%` }} />
    </div>
  );
};

export default ProgressBar;

