export const APP_NAME = import.meta.env.VITE_APP_NAME || "Rental SaaS";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws").replace(/\/api$/, "");
export const ENABLE_MESSAGING = import.meta.env.VITE_ENABLE_MESSAGING === "true";
