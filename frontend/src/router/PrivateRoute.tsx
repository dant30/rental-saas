import { Navigate, Outlet, useLocation } from "react-router-dom";

export type AppRole = "admin" | "landlord" | "owner" | "caretaker" | "tenant";

export interface AuthSession {
  isAuthenticated: boolean;
  role: AppRole;
  name: string;
  email: string;
  enabledFeatures: string[];
}

const AUTH_STORAGE_KEY = "rental_saas_auth";

export const getStoredSession = (): AuthSession => {
  if (typeof window === "undefined") {
    return {
      isAuthenticated: false,
      role: "tenant",
      name: "",
      email: "",
      enabledFeatures: [],
    };
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return {
      isAuthenticated: false,
      role: "tenant",
      name: "",
      email: "",
      enabledFeatures: [],
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    return {
      isAuthenticated: Boolean(parsed.isAuthenticated),
      role: (parsed.role as AppRole) || "tenant",
      name: parsed.name || "",
      email: parsed.email || "",
      enabledFeatures: parsed.enabledFeatures || [],
    };
  } catch {
    return {
      isAuthenticated: false,
      role: "tenant",
      name: "",
      email: "",
      enabledFeatures: [],
    };
  }
};

export const saveStoredSession = (session: AuthSession) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
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
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
