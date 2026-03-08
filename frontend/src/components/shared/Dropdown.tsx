import { useState, type ReactNode } from "react";
import { cn } from "@utils/cn";

export interface DropdownItem {
  key: string;
  label: ReactNode;
  onClick?: () => void;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  className?: string;
}

const Dropdown = ({ trigger, items, className }: DropdownProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative inline-block", className)}>
      <button type="button" onClick={() => setOpen((current) => !current)}>
        {trigger}
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 min-w-40 rounded-xl border bg-white p-1 shadow-hard dark:border-slate-700 dark:bg-slate-900">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-800"
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default Dropdown;
