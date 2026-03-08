import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@utils/cn";

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  fullscreen?: boolean;
}

const Loading = ({ label = "Loading...", fullscreen = false, className, ...props }: LoadingProps) => (
  <div
    className={cn(
      "flex items-center justify-center gap-3 text-app-muted",
      fullscreen && "min-h-[50vh]",
      className,
    )}
    {...props}
  >
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
    <span>{label}</span>
  </div>
);

export default Loading;
