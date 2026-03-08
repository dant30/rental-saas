import { useDeferredValue, useState } from "react";

import Header from "../../../components/layout/Header";
import EmptyState from "../../../components/shared/EmptyState";
import Input from "../../../components/shared/Input";
import NotificationBell from "../components/NotificationBell";
import NotificationList from "../components/NotificationList";
import { useNotifications } from "../hooks/useNotifications";

const NotificationsPage = () => {
  const { items } = useNotifications();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredItems = items.filter((item) =>
    [item.subject, item.content, item.channel, item.notification_type]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(deferredQuery.toLowerCase()),
  );

  const unread = items.filter((item) => !item.is_read).length;
  const channels = new Set(items.map((item) => item.channel).filter(Boolean)).size;

  return (
    <>
      <Header
        subtitle="Backend-driven notification center with email, SMS, and WhatsApp support."
        title="Notifications"
      />

      <section className="stats-grid">
        <article className="theme-kpi">
          <span className="theme-caption">Inbox size</span>
          <span className="theme-stat">{items.length}</span>
        </article>
        <article className="theme-kpi">
          <span className="theme-caption">Unread</span>
          <span className="theme-stat">{unread}</span>
        </article>
        <article className="theme-kpi">
          <span className="theme-caption">Channels</span>
          <span className="theme-stat">{channels}</span>
        </article>
      </section>

      <div style={{ marginBottom: "1rem", marginTop: "2rem" }}>
        <NotificationBell count={unread} />
      </div>

      <section className="theme-surface activity-card">
        <h3 className="theme-title">Notification center</h3>
        <p className="theme-subtitle">Search by subject, content, channel, or delivery type.</p>
        <div style={{ marginTop: "1rem" }}>
          <Input
            label="Search notifications"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by subject, content, channel, or type"
            value={query}
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          {filteredItems.length ? (
            <NotificationList items={filteredItems} />
          ) : (
            <EmptyState
              description="Try a different search term or wait for new activity."
              title="No notifications match this view"
            />
          )}
        </div>
      </section>
    </>
  );
};

export default NotificationsPage;
