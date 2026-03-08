import { NotificationRecord } from "../types";

export interface NotificationsState {
  items: NotificationRecord[];
}

export const notificationsInitialState: NotificationsState = {
  items: [],
};
