import { apiClient } from "../../../core/api/axios";
import { endpoints } from "../../../core/api/endpoints";

export const dashboardApi = {
  ownerSummary: () => apiClient<Record<string, unknown>>(endpoints.auth.ownerSummary),
  tenantSummary: () => apiClient<Record<string, unknown>>(endpoints.auth.tenantSummary),
  caretakerSummary: () => apiClient<Record<string, unknown>>(endpoints.auth.caretakerSummary),
};
