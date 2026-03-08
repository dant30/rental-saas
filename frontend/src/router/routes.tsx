import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import EmptyState from "../components/shared/EmptyState";
import Loading from "../components/shared/Loading";
import { routePaths } from "../core/constants/routePaths";
import { getStoredSession } from "./PrivateRoute";
import AdminDashboardPage from "../features/admin/pages/AdminDashboard";
import ForgotPasswordPage from "../features/auth/pages/ForgotPassword";
import LoginPage from "../features/auth/pages/Login";
import RegisterPage from "../features/auth/pages/Register";
import CaretakerCreatePage from "../features/caretakers/pages/CaretakerCreate";
import CaretakerDetailPage from "../features/caretakers/pages/CaretakerDetail";
import CaretakerListPage from "../features/caretakers/pages/CaretakerList";
import DashboardPage from "../features/dashboard/pages/Dashboard";
import ExpenseCreatePage from "../features/expenses/pages/ExpenseForm";
import ExpenseListPage from "../features/expenses/pages/ExpenseList";
import NotificationsPage from "../features/notifications/pages/Notifications";
import ArrearsPage from "../features/payments/pages/Arrears";
import PaymentListPage from "../features/payments/pages/PaymentList";
import PropertyCreatePage from "../features/properties/pages/PropertyCreate";
import PropertyDetailPage from "../features/properties/pages/PropertyDetail";
import PropertyListPage from "../features/properties/pages/PropertyList";
import TenantDetailPage from "../features/tenants/pages/TenantDetail";
import TenantListPage from "../features/tenants/pages/TenantList";
import { useDashboard } from "../features/dashboard/hooks/useDashboard";
import AdminRoute from "./AdminRoute";
import FeatureGate from "./FeatureGate";
import PrivateRoute from "./PrivateRoute";

const navItems = [
  { to: routePaths.dashboard, label: "Overview" },
  {
    label: "Portfolio",
    children: [
      { to: routePaths.properties, label: "Properties" },
      { to: routePaths.propertiesNew, label: "Add property" },
      { to: routePaths.tenants, label: "Tenants" },
      { to: routePaths.tenantsNew, label: "Add tenant" },
    ],
  },
  {
    label: "Finance",
    children: [
      { to: routePaths.payments, label: "Payments" },
      { to: routePaths.arrears, label: "Arrears" },
      { to: routePaths.expenses, label: "Expenses" },
      { to: routePaths.expensesNew, label: "Add expense" },
    ],
  },
  { to: routePaths.notifications, label: "Notifications" },
  { to: routePaths.maintenance, label: "Maintenance" },
  { to: routePaths.admin, label: "Admin" },
];

const AppShell = ({ children }: { children: ReactNode }) => (
  <MainLayout navItems={navItems}>{children}</MainLayout>
);

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

const TenantPortalPage = () => {
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

const AppRoutes = () => {
  const session = getStoredSession();

  return (
    <Routes>
      <Route
        element={
          <Navigate
            replace
            to={session.isAuthenticated ? routePaths.dashboard : routePaths.login}
          />
        }
        path={routePaths.root}
      />
      <Route element={<LoginPage />} path={routePaths.login} />
      <Route element={<RegisterPage />} path={routePaths.register} />
      <Route element={<ForgotPasswordPage />} path={routePaths.forgotPassword} />

      <Route element={<PrivateRoute />}>
        <Route element={<AppShell><DashboardPage /></AppShell>} path={routePaths.dashboard} />
        <Route element={<AppShell><PropertyListPage /></AppShell>} path={routePaths.properties} />
        <Route element={<AppShell><PropertyCreatePage /></AppShell>} path={routePaths.propertiesNew} />
        <Route element={<AppShell><PropertyDetailPage /></AppShell>} path="/app/properties/:id" />
        <Route element={<AppShell><TenantListPage /></AppShell>} path={routePaths.tenants} />
        <Route element={<AppShell><TenantDetailPage /></AppShell>} path={routePaths.tenantsNew} />
        <Route element={<AppShell><TenantDetailPage /></AppShell>} path="/app/tenants/:id" />
        <Route element={<AppShell><PaymentListPage /></AppShell>} path={routePaths.payments} />
        <Route element={<AppShell><ArrearsPage /></AppShell>} path={routePaths.arrears} />
        <Route element={<AppShell><ExpenseListPage /></AppShell>} path={routePaths.expenses} />
        <Route element={<AppShell><ExpenseCreatePage /></AppShell>} path={routePaths.expensesNew} />
        <Route element={<AppShell><NotificationsPage /></AppShell>} path={routePaths.notifications} />
        <Route element={<AppShell><CaretakerListPage /></AppShell>} path={routePaths.maintenance} />
        <Route element={<AppShell><CaretakerCreatePage /></AppShell>} path={routePaths.maintenanceNew} />
        <Route element={<AppShell><CaretakerDetailPage /></AppShell>} path="/app/maintenance/:id" />
        <Route
          element={
            <FeatureGate feature="tenant_portal">
              <AppShell>
                <TenantPortalPage />
              </AppShell>
            </FeatureGate>
          }
          path={routePaths.tenantPortal}
        />
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AppShell><AdminDashboardPage /></AppShell>} path={routePaths.admin} />
      </Route>

      <Route element={<Navigate replace to={routePaths.root} />} path="*" />
    </Routes>
  );
};

export default AppRoutes;
