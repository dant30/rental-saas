const NotificationBell = ({ count }: { count: number }) => (
  <div className={`status-badge${count ? " status-badge--warning" : ""}`}>Notifications {count}</div>
);

export default NotificationBell;
