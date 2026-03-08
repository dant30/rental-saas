import { apiClient } from "../../../core/api/axios";
import { endpoints } from "../../../core/api/endpoints";
import { TenantResident } from "../types";

export const tenantApi = {
  listResidents: () => apiClient<TenantResident[]>(endpoints.tenants),
  detail: (id: number) => apiClient<TenantResident>(`${endpoints.tenants}${id}/`),
  create: (body: Partial<TenantResident>) => apiClient<TenantResident>(endpoints.tenants, { method: "POST", body }),
  update: (id: number, body: Partial<TenantResident>) =>
    apiClient<TenantResident>(`${endpoints.tenants}${id}/`, { method: "PATCH", body }),
};
