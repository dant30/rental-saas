import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@utils/cn";

export interface RowProps extends HTMLAttributes<HTMLDivElement> {
  gap?: "sm" | "md" | "lg";
}

const Row = forwardRef<HTMLDivElement, RowProps>(({ className, gap = "md", ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-wrap", gap === "sm" && "gap-2", gap === "md" && "gap-4", gap === "lg" && "gap-6", className)}
    {...props}
  />
));

Row.displayName = "Row";

export default Row;
