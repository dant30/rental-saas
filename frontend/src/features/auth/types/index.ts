export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  user_type?: string;
  is_landlord?: boolean;
  is_owner?: boolean;
  is_caretaker?: boolean;
  is_tenant_user?: boolean;
  tenant?: number | null;
}

export type AuthUserType = "landlord" | "owner" | "tenant" | "caretaker" | "platform_admin";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  confirm_password?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  user_type?: AuthUserType;
}

export interface PasswordResetPayload {
  email: string;
}

export interface PasswordResetConfirmPayload {
  uid: string;
  token: string;
  new_password: string;
}

export interface AuthTokensResponse {
  access: string;
  refresh: string;
}

export interface AuthFormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  user_type?: string;
  general?: string;
}
