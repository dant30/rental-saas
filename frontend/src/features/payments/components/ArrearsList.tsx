import { formatCurrency, formatDate } from "../../../core/utils/formatters";
import { ArrearRecord } from "../types";

const ArrearsList = ({ items }: { items: ArrearRecord[] }) => (
  <div className="stack-list">
    {items.map((item) => (
      <article className="surface-panel route-card" key={item.id}>
        <h3>{formatCurrency(item.outstanding_amount)}</h3>
        <p style={{ color: "var(--text-secondary)" }}>Due {formatDate(item.due_date)}</p>
        <div className="status-badge status-badge--warning">{item.status}</div>
      </article>
    ))}
  </div>
);

export default ArrearsList;
