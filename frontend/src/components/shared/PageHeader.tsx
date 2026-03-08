import type { ReactNode } from "react";
import { cn } from "@utils/cn";

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

const PageHeader = ({ title, subtitle, actions, className }: PageHeaderProps) => (
  <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-app-primary">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-app-muted">{subtitle}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
  </div>
);

export default PageHeader;
