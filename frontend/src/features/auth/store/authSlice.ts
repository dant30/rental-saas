import { UserProfile } from "../types";

export type AuthStatus = "idle" | "loading" | "authenticated" | "error";

export interface AuthState {
  user: UserProfile | null;
  status: AuthStatus;
  error: string | null;
}

export const authInitialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

type AuthListener = () => void;

let authState: AuthState = authInitialState;
const listeners = new Set<AuthListener>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

export const authStore = {
  getState: () => authState,
  subscribe: (listener: AuthListener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setLoading: () => {
    authState = { ...authState, status: "loading", error: null };
    emit();
  },
  setAuthenticated: (user: UserProfile) => {
    authState = { user, status: "authenticated", error: null };
    emit();
  },
  setError: (error: string) => {
    authState = { user: null, status: "error", error };
    emit();
  },
  reset: () => {
    authState = authInitialState;
    emit();
  },
};
