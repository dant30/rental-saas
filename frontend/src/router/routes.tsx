import { ReactNode } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import Button from "../components/shared/Button";
import { authTokenStorage } from "../core/api/axios";
import { routePaths } from "../core/constants/routePaths";
import { useToast } from "../core/contexts/ToastContext";
import AdminDashboardPage from "../features/admin/pages/AdminDashboard";
import ForgotPasswordPage from "../features/auth/pages/ForgotPassword";
import LoginPage from "../features/auth/pages/Login";
import RegisterPage from "../features/auth/pages/Register";
import CaretakerListPage from "../features/caretakers/pages/CaretakerList";
import DashboardPage from "../features/dashboard/pages/Dashboard";
import ExpenseFormPage from "../features/expenses/pages/ExpenseForm";
import ExpenseListPage from "../features/expenses/pages/ExpenseList";
import NotificationsPage from "../features/notifications/pages/Notifications";
import ArrearsPage from "../features/payments/pages/Arrears";
import PaymentListPage from "../features/payments/pages/PaymentList";
import PropertyDetailPage from "../features/properties/pages/PropertyDetail";
import PropertyListPage from "../features/properties/pages/PropertyList";
import TenantDetailPage from "../features/tenants/pages/TenantDetail";
import TenantListPage from "../features/tenants/pages/TenantList";
import AdminRoute from "./AdminRoute";
import FeatureGate from "./FeatureGate";
import PrivateRoute, { clearStoredSession, getStoredSession, saveStoredSession } from "./PrivateRoute";

const navItems = [
  { to: routePaths.dashboard, label: "Overview" },
  { to: routePaths.properties, label: "Properties" },
  { to: routePaths.tenants, label: "Tenants" },
  { to: routePaths.payments, label: "Payments" },
  { to: routePaths.arrears, label: "Arrears" },
  { to: routePaths.expenses, label: "Expenses" },
  { to: routePaths.notifications, label: "Notifications" },
  { to: routePaths.maintenance, label: "Maintenance" },
  { to: routePaths.admin, label: "Admin" },
];

const AppShell = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const session = getStoredSession();

  return (
    <MainLayout navItems={navItems}>
      <div className="page-header">
        <div>
          <span className="eyebrow">Workspace</span>
          <h1 className="page-title">Rental SaaS</h1>
          <p className="page-subtitle">
            Signed in as {session.name || session.email || session.role}. Routes below are backed by the Django APIs already built.
          </p>
        </div>
        <div className="inline-actions">
          <span className="status-badge status-badge--success">{session.role}</span>
          <Button
            onClick={() => {
              authTokenStorage.clear();
              clearStoredSession();
              saveStoredSession({
                isAuthenticated: false,
                role: "tenant",
                name: "",
                email: "",
                enabledFeatures: [],
              });
              pushToast("Signed out", "success");
              navigate(routePaths.login, { replace: true });
            }}
            type="button"
          >
            Sign out
          </Button>
        </div>
      </div>
      <div className="inline-actions" style={{ marginBottom: "1rem", flexWrap: "wrap" }}>
        {navItems.map((item) => (
          <NavLink className="nav-link" key={item.to} to={item.to}>
            {item.label}
          </NavLink>
        ))}
      </div>
      {children}
    </MainLayout>
  );
};

const TenantPortalPage = () => (
  <>
    <TenantListPage />
    <section style={{ marginTop: "2rem" }}>
      <ArrearsPage />
    </section>
  </>
);

const AppRoutes = () => {
  const session = getStoredSession();

  return (
    <Routes>
      <Route path={routePaths.root} element={<Navigate replace to={session.isAuthenticated ? routePaths.dashboard : routePaths.login} />} />
      <Route path={routePaths.login} element={<LoginPage />} />
      <Route path={routePaths.register} element={<RegisterPage />} />
      <Route path={routePaths.forgotPassword} element={<ForgotPasswordPage />} />

      <Route element={<PrivateRoute />}>
        <Route path={routePaths.dashboard} element={<AppShell><DashboardPage /></AppShell>} />
        <Route path={routePaths.properties} element={<AppShell><PropertyListPage /></AppShell>} />
        <Route path="/app/properties/:id" element={<AppShell><PropertyDetailPage /></AppShell>} />
        <Route path={routePaths.tenants} element={<AppShell><TenantListPage /></AppShell>} />
        <Route path="/app/tenants/:id" element={<AppShell><TenantDetailPage /></AppShell>} />
        <Route path={routePaths.payments} element={<AppShell><PaymentListPage /></AppShell>} />
        <Route path={routePaths.arrears} element={<AppShell><ArrearsPage /></AppShell>} />
        <Route path={routePaths.expenses} element={<AppShell><ExpenseListPage /></AppShell>} />
        <Route path="/app/expenses/new" element={<AppShell><ExpenseFormPage /></AppShell>} />
        <Route path={routePaths.notifications} element={<AppShell><NotificationsPage /></AppShell>} />
        <Route path={routePaths.maintenance} element={<AppShell><CaretakerListPage /></AppShell>} />
        <Route
          path={routePaths.tenantPortal}
          element={
            <FeatureGate feature="tenant_portal">
              <AppShell><TenantPortalPage /></AppShell>
            </FeatureGate>
          }
        />
      </Route>

      <Route element={<AdminRoute />}>
        <Route path={routePaths.admin} element={<AppShell><AdminDashboardPage /></AppShell>} />
      </Route>

      <Route path="*" element={<Navigate replace to={routePaths.root} />} />
    </Routes>
  );
};

export default AppRoutes;
