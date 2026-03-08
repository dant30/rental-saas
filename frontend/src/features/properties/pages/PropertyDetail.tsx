import { useMemo } from "react";
import { useParams } from "react-router-dom";

import Header from "../../../components/layout/Header";
import EmptyState from "../../../components/shared/EmptyState";
import Loading from "../../../components/shared/Loading";
import PropertyForm from "../components/PropertyForm";
import { useProperty } from "../hooks/useProperty";

const PropertyDetailPage = () => {
  const { id } = useParams();
  const { property, status, error } = useProperty(id);

  const title = useMemo(() => {
    if (status === "loading") return "Loading property...";
    if (property) return `Property: ${property.name}`;
    return "Property detail";
  }, [property, status]);

  return (
    <>
      <Header subtitle="Edit or update a property in your portfolio." title={title} />

      {status === "loading" ? (
        <Loading label="Loading property details..." />
      ) : error ? (
        <EmptyState
          description={error}
          title="Could not load property"
        />
      ) : property ? (
        <PropertyForm initial={property} />
      ) : (
        <EmptyState
          description="Select a property from the list to edit or create a new one."
          title="No property selected"
        />
      )}
    </>
  );
};

export default PropertyDetailPage;
