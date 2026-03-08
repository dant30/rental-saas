import Card from "../../../components/shared/Card";
import { PropertyRecord } from "../types";

const PropertyCard = ({ property }: { property: PropertyRecord }) => (
  <Card>
    <h3>{property.name}</h3>
    <p style={{ color: "var(--text-secondary)" }}>{property.property_type}</p>
    <p style={{ color: "var(--text-secondary)" }}>{property.address || property.city || "Address pending"}</p>
  </Card>
);

export default PropertyCard;
