import { adminApi } from "../services/adminApi";

export const useAdmin = () => ({
  createTenant: adminApi.createTenant,
  ownerSummary: adminApi.ownerSummary,
});
