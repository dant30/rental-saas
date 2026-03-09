import type { ReactNode } from "react";
import { cn } from "@utils/cn";

export interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  className?: string;
  side?: "top" | "bottom";
}

const Tooltip = ({ children, content, className, side = "top" }: TooltipProps) => (
  <span className={cn("group relative inline-flex items-center", className)}>
    <span
      className={cn(
        "pointer-events-none absolute left-1/2 z-[var(--layer-dropdown)] w-max max-w-xs -translate-x-1/2 rounded-md border border-[var(--border-soft)] bg-[var(--bg-panel-strong)] px-2.5 py-1.5 text-xs text-[color:var(--text-primary)] opacity-0 shadow-soft transition-all duration-150 group-hover:opacity-100 group-focus-within:opacity-100",
        side === "top" ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]",
      )}
      role="tooltip"
    >
      {content}
    </span>
    {children}
  </span>
);

export default Tooltip;
