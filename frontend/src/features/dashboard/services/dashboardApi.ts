import { apiClient } from "../../../core/api/axios";
import { endpoints } from "../../../core/api/endpoints";
import type { DashboardSummary } from "../store/dashboardSlice";

export const dashboardApi = {
  ownerSummary: () => apiClient<DashboardSummary>(endpoints.auth.ownerSummary),
  tenantSummary: () => apiClient<DashboardSummary>(endpoints.auth.tenantSummary),
  caretakerSummary: () => apiClient<DashboardSummary>(endpoints.auth.caretakerSummary),
};
