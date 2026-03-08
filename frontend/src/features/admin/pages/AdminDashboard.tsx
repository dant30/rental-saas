import Header from "../../../components/layout/Header";
import TenantManager from "../components/TenantManager";
import UserList from "../components/UserList";

const AdminDashboardPage = () => (
  <>
    <Header subtitle="Tenant provisioning and platform controls." title="Admin Dashboard" />
    <section className="report-grid">
      <TenantManager />
      <UserList />
    </section>
  </>
);

export default AdminDashboardPage;
