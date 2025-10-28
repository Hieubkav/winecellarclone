const resolveDefaultBaseUrl = (): string => {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv;
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

const resolveApiBaseUrl = (): string => {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv;
  }

  return DEFAULT_API_BASE_URL;
};

const API_BASE_URL = coerceLoopbackHostname(resolveApiBaseUrl());

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

export async function apiFetch<TResponse>(
  path: string,
  init?: RequestInit
): Promise<TResponse> {
  const url = normalizeUrl(API_BASE_URL, path);

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    cache: init?.cache ?? "no-store",
  });

  const contentType = response.headers.get("content-type");
  const payload =
    contentType && contentType.includes("application/json")
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    throw new ApiError(
      `API request failed with status ${response.status}`,
      response.status,
      payload
    );
  }

  return payload as TResponse;
}
