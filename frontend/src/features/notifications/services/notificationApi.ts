import { apiClient } from "../../../core/api/axios";
import { endpoints } from "../../../core/api/endpoints";
import { NotificationRecord } from "../types";

export const notificationApi = {
  list: () => apiClient<NotificationRecord[]>(endpoints.notifications),
  listPreferences: () => apiClient<Record<string, unknown>[]>(endpoints.preferences),
};
