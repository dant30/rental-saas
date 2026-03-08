import { ActivityItem } from "../types";

const RecentActivity = ({ items }: { items: ActivityItem[] }) => (
  <article className="surface-panel activity-card">
    <h3>Recent Activity</h3>
    <div className="stack-list">
      {items.map((item) => (
        <div key={item.title}>
          <strong>{item.title}</strong>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>{item.description}</p>
        </div>
      ))}
    </div>
  </article>
);

export default RecentActivity;
