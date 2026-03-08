import PropertyCard from "./PropertyCard";
import { PropertyRecord } from "../types";

const PropertyList = ({ items }: { items: PropertyRecord[] }) => (
  <section className="list-grid">
    {items.map((item) => (
      <PropertyCard key={item.id} property={item} />
    ))}
  </section>
);

export default PropertyList;
