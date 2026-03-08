import { apiClient } from "../../../core/api/axios";
import { endpoints } from "../../../core/api/endpoints";
import { TenantResident } from "../types";

export const tenantApi = {
  listResidents: () => apiClient<TenantResident[]>(endpoints.tenants),
};
