export const sessionStorageService = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") {
      return fallback;
    }
    let raw: string | null = null;
    try {
      raw = window.sessionStorage.getItem(key);
    } catch {
      return fallback;
    }
    if (!raw) {
      return fallback;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Storage can fail in private mode, quota overflow, or blocked contexts.
      }
    }
  },
  remove(key: string) {
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(key);
      } catch {
        // noop
      }
    }
  },
};
