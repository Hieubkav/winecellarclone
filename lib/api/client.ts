const ADMIN_TOKEN_KEY = 'admin_access_token';
const ADMIN_PROFILE_CACHE_KEY = 'admin_profile_cache';
const ADMIN_SESSION_EXPIRES_AT_KEY = 'admin_session_expires_at';

const clearAdminSessionCache = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  window.sessionStorage.removeItem(ADMIN_PROFILE_CACHE_KEY);
  window.sessionStorage.removeItem(ADMIN_SESSION_EXPIRES_AT_KEY);
};

const getAdminToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
};

const resolveDefaultBaseUrl = (): string => {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname || "localhost";
    return `http://${hostname}:8000/api`;
  }

  return "http://127.0.0.1:8000/api";
};

const DEFAULT_API_BASE_URL = resolveDefaultBaseUrl();

const isServerEnvironment = typeof window === "undefined";

const coerceLoopbackHostname = (input: string): string => {
  if (!input || !isServerEnvironment) {
    return input;
  }

  try {
    const parsed = new URL(input);

    if (parsed.hostname.toLowerCase() === "localhost") {
      parsed.hostname = "127.0.0.1";
      return parsed.toString();
    }
  } catch {
    // Giữ nguyên chuỗi gốc khi không parse được URL
  }

  return input;
};

const normalizeUrl = (base: string, path: string): string => {
  const trimmedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const trimmedPath = path.startsWith("/") ? path.slice(1) : path;

  return `${trimmedBase}/${trimmedPath}`;
};

const mergeHeaders = (base: HeadersInit, extra?: HeadersInit): Headers => {
  const merged = new Headers(base);

  if (extra) {
    const extraHeaders = new Headers(extra);
    extraHeaders.forEach((value, key) => {
      merged.set(key, value);
    });
  }

  return merged;
};

const resolveApiBaseUrl = (): string => {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv;
  }

  return DEFAULT_API_BASE_URL;
};

export const API_BASE_URL = coerceLoopbackHostname(resolveApiBaseUrl());

export class ApiError extends Error {
  public readonly status: number;
  public readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const resolveRequestHeaders = (adminToken: string | null, init?: RequestInit): Headers => {
  return mergeHeaders(
    {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
    },
    init?.headers
  );
};

const resolveRequestOptions = (isAdminRequest: boolean, init?: RequestInit): RequestInit => {
  if (isAdminRequest) {
    return { cache: init?.cache ?? "no-store" };
  }

  return { next: { revalidate: 300, ...init?.next } };
};

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

export type ApiFetchTiming = {
  response_ms: number;
  parse_ms: number;
  total_ms: number;
};

export type ApiFetchAbsoluteOptions = {
  withAdminAuth?: boolean;
  suppressErrorLog?: boolean;
};

export async function apiFetch<TResponse>(
  path: string,
  init?: RequestInit
): Promise<TResponse> {
  const url = normalizeUrl(API_BASE_URL, path);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const isAdminRequest = normalizedPath.startsWith('/v1/admin/');
  const adminToken = isAdminRequest ? getAdminToken() : null;

  const response = await fetch(url, {
    ...init,
    headers: resolveRequestHeaders(adminToken, init),
    ...resolveRequestOptions(isAdminRequest, init),
  });

  const contentType = response.headers.get("content-type");
  const payload =
    contentType && contentType.includes("application/json")
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    if (isAdminRequest && response.status === 401) {
      clearAdminSessionCache();

      if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
        window.location.replace('/admin/login');
      }
    } else {
      console.error("[API Error]", {
        url,
        status: response.status,
        statusText: response.statusText,
        payload,
        responseHeaders: Object.fromEntries(response.headers.entries()),
      });
    }

    throw new ApiError(
      `API request failed with status ${response.status}`,
      response.status,
      payload
    );
  }

  return payload as TResponse;
}

export async function apiFetchWithTiming<TResponse>(
  path: string,
  init?: RequestInit
): Promise<{ payload: TResponse; timing: ApiFetchTiming }> {
  const url = normalizeUrl(API_BASE_URL, path);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const isAdminRequest = normalizedPath.startsWith('/v1/admin/');
  const adminToken = isAdminRequest ? getAdminToken() : null;

  const startAt = now();
  const response = await fetch(url, {
    ...init,
    headers: resolveRequestHeaders(adminToken, init),
    ...resolveRequestOptions(isAdminRequest, init),
  });
  const responseAt = now();

  const contentType = response.headers.get("content-type");
  const payload =
    contentType && contentType.includes("application/json")
      ? await response.json()
      : await response.text();
  const parsedAt = now();

  if (!response.ok) {
    if (isAdminRequest && response.status === 401) {
      clearAdminSessionCache();

      if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
        window.location.replace('/admin/login');
      }
    } else {
      console.error("[API Error]", {
        url,
        status: response.status,
        statusText: response.statusText,
        payload,
        responseHeaders: Object.fromEntries(response.headers.entries()),
      });
    }

    throw new ApiError(
      `API request failed with status ${response.status}`,
      response.status,
      payload
    );
  }

  return {
    payload: payload as TResponse,
    timing: {
      response_ms: Math.round(responseAt - startAt),
      parse_ms: Math.round(parsedAt - responseAt),
      total_ms: Math.round(parsedAt - startAt),
    },
  };
}

export async function apiFetchAbsoluteWithTiming<TResponse>(
  url: string,
  init?: RequestInit,
  options?: ApiFetchAbsoluteOptions
): Promise<{ payload: TResponse; timing: ApiFetchTiming }> {
  const adminToken = options?.withAdminAuth ? getAdminToken() : null;

  const startAt = now();
  const response = await fetch(url, {
    ...init,
    headers: resolveRequestHeaders(adminToken, init),
    cache: init?.cache ?? "no-store",
  });
  const responseAt = now();

  const contentType = response.headers.get("content-type");
  const payload =
    contentType && contentType.includes("application/json")
      ? await response.json()
      : await response.text();
  const parsedAt = now();

  if (!response.ok) {
    if (!options?.suppressErrorLog) {
      console.error("[API Error]", {
        url,
        status: response.status,
        statusText: response.statusText,
        payload,
        responseHeaders: Object.fromEntries(response.headers.entries()),
      });
    }

    throw new ApiError(
      `API request failed with status ${response.status}`,
      response.status,
      payload
    );
  }

  return {
    payload: payload as TResponse,
    timing: {
      response_ms: Math.round(responseAt - startAt),
      parse_ms: Math.round(parsedAt - responseAt),
      total_ms: Math.round(parsedAt - startAt),
    },
  };
}

export async function apiDownload(path: string, init?: RequestInit): Promise<Response> {
  const url = normalizeUrl(API_BASE_URL, path);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const adminToken = normalizedPath.startsWith('/v1/admin/') ? getAdminToken() : null;

  const response = await fetch(url, {
    ...init,
    headers: mergeHeaders(
      adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
      init?.headers
    ),
  });

  if (!response.ok) {
    const payload = await response.text();
    console.error('[API Download Error]', {
      url,
      status: response.status,
      statusText: response.statusText,
      payload,
      responseHeaders: Object.fromEntries(response.headers.entries()),
    });
    throw new ApiError(
      `API request failed with status ${response.status}`,
      response.status,
      payload
    );
  }

  return response;
}
