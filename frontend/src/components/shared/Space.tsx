import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@utils/cn";

export interface SpaceProps extends HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg";
  direction?: "horizontal" | "vertical";
  children: ReactNode;
}

const gapClasses = {
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
} as const;

const Space = ({ size = "md", direction = "horizontal", className, children, ...props }: SpaceProps) => (
  <div className={cn("flex", direction === "vertical" ? "flex-col" : "flex-row flex-wrap items-center", gapClasses[size], className)} {...props}>
    {children}
  </div>
);

export default Space;
