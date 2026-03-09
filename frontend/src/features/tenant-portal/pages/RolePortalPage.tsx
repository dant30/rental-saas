import { Link } from "react-router-dom";

import EmptyState from "../../../components/shared/EmptyState";
import Loading from "../../../components/shared/Loading";
import { routePaths } from "../../../core/constants/routePaths";
import { useDashboard } from "../../dashboard/hooks/useDashboard";
import { getStoredSession } from "../../../router/PrivateRoute";

const portalConfig = {
  admin: {
    title: "Admin portal",
    subtitle: "Platform-wide controls, provisioning, and operational oversight.",
    links: [
      { label: "Admin dashboard", to: routePaths.admin },
      { label: "Notifications", to: routePaths.notifications },
      { label: "Payments", to: routePaths.payments },
    ],
  },
  landlord: {
    title: "Landlord portal",
    subtitle: "Portfolio visibility, tenant health, and cash collection in one place.",
    links: [
      { label: "Properties", to: routePaths.properties },
      { label: "Tenants", to: routePaths.tenants },
      { label: "Arrears", to: routePaths.arrears },
    ],
  },
  owner: {
    title: "Owner portal",
    subtitle: "Financial and occupancy visibility across the active portfolio.",
    links: [
      { label: "Payments", to: routePaths.payments },
      { label: "Expenses", to: routePaths.expenses },
      { label: "Properties", to: routePaths.properties },
    ],
  },
  caretaker: {
    title: "Caretaker portal",
    subtitle: "Maintenance response, task visibility, and resident communication.",
    links: [
      { label: "Maintenance", to: routePaths.maintenance },
      { label: "Notifications", to: routePaths.notifications },
      { label: "Dashboard", to: routePaths.dashboard },
    ],
  },
  tenant: {
    title: "Resident portal",
    subtitle: "Invoices, payments, and support updates tailored for active residents.",
    links: [
      { label: "Payments", to: routePaths.payments },
      { label: "Arrears", to: routePaths.arrears },
      { label: "Notifications", to: routePaths.notifications },
    ],
  },
} as const;

const roleSummaryMap = {
  admin: "owner",
  landlord: "owner",
  owner: "owner",
  caretaker: "caretaker",
  tenant: "tenant",
} as const;

const RolePortalPage = () => {
  const session = getStoredSession();
  const config = portalConfig[session.role];
  const { status, summary } = useDashboard(roleSummaryMap[session.role]);
  const summaryRows = Object.entries(summary || {}).slice(0, 6);

  return (
    <>
      <section className="page-header">
        <div>
          <span className="eyebrow">Portal</span>
          <h1 className="page-title">{config.title}</h1>
          <p className="page-subtitle">{config.subtitle}</p>
        </div>
      </section>

      <section className="hero-grid">
        <article className="theme-surface hero-card">
          <h3>Quick access</h3>
          <div className="stack-list mt-4">
            {config.links.map((item) => (
              <Link className="nav-link" key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>
        </article>

        <article className="theme-surface hero-card">
          <h3>Live summary</h3>
          {status === "loading" ? (
            <Loading label="Loading portal summary..." />
          ) : summaryRows.length ? (
            <div className="stack-list mt-4">
              {summaryRows.map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4">
                  <span className="theme-caption">{key.replace(/_/g, " ")}</span>
                  <strong>{String(value)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              description="This portal will expand as additional role-specific endpoints are connected."
              title="No role summary available yet"
            />
          )}
        </article>
      </section>

      <section className="report-grid mt-8">
        <article className="surface-panel activity-card">
          <h3>Recommended focus</h3>
          <p className="theme-subtitle">
            Use this portal as the role-specific starting point for daily activity.
          </p>
          <div className="stack-list mt-4">
            {config.links.map((item) => (
              <Link className="nav-link" key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>
        </article>
        <article className="surface-panel activity-card">
          <h3>Portal status</h3>
          <p className="theme-subtitle">
            Role-aware landing is live. Deeper role-specific workflows can now be layered page by page.
          </p>
        </article>
      </section>
    </>
  );
};

export default RolePortalPage;
