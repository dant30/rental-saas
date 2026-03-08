import { useEffect, useState } from "react";

import { authTokenStorage } from "../../../core/api/axios";
import { handleError } from "../../../core/utils/errorHandler";
import { authApi } from "../services/authApi";
import { authInitialState, AuthState } from "../store/authSlice";

export const useAuth = () => {
  const [state, setState] = useState<AuthState>(authInitialState);

  const refreshProfile = async () => {
    if (!authTokenStorage.get()?.access) {
      setState(authInitialState);
      return null;
    }
    setState((current) => ({ ...current, status: "loading", error: null }));
    try {
      const user = await authApi.me();
      setState({ user, status: "authenticated", error: null });
      return user;
    } catch (error) {
      authTokenStorage.clear();
      setState({ user: null, status: "error", error: handleError(error) });
      return null;
    }
  };

  useEffect(() => {
    void refreshProfile();
  }, []);

  return {
    ...state,
    login: authApi.login,
    register: authApi.register,
    logout: async () => {
      const refresh = authTokenStorage.get()?.refresh;
      if (refresh) {
        await authApi.logout(refresh);
      }
      authTokenStorage.clear();
      setState(authInitialState);
    },
    requestPasswordReset: authApi.requestPasswordReset,
    confirmPasswordReset: authApi.confirmPasswordReset,
    refreshProfile,
  };
};
