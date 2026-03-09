import { useCallback, useEffect, useSyncExternalStore } from "react";

import { authTokenStorage } from "../../../core/api/axios";
import { handleError } from "../../../core/utils/errorHandler";
import { clearStoredSession } from "../../../router/PrivateRoute";
import { authApi } from "../services/authApi";
import { authStore } from "../store/authSlice";

let hydrationPromise: Promise<unknown> | null = null;

export const useAuth = () => {
  const state = useSyncExternalStore(authStore.subscribe, authStore.getState, authStore.getState);

  const refreshProfile = useCallback(async () => {
    if (!authTokenStorage.get()?.access) {
      authStore.reset();
      return null;
    }

    authStore.setLoading();

    try {
      const { profile } = await authApi.hydrateSession();
      authStore.setAuthenticated(profile);
      return profile;
    } catch (error) {
      authTokenStorage.clear();
      clearStoredSession();
      authStore.setError(handleError(error));
      return null;
    }
  }, []);

  useEffect(() => {
    if (!hydrationPromise) {
      hydrationPromise = refreshProfile().finally(() => {
        hydrationPromise = null;
      });
    }
  }, [refreshProfile]);

  return {
    ...state,
    login: async (payload: Parameters<typeof authApi.login>[0]) => {
      authStore.setLoading();
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
      authStore.reset();
    },
    requestPasswordReset: authApi.requestPasswordReset,
    confirmPasswordReset: authApi.confirmPasswordReset,
    refreshProfile,
  };
};
