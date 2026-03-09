import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import Loading from "../components/shared/Loading";
import { routePaths } from "../core/constants/routePaths";
import { getStoredSession } from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import FeatureGate from "./FeatureGate";
import PrivateRoute from "./PrivateRoute";

const AdminDashboardPage = lazy(() => import("../features/admin/pages/AdminDashboard"));
const ForgotPasswordPage = lazy(() => import("../features/auth/pages/ForgotPassword"));
const LoginPage = lazy(() => import("../features/auth/pages/Login"));
const RegisterPage = lazy(() => import("../features/auth/pages/Register"));
const CaretakerCreatePage = lazy(() => import("../features/caretakers/pages/CaretakerCreate"));
const CaretakerDetailPage = lazy(() => import("../features/caretakers/pages/CaretakerDetail"));
const CaretakerListPage = lazy(() => import("../features/caretakers/pages/CaretakerList"));
const DashboardPage = lazy(() => import("../features/dashboard/pages/Dashboard"));
const ExpenseCreatePage = lazy(() => import("../features/expenses/pages/ExpenseForm"));
const ExpenseListPage = lazy(() => import("../features/expenses/pages/ExpenseList"));
const NotificationsPage = lazy(() => import("../features/notifications/pages/Notifications"));
const ArrearsPage = lazy(() => import("../features/payments/pages/Arrears"));
const PaymentListPage = lazy(() => import("../features/payments/pages/PaymentList"));
const PropertyCreatePage = lazy(() => import("../features/properties/pages/PropertyCreate"));
const PropertyDetailPage = lazy(() => import("../features/properties/pages/PropertyDetail"));
const PropertyListPage = lazy(() => import("../features/properties/pages/PropertyList"));
const TenantDetailPage = lazy(() => import("../features/tenants/pages/TenantDetail"));
const TenantListPage = lazy(() => import("../features/tenants/pages/TenantList"));
const RolePortalPage = lazy(() => import("../features/tenant-portal/pages/RolePortalPage"));

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

const renderWithSuspense = (content: ReactNode) => (
  <Suspense fallback={<Loading label="Loading page..." />}>
    {content}
  </Suspense>
);

const renderInShell = (content: ReactNode) => <AppShell>{renderWithSuspense(content)}</AppShell>;

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
      <Route element={renderWithSuspense(<LoginPage />)} path={routePaths.login} />
      <Route element={renderWithSuspense(<RegisterPage />)} path={routePaths.register} />
      <Route element={renderWithSuspense(<ForgotPasswordPage />)} path={routePaths.forgotPassword} />

      <Route element={<PrivateRoute />}>
        <Route element={renderInShell(<DashboardPage />)} path={routePaths.dashboard} />
        <Route element={renderInShell(<PropertyListPage />)} path={routePaths.properties} />
        <Route element={renderInShell(<PropertyCreatePage />)} path={routePaths.propertiesNew} />
        <Route element={renderInShell(<PropertyDetailPage />)} path="/app/properties/:id" />
        <Route element={renderInShell(<TenantListPage />)} path={routePaths.tenants} />
        <Route element={renderInShell(<TenantDetailPage />)} path={routePaths.tenantsNew} />
        <Route element={renderInShell(<TenantDetailPage />)} path="/app/tenants/:id" />
        <Route element={renderInShell(<PaymentListPage />)} path={routePaths.payments} />
        <Route element={renderInShell(<ArrearsPage />)} path={routePaths.arrears} />
        <Route element={renderInShell(<ExpenseListPage />)} path={routePaths.expenses} />
        <Route element={renderInShell(<ExpenseCreatePage />)} path={routePaths.expensesNew} />
        <Route element={renderInShell(<NotificationsPage />)} path={routePaths.notifications} />
        <Route element={renderInShell(<CaretakerListPage />)} path={routePaths.maintenance} />
        <Route element={renderInShell(<CaretakerCreatePage />)} path={routePaths.maintenanceNew} />
        <Route element={renderInShell(<CaretakerDetailPage />)} path="/app/maintenance/:id" />
        <Route
          element={
            <FeatureGate feature="tenant_portal">
              {renderInShell(<RolePortalPage />)}
            </FeatureGate>
          }
          path={routePaths.tenantPortal}
        />
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={renderInShell(<AdminDashboardPage />)} path={routePaths.admin} />
      </Route>

      <Route element={<Navigate replace to={routePaths.root} />} path="*" />
    </Routes>
  );
};

export default AppRoutes;
