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
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium",
              item.value === current?.value ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-200",
            )}
            onClick={() => setActive(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div>{current?.content}</div>
    </div>
  );
};

export default Tabs;
