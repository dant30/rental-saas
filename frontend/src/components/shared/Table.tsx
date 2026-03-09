import type { ReactNode } from "react";
import { cn } from "@utils/cn";

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  /** Optional custom classname for the table cell (e.g. for tighter padding). */
  cellClassName?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string;
  className?: string;
  /** Optional row click handler (e.g. navigate to a detail page). */
  onRowClick?: (row: T) => void;
  /** Optional row class name (static or per row). */
  rowClassName?: string | ((row: T) => string);
}

const Table = <T,>({
  columns,
  data,
  rowKey,
  className,
  onRowClick,
  rowClassName,
}: TableProps<T>) => (
  <div className={cn("overflow-x-auto rounded-xl border bg-[var(--bg-panel)] shadow-soft dark:border-slate-700", className)}>
    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
      <thead className="bg-gray-50/90 backdrop-blur-sm dark:bg-slate-800/90">
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              className="sticky top-0 z-[var(--layer-sticky)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]"
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white/85 dark:divide-slate-700 dark:bg-slate-900/80">
        {data.map((row, index) => {
          const rowClass =
            typeof rowClassName === "function" ? rowClassName(row) : rowClassName;

          return (
            <tr
              key={rowKey(row, index)}
              className={cn(
                "transition-colors",
                index % 2 === 1 && "bg-slate-50/60 dark:bg-slate-800/35",
                onRowClick && "cursor-pointer hover:bg-brand-50/70 dark:hover:bg-brand-900/20",
                rowClass,
              )}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-sm text-[color:var(--text-primary)]",
                    column.cellClassName,
                  )}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default Table;

