import { NotificationRecord } from "../types";

const NotificationList = ({ items }: { items: NotificationRecord[] }) => (
  <div className="stack-list">
    {items.map((item) => (
      <article className="surface-panel route-card" key={item.id}>
        <h3>{item.subject || item.notification_type}</h3>
        <p style={{ color: "var(--text-secondary)" }}>{item.content}</p>
        <div className="inline-actions">
          <span className="status-badge">{item.channel}</span>
          <span className={`status-badge${item.is_read ? "" : " status-badge--warning"}`}>
            {item.is_read ? "Read" : "Unread"}
          </span>
        </div>
      </article>
    ))}
  </div>
);

export default NotificationList;
