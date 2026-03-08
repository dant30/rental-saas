import type { ReactNode } from "react";
import { cn } from "@utils/cn";

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
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
  <div className={cn("overflow-x-auto rounded-xl border dark:border-slate-700", className)}>
    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
      <thead className="bg-gray-50 dark:bg-slate-800">
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-app-muted"
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
        {data.map((row, index) => {
          const rowClass =
            typeof rowClassName === "function" ? rowClassName(row) : rowClassName;

          return (
            <tr
              key={rowKey(row, index)}
              className={cn(
                onRowClick && "cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800",
                rowClass,
              )}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-sm text-app-primary">
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
