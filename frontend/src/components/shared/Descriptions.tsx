import type { ReactNode } from "react";
import { cn } from "@utils/cn";

export interface DescriptionItem {
  key: string;
  label: ReactNode;
  value: ReactNode;
}

export interface DescriptionsProps {
  items: DescriptionItem[];
  columns?: 1 | 2 | 3;
  className?: string;
}

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-3",
} as const;

const Descriptions = ({ items, columns = 2, className }: DescriptionsProps) => (
  <dl className={cn("grid gap-4", columnClasses[columns], className)}>
    {items.map((item) => (
      <div key={item.key} className="rounded-xl border p-4 dark:border-slate-700">
        <dt className="text-xs uppercase tracking-[0.18em] text-app-muted">{item.label}</dt>
        <dd className="mt-2 text-sm font-medium text-app-primary">{item.value}</dd>
      </div>
    ))}
  </dl>
);

export default Descriptions;
