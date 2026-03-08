import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import { routePaths } from "../core/constants/routePaths";
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
import PrivateRoute, { getStoredSession } from "./PrivateRoute";

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

const AppShell = ({ children }: { children: ReactNode }) => (
  <MainLayout navItems={navItems}>{children}</MainLayout>
);

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
        <Route element={<AppShell><PropertyDetailPage /></AppShell>} path="/app/properties/:id" />
        <Route element={<AppShell><TenantListPage /></AppShell>} path={routePaths.tenants} />
        <Route element={<AppShell><TenantDetailPage /></AppShell>} path="/app/tenants/:id" />
        <Route element={<AppShell><PaymentListPage /></AppShell>} path={routePaths.payments} />
        <Route element={<AppShell><ArrearsPage /></AppShell>} path={routePaths.arrears} />
        <Route element={<AppShell><ExpenseListPage /></AppShell>} path={routePaths.expenses} />
        <Route element={<AppShell><ExpenseFormPage /></AppShell>} path="/app/expenses/new" />
        <Route element={<AppShell><NotificationsPage /></AppShell>} path={routePaths.notifications} />
        <Route element={<AppShell><CaretakerListPage /></AppShell>} path={routePaths.maintenance} />
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
