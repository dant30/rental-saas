import Card from "../../../components/shared/Card";
import { CaretakerRecord } from "../types";

const CaretakerCard = ({ caretaker }: { caretaker: CaretakerRecord }) => (
  <Card>
    <h3>{caretaker.employee_id || `Caretaker ${caretaker.id}`}</h3>
    <p style={{ color: "var(--text-secondary)" }}>{caretaker.skills || caretaker.phone_number}</p>
    <div className="status-badge">{caretaker.status || "active"}</div>
  </Card>
);

export default CaretakerCard;
