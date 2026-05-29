import { authTokens } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ── Error class for API failures ──────────────────────────────

export class ApiError extends Error {
  public code: string;
  public statusCode: number;
  public details?: Record<string, string[]>;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// ── Token refresh deduplication ───────────────────────────────

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    const refreshToken = authTokens.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.success && data.data?.tokens) {
        authTokens.setTokens(
          data.data.tokens.accessToken,
          data.data.tokens.refreshToken,
        );
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ── Core request function ─────────────────────────────────────

interface ApiErrorPayload {
  success: false;
  data: null;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = authTokens.getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!response.ok) {
    // Auto-refresh on 401
    if (response.status === 401 && retry && typeof window !== "undefined") {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return apiRequest<T>(endpoint, options, false);
      }
      authTokens.clearTokens();
    }

    const error = json as ApiErrorPayload;
    throw new ApiError(
      error.error?.message || "Request failed",
      error.error?.code || "UNKNOWN",
      response.status,
      error.error?.details,
    );
  }

  return json.data as T;
}

// ── Convenience methods ───────────────────────────────────────

export const api = {
  get: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: "DELETE" }),
};
