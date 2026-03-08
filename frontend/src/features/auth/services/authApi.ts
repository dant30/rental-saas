import { apiClient, authTokenStorage, AuthTokens } from "../../../core/api/axios";
import { endpoints } from "../../../core/api/endpoints";
import { AppRole, AuthSession, saveStoredSession } from "../../../router/PrivateRoute";
import {
  LoginPayload,
  PasswordResetConfirmPayload,
  PasswordResetPayload,
  RegisterPayload,
  UserProfile,
} from "../types";

const resolveRole = (profile: UserProfile): AppRole => {
  if (profile.is_caretaker) {
    return "caretaker";
  }
  if (profile.is_owner) {
    return "owner";
  }
  if (profile.is_landlord) {
    return "landlord";
  }
  if (profile.user_type === "platform_admin") {
    return "admin";
  }
  return "tenant";
};

const roleFeatureMap: Record<AppRole, string[]> = {
  admin: ["financial_reports", "maintenance_console", "messaging", "tenant_portal", "admin_console"],
  landlord: ["financial_reports", "maintenance_console", "messaging", "tenant_portal", "admin_console"],
  owner: ["financial_reports", "messaging", "admin_console"],
  caretaker: ["maintenance_console", "messaging"],
  tenant: ["tenant_portal", "messaging"],
};

export const buildSessionFromProfile = (profile: UserProfile): AuthSession => {
  const role = resolveRole(profile);
  return {
    isAuthenticated: true,
    role,
    name: [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || profile.username,
    email: profile.email,
    enabledFeatures: roleFeatureMap[role],
  };
};

export const authApi = {
  async login(payload: LoginPayload) {
    const tokens = await apiClient<AuthTokens>(endpoints.auth.login, {
      method: "POST",
      body: payload,
    });
    authTokenStorage.set(tokens);
    return tokens;
  },
  register: (payload: RegisterPayload) =>
    apiClient<UserProfile>(endpoints.auth.register, { method: "POST", body: payload }),
  me: () => apiClient<UserProfile>(endpoints.auth.me),
  logout: (refresh: string) =>
    apiClient<void>(endpoints.auth.logout, { method: "POST", body: { refresh } }),
  requestPasswordReset: (payload: PasswordResetPayload) =>
    apiClient<{ detail: string }>(endpoints.auth.passwordReset, { method: "POST", body: payload }),
  confirmPasswordReset: (payload: PasswordResetConfirmPayload) =>
    apiClient<{ detail: string }>(endpoints.auth.passwordResetConfirm, { method: "POST", body: payload }),
  async hydrateSession() {
    const profile = await authApi.me();
    const session = buildSessionFromProfile(profile);
    saveStoredSession(session);
    return { profile, session };
  },
};
