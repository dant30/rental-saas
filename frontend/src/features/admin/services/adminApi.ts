import { apiClient } from "../../../core/api/axios";
import { endpoints } from "../../../core/api/endpoints";
import { TenantSignupPayload } from "../types";

export const adminApi = {
  createTenant: (payload: TenantSignupPayload) => apiClient<Record<string, unknown>>("/tenants/signup/", { method: "POST", body: payload }),
  ownerSummary: () => apiClient<Record<string, unknown>>(endpoints.auth.ownerSummary),
};
