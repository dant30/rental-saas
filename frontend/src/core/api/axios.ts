import { API_BASE_URL } from "../constants/appConstants";
import { localStorageService } from "../storage/localStorage";
import { handleError } from "../utils/errorHandler";

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: BodyInit | object | null;
  token?: string | null;
  headers?: HeadersInit;
  skipRefresh?: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

const AUTH_TOKENS_KEY = "rental_saas_tokens";

export const authTokenStorage = {
  get: () => localStorageService.get<AuthTokens | null>(AUTH_TOKENS_KEY, null),
  set: (tokens: AuthTokens) => localStorageService.set(AUTH_TOKENS_KEY, tokens),
  clear: () => localStorageService.remove(AUTH_TOKENS_KEY),
};

const buildHeaders = (options: ApiRequestOptions) => {
  const headers = new Headers(options.headers);
  const token = options.token ?? authTokenStorage.get()?.access;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
};

const tryRefreshToken = async () => {
  const refresh = authTokenStorage.get()?.refresh;
  if (!refresh) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    authTokenStorage.clear();
    return null;
  }

  const payload = (await response.json()) as { access: string };
  const current = authTokenStorage.get();
  if (!current) {
    return null;
  }
  const nextTokens = { ...current, access: payload.access };
  authTokenStorage.set(nextTokens);
  return nextTokens;
};

export const apiClient = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const headers = buildHeaders(options);
  const body =
    options.body && !(options.body instanceof FormData) && typeof options.body !== "string"
      ? JSON.stringify(options.body)
      : (options.body ?? undefined);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body,
  });

  if (response.status === 401 && !options.skipRefresh) {
    const refreshed = await tryRefreshToken();
    if (refreshed?.access) {
      return apiClient<T>(path, {
        ...options,
        token: refreshed.access,
        skipRefresh: true,
      });
    }
  }

  if (!response.ok) {
    if (response.status === 403) {
      // Avoid noisy logging for expected permissions errors.
      throw new Error("Forbidden");
    }

    let detail = `${response.status} ${response.statusText}`;
    try {
      const payload = (await response.json()) as Record<string, unknown>;
      detail = JSON.stringify(payload);
    } catch {
      // noop
    }
    throw new Error(handleError(detail));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};
