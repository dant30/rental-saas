import { useState, type ReactNode } from "react";
import { cn } from "@utils/cn";

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  className?: string;
}

const Tabs = ({ items, defaultValue, className }: TabsProps) => {
  const [active, setActive] = useState(defaultValue ?? items[0]?.value);
  const current = items.find((item) => item.value === active) ?? items[0];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-panel)] p-1 shadow-soft">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              item.value === current?.value
                ? "bg-brand-500 text-white shadow-sm"
                : "text-[color:var(--text-secondary)] hover:bg-slate-100/80 hover:text-[color:var(--text-primary)] dark:hover:bg-slate-800/80",
            )}
            onClick={() => setActive(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="animate-fade-in">{current?.content}</div>
    </div>
  );
};

export default Tabs;

