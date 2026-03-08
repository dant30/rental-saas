import { TenantResident } from "../types";

export interface TenantsState {
  items: TenantResident[];
  status: "idle" | "loading" | "success" | "error";
}

export const tenantsInitialState: TenantsState = {
  items: [],
  status: "idle",
};
