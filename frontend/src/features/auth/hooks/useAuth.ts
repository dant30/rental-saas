import { useCallback, useEffect, useState } from "react";

import { authTokenStorage } from "../../../core/api/axios";
import { handleError } from "../../../core/utils/errorHandler";
import { clearStoredSession } from "../../../router/PrivateRoute";
import { authApi } from "../services/authApi";
import { authInitialState, AuthState } from "../store/authSlice";

export const useAuth = () => {
  const [state, setState] = useState<AuthState>(authInitialState);

  const refreshProfile = useCallback(async () => {
    if (!authTokenStorage.get()?.access) {
      setState(authInitialState);
      return null;
    }
    setState((current) => ({ ...current, status: "loading", error: null }));
    try {
      const { profile } = await authApi.hydrateSession();
      const user = profile;
      setState({ user, status: "authenticated", error: null });
      return user;
    } catch (error) {
      authTokenStorage.clear();
      clearStoredSession();
      setState({ user: null, status: "error", error: handleError(error) });
      return null;
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  return {
    ...state,
    login: async (payload: Parameters<typeof authApi.login>[0]) => {
      await authApi.login(payload);
      return refreshProfile();
    },
    register: authApi.register,
    logout: async () => {
      const refresh = authTokenStorage.get()?.refresh;
      if (refresh) {
        await authApi.logout(refresh);
      }
      authTokenStorage.clear();
      clearStoredSession();
      setState(authInitialState);
    },
    requestPasswordReset: authApi.requestPasswordReset,
    confirmPasswordReset: authApi.confirmPasswordReset,
    refreshProfile,
  };
};
