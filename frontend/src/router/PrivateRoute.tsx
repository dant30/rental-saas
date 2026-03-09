import { Navigate, Outlet, useLocation } from "react-router-dom";

import { routePaths } from "../core/constants/routePaths";

export type AppRole = "admin" | "landlord" | "owner" | "caretaker" | "tenant";

export interface AuthSession {
  isAuthenticated: boolean;
  role: AppRole;
  name: string;
  email: string;
  enabledFeatures: string[];
}

export const AUTH_STORAGE_KEY = "rental_saas_auth";

const DEFAULT_AUTH_SESSION: AuthSession = {
  isAuthenticated: false,
  role: "tenant",
  name: "",
  email: "",
  enabledFeatures: [],
};

const validRoles: AppRole[] = ["admin", "landlord", "owner", "caretaker", "tenant"];

const sanitizeSession = (session: Partial<AuthSession>): AuthSession => ({
  isAuthenticated: Boolean(session.isAuthenticated),
  role: validRoles.includes(session.role as AppRole) ? (session.role as AppRole) : "tenant",
  name: typeof session.name === "string" ? session.name : "",
  email: typeof session.email === "string" ? session.email : "",
  enabledFeatures: Array.isArray(session.enabledFeatures)
    ? session.enabledFeatures.filter((feature): feature is string => typeof feature === "string")
    : [],
});

export const getStoredSession = (): AuthSession => {
  if (typeof window === "undefined") {
    return DEFAULT_AUTH_SESSION;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_AUTH_SESSION;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    return sanitizeSession(parsed);
  } catch {
    return DEFAULT_AUTH_SESSION;
  }
};

export const saveStoredSession = (session: AuthSession) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sanitizeSession(session)));
  }
};

export const clearStoredSession = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

const PrivateRoute = () => {
  const session = getStoredSession();
  const location = useLocation();

  if (!session.isAuthenticated) {
    return <Navigate replace state={{ from: location.pathname }} to={routePaths.login} />;
  }

  return <Outlet />;
};

export default PrivateRoute;
