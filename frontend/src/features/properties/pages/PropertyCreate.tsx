import Header from "../../../components/layout/Header";

import PropertyForm from "../components/PropertyForm";

const PropertyCreatePage = () => (
  <>
    <Header subtitle="Add a new property to your portfolio." title="New Property" />
    <PropertyForm />
  </>
);

export default PropertyCreatePage;
