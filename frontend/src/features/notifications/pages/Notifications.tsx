import Header from "../../../components/layout/Header";
import NotificationBell from "../components/NotificationBell";
import NotificationList from "../components/NotificationList";
import { useNotifications } from "../hooks/useNotifications";

const NotificationsPage = () => {
  const { items } = useNotifications();
  return (
    <>
      <Header subtitle="Backend-driven notification center with email, SMS, and WhatsApp support." title="Notifications" />
      <div style={{ marginBottom: "1rem" }}>
        <NotificationBell count={items.length} />
      </div>
      <NotificationList items={items} />
    </>
  );
};

export default NotificationsPage;
