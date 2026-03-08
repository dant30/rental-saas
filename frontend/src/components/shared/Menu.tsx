import type { ReactNode } from "react";
import { cn } from "@utils/cn";

export interface MenuItem {
  key: string;
  label: ReactNode;
  onClick?: () => void;
}

export interface MenuProps {
  items: MenuItem[];
  className?: string;
}

const Menu = ({ items, className }: MenuProps) => (
  <div className={cn("rounded-xl border bg-white p-1 dark:border-slate-700 dark:bg-slate-900", className)}>
    {items.map((item) => (
      <button
        key={item.key}
        type="button"
        className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-800"
        onClick={item.onClick}
      >
        {item.label}
      </button>
    ))}
  </div>
);

export default Menu;
