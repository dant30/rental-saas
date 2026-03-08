export interface NotificationRecord {
  id: number;
  subject: string;
  content: string;
  channel: string;
  notification_type: string;
  is_read: boolean;
}
