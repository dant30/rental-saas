import type { ReactNode } from "react";

export interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
}

const Tooltip = ({ children, content }: TooltipProps) => <span title={typeof content === "string" ? content : undefined}>{children}</span>;

export default Tooltip;
