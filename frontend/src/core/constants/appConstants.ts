const normalizeBaseUrl = (value: string) => value.trim().replace(/\/+$/, "");

const toBoolean = (value: string | undefined, fallback = false) => {
  if (!value) {
    return fallback;
  }
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
};

export const APP_NAME = (import.meta.env.VITE_APP_NAME || "Rental SaaS").trim();
export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
);
export const WS_BASE_URL = API_BASE_URL.replace(/^http/i, "ws").replace(/\/api$/, "");
export const ENABLE_MESSAGING = toBoolean(import.meta.env.VITE_ENABLE_MESSAGING);
