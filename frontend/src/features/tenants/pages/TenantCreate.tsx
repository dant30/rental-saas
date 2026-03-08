import Header from "../../../components/layout/Header";

import TenantForm from "../components/TenantForm";

const TenantCreatePage = () => (
  <>
    <Header subtitle="Add a new resident to the roster." title="New Resident" />
    <TenantForm />
  </>
);

export default TenantCreatePage;
