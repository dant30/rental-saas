import { TenantResident } from "../types";
import TenantCard from "./TenantCard";

const TenantList = ({ items }: { items: TenantResident[] }) => (
  <section className="list-grid">
    {items.map((item) => (
      <TenantCard key={item.id} tenant={item} />
    ))}
  </section>
);

export default TenantList;
