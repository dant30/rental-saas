import type { ReactNode } from "react";

export interface TimelineItem {
  key: string;
  title: ReactNode;
  description?: ReactNode;
  date?: ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const Timeline = ({ items, className }: TimelineProps) => (
  <ol className={`space-y-4 ${className ?? ""}`}>
    {items.map((item) => (
      <li key={item.key} className="relative border-l border-gray-200 pl-6 dark:border-slate-700">
        <span className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500" />
        <div className="font-medium text-[color:var(--text-primary)]">{item.title}</div>
        {item.description ? <div className="mt-1 text-sm text-[color:var(--text-muted)]">{item.description}</div> : null}
        {item.date ? <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">{item.date}</div> : null}
      </li>
    ))}
  </ol>
);

export default Timeline;

