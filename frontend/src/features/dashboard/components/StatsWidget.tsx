import { DashboardMetric } from "../types";

const StatsWidget = ({ metric }: { metric: DashboardMetric }) => (
  <article className="glass-panel metric-card">
    <span className={`status-badge${metric.status ? ` status-badge--${metric.status}` : ""}`}>{metric.label}</span>
    <div className="metric-value">{metric.value}</div>
  </article>
);

export default StatsWidget;
