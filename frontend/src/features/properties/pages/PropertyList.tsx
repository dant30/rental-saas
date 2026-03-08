import Header from "../../../components/layout/Header";
import PropertyList from "../components/PropertyList";
import { useProperties } from "../hooks/useProperties";

const PropertyListPage = () => {
  const { items } = useProperties();
  return (
    <>
      <Header subtitle="Pulled from /api/properties/." title="Properties" />
      <PropertyList items={items} />
    </>
  );
};

export default PropertyListPage;
