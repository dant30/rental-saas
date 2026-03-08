import { API_BASE_URL } from "../constants/appConstants";
import { localStorageService } from "../storage/localStorage";
import { handleError } from "../utils/errorHandler";

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: BodyInit | Record<string, unknown> | null;
  token?: string | null;
  headers?: HeadersInit;
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

  if (!response.ok) {
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
