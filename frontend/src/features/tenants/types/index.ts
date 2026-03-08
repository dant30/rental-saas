export interface TenantResident {
  id: number;
  user?: {
    username?: string;
    email?: string;
  };
  phone_number?: string;
  status?: string;
}
