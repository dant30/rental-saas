import { Link } from "react-router-dom";

import Header from "../../../components/layout/Header";
import EmptyState from "../../../components/shared/EmptyState";
import Loading from "../../../components/shared/Loading";
import { routePaths } from "../../../core/constants/routePaths";
import { formatCurrency } from "../../../core/utils/formatters";
import { getStoredSession } from "../../../router/PrivateRoute";
import { useDashboard } from "../hooks/useDashboard";

const roleSummaryMap = {
  admin: "owner",
  landlord: "owner",
  owner: "owner",
  caretaker: "caretaker",
  tenant: "tenant",
} as const;

const roleTitleMap = {
  admin: "Platform command center",
  landlord: "Portfolio command center",
  owner: "Ownership overview",
  caretaker: "Operations dispatch",
  tenant: "Resident hub",
} as const;

const roleSubtitleMap = {
  admin: "Track collections, operations, and tenant activity from one place.",
  landlord: "Monitor property health, cash flow, and active tenant operations.",
  owner: "Review finance, occupancy, and service activity across your portfolio.",
  caretaker: "Prioritize maintenance work, active assignments, and resident requests.",
  tenant: "Review invoices, payments, and service updates in one resident-facing hub.",
} as const;

const roleLinksMap = {
  admin: [
    { label: "Open admin console", to: routePaths.admin },
    { label: "Review notifications", to: routePaths.notifications },
    { label: "Inspect payments", to: routePaths.payments },
  ],
  landlord: [
    { label: "View properties", to: routePaths.properties },
    { label: "Inspect payments", to: routePaths.payments },
    { label: "Open tenant portal", to: routePaths.tenantPortal },
  ],
  owner: [
    { label: "Open payment center", to: routePaths.payments },
    { label: "Review arrears", to: routePaths.arrears },
    { label: "Inspect properties", to: routePaths.properties },
  ],
  caretaker: [
    { label: "View maintenance board", to: routePaths.maintenance },
    { label: "Check notifications", to: routePaths.notifications },
    { label: "Open workspace", to: routePaths.dashboard },
  ],
  tenant: [
    { label: "Open resident portal", to: routePaths.tenantPortal },
    { label: "Review payments", to: routePaths.payments },
    { label: "View notifications", to: routePaths.notifications },
  ],
} as const;

const prettyLabel = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const DashboardPage = () => {
  const session = getStoredSession();
  const dashboardRole = roleSummaryMap[session.role];
  const { status, summary } = useDashboard(dashboardRole);
  const summaryEntries = Object.entries(summary || {});

  const metrics = summaryEntries
    .filter(([, value]) => typeof value === "number" || typeof value === "string")
    .slice(0, 6)
    .map(([key, value]) => {
      const numericValue = Number(value);
      const display =
        Number.isFinite(numericValue) && key.toLowerCase().includes("amount")
          ? formatCurrency(numericValue)
          : String(value);

      return {
        label: prettyLabel(key),
        value: display,
      };
    });

  const narrative = summaryEntries
    .filter(([, value]) => typeof value === "string")
    .slice(0, 3)
    .map(([key, value]) => ({
      title: prettyLabel(key),
      description: String(value),
    }));

  return (
    <>
      <Header subtitle={roleSubtitleMap[session.role]} title={roleTitleMap[session.role]} />

      {status === "loading" ? (
        <Loading fullscreen label="Loading workspace summary..." />
      ) : (
        <>
          <section className="hero-grid">
            <article className="theme-surface hero-card">
              <span className="eyebrow">Role</span>
              <h3>{session.role}</h3>
              <p className="page-subtitle">{roleSubtitleMap[session.role]}</p>
              <div className="inline-actions" style={{ marginTop: "1rem" }}>
                {roleLinksMap[session.role].map((item) => (
                  <Link className="nav-link" key={item.to} to={item.to}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </article>

            <article className="theme-surface hero-card">
              <span className="eyebrow">Snapshot</span>
              {metrics.length ? (
                <div className="stats-grid" style={{ marginTop: "1rem" }}>
                  {metrics.slice(0, 3).map((metric) => (
                    <div className="theme-kpi" key={metric.label}>
                      <span className="theme-caption">{metric.label}</span>
                      <span className="theme-stat">{metric.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  description="Backend summary data will populate here as role dashboards expand."
                  title="No summary metrics yet"
                />
              )}
            </article>
          </section>

          {metrics.length ? (
            <section className="stats-grid" style={{ marginTop: "2rem" }}>
              {metrics.map((metric) => (
                <article className="glass-panel metric-card" key={metric.label}>
                  <span className="status-badge">{metric.label}</span>
                  <div className="metric-value">{metric.value}</div>
                </article>
              ))}
            </section>
          ) : null}

          <section className="report-grid" style={{ marginTop: "2rem" }}>
            <article className="surface-panel activity-card">
              <h3>Operational narrative</h3>
              {narrative.length ? (
                <div className="stack-list">
                  {narrative.map((item) => (
                    <div key={item.title}>
                      <strong>{item.title}</strong>
                      <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  description="Narrative insights will appear once more dashboard reporting endpoints are exposed."
                  title="No narrative insights yet"
                />
              )}
            </article>

            <article className="theme-surface activity-card">
              <h3>Role-driven next steps</h3>
              <div className="stack-list">
                {roleLinksMap[session.role].map((item) => (
                  <Link className="nav-link" key={item.to} to={item.to}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </article>
          </section>
        </>
      )}
    </>
  );
};

export default DashboardPage;
