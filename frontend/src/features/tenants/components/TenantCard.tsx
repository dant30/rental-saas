import Card from "../../../components/shared/Card";
import { TenantResident } from "../types";

const TenantCard = ({ tenant }: { tenant: TenantResident }) => (
  <Card>
    <h3>{tenant.user?.username || `Resident ${tenant.id}`}</h3>
    <p style={{ color: "var(--text-secondary)" }}>{tenant.user?.email || tenant.phone_number}</p>
    <div className="status-badge">{tenant.status || "active"}</div>
  </Card>
);

export default TenantCard;
