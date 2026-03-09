import type { ReactNode } from "react";
import { cn } from "@utils/cn";

export interface StepItem {
  key: string;
  title: ReactNode;
  description?: ReactNode;
}

export interface StepsProps {
  items: StepItem[];
  current?: number;
  className?: string;
}

const Steps = ({ items, current = 0, className }: StepsProps) => (
  <ol className={cn("grid gap-4 md:grid-cols-3", className)}>
    {items.map((item, index) => (
      <li key={item.key} className="rounded-xl border p-4 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold", index <= current ? "bg-brand-500 text-white" : "bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-gray-200")}>
            {index + 1}
          </span>
          <span className="font-medium text-[color:var(--text-primary)]">{item.title}</span>
        </div>
        {item.description ? <p className="mt-2 text-sm text-[color:var(--text-muted)]">{item.description}</p> : null}
      </li>
    ))}
  </ol>
);

export default Steps;

