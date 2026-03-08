import { apiClient } from "../../../core/api/axios";
import { endpoints } from "../../../core/api/endpoints";
import { PropertyRecord } from "../types";

export const propertyApi = {
  list: () => apiClient<PropertyRecord[]>(endpoints.properties),
  detail: (id: number) => apiClient<PropertyRecord>(`${endpoints.properties}${id}/`),
};
