import type { ReactNode } from "react";

export interface StatisticProps {
  label: ReactNode;
  value: ReactNode;
  suffix?: ReactNode;
}

const Statistic = ({ label, value, suffix }: StatisticProps) => (
  <div className="rounded-xl border p-4 dark:border-slate-700">
    <div className="text-xs uppercase tracking-[0.18em] text-app-muted">{label}</div>
    <div className="mt-2 text-2xl font-semibold text-app-primary">
      {value}
      {suffix ? <span className="ml-1 text-sm text-app-muted">{suffix}</span> : null}
    </div>
  </div>
);

export default Statistic;
