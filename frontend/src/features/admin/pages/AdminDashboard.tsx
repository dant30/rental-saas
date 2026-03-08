import { useEffect, useState } from "react";

import Header from "../../../components/layout/Header";
import { formatCurrency } from "../../../core/utils/formatters";
import TenantManager from "../components/TenantManager";
import UserList from "../components/UserList";
import { useAdmin } from "../hooks/useAdmin";

const AdminDashboardPage = () => {
  const admin = useAdmin();
  const [summary, setSummary] = useState<Record<string, unknown>>({});

  useEffect(() => {
    void admin.ownerSummary().then(setSummary).catch(() => setSummary({}));
  }, [admin]);

  const stats = [
    {
      label: "Summary keys",
      value: Object.keys(summary).length,
    },
    {
      label: "Portfolio rent",
      value:
        typeof summary.total_rent === "number" || typeof summary.total_rent === "string"
          ? formatCurrency(summary.total_rent as number | string)
          : "Pending",
    },
    {
      label: "Outstanding",
      value:
        typeof summary.outstanding_balance === "number" || typeof summary.outstanding_balance === "string"
          ? formatCurrency(summary.outstanding_balance as number | string)
          : "Pending",
    },
  ];

  return (
    <>
      <Header subtitle="Tenant provisioning and platform controls." title="Admin Dashboard" />

      <section className="stats-grid">
        {stats.map((stat) => (
          <article className="theme-kpi" key={stat.label}>
            <span className="theme-caption">{stat.label}</span>
            <span className="theme-stat">{stat.value}</span>
          </article>
        ))}
      </section>

      <section className="report-grid" style={{ marginTop: "2rem" }}>
        <article className="surface-panel activity-card">
          <h3>Provision tenant</h3>
          <p className="theme-subtitle">Create and bootstrap a new tenant workspace.</p>
          <div style={{ marginTop: "1rem" }}>
            <TenantManager />
          </div>
        </article>

        <article className="surface-panel activity-card">
          <h3>Admin notes</h3>
          <UserList />
        </article>
      </section>
    </>
  );
};

export default AdminDashboardPage;
