import { apiClient, authTokenStorage, AuthTokens } from "../../../core/api/axios";
import { endpoints } from "../../../core/api/endpoints";
import {
  LoginPayload,
  PasswordResetConfirmPayload,
  PasswordResetPayload,
  RegisterPayload,
  UserProfile,
} from "../types";

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
};
