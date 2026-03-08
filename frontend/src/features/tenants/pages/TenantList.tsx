import Header from "../../../components/layout/Header";
import TenantList from "../components/TenantList";
import { useTenants } from "../hooks/useTenants";

const TenantListPage = () => {
  const { items } = useTenants();
  return (
    <>
      <Header subtitle="Resident list from /api/tenants/residents/." title="Tenants" />
      <TenantList items={items} />
    </>
  );
};

export default TenantListPage;
