import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@utils/cn";

export interface AccordionItemData {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export interface AccordionProps {
  items?: AccordionItemData[];
  allowMultiple?: boolean;
  className?: string;
}

const Accordion = ({ items = [], allowMultiple = false, className }: AccordionProps) => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggle = (id: string) => {
    setOpenItems((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      return allowMultiple ? [...current, id] : [id];
    });
  };

  return (
    <div className={cn("divide-y divide-gray-200 rounded-2xl border bg-[var(--bg-panel)] shadow-soft dark:divide-slate-700 dark:border-slate-700", className)}>
      {items.map((item) => {
        const open = openItems.includes(item.id);
        return (
          <div key={item.id}>
            <button
              type="button"
              className={cn(
                "flex w-full items-center justify-between px-4 py-3 text-left transition-colors",
                open
                  ? "bg-brand-50/60 dark:bg-brand-900/15"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/70",
              )}
              onClick={() => toggle(item.id)}
              aria-expanded={open}
            >
              <span className="font-medium text-[color:var(--text-primary)]">{item.title}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-[color:var(--text-muted)] transition-transform",
                  open && "rotate-180 text-brand-500",
                )}
              />
            </button>
            {open ? (
              <div className="px-4 pb-4 pt-1 text-sm leading-relaxed text-[color:var(--text-muted)]">
                {item.content}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;

