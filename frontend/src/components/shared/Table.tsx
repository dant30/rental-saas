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
}

const Table = <T,>({ columns, data, rowKey, className }: TableProps<T>) => (
  <div className={cn("overflow-x-auto rounded-xl border dark:border-slate-700", className)}>
    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
      <thead className="bg-gray-50 dark:bg-slate-800">
        <tr>
          {columns.map((column) => (
            <th key={column.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
        {data.map((row, index) => (
          <tr key={rowKey(row, index)}>
            {columns.map((column) => (
              <td key={column.key} className="px-4 py-3 text-sm text-app-primary">
                {column.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Table;
