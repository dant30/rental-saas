import Header from "../../../components/layout/Header";
import RecentActivity from "../components/RecentActivity";
import StatsWidget from "../components/StatsWidget";
import { ActivityItem, DashboardMetric } from "../types";

const defaultMetrics: DashboardMetric[] = [
  { label: "Occupied Units", value: "91%", status: "success" },
  { label: "Overdue Invoices", value: "14", status: "warning" },
  { label: "Unread Notifications", value: "8" },
];

const defaultActivity: ActivityItem[] = [
  { title: "MPesa received", description: "New mobile money payment recorded against invoice INV-2026-0301." },
  { title: "Maintenance scheduled", description: "Quarterly tank inspection work order generated automatically." },
];

const DashboardPage = () => (
  <>
    <Header subtitle="Live backend APIs can now replace these placeholders incrementally." title="Dashboard" />
    <section className="stats-grid">
      {defaultMetrics.map((metric) => (
        <StatsWidget key={metric.label} metric={metric} />
      ))}
    </section>
    <section style={{ marginTop: "2rem" }}>
      <RecentActivity items={defaultActivity} />
    </section>
  </>
);

export default DashboardPage;
