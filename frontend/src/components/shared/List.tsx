import type { ReactNode } from "react";
import { cn } from "@utils/cn";

export interface ListProps<T> {
  items: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
  emptyText?: string;
  className?: string;
}

const List = <T,>({ items, keyExtractor, renderItem, emptyText = "No items found", className }: ListProps<T>) => {
  if (!items.length) {
    return <div className={cn("rounded-xl border p-4 text-sm text-[color:var(--text-muted)] dark:border-slate-700", className)}>{emptyText}</div>;
  }

  return (
    <ul className={cn("divide-y divide-gray-200 rounded-xl border dark:divide-slate-700 dark:border-slate-700", className)}>
      {items.map((item, index) => (
        <li key={keyExtractor(item, index)} className="px-4 py-3">
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
};

export default List;

