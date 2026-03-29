import { API_BASE_URL } from "@/lib/api/client";

const ADMIN_TOKEN_KEY = "admin_access_token";

const getAdminToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
};

const buildAuthHeaders = (headers?: HeadersInit): HeadersInit => {
  const token = getAdminToken();
  const merged = new Headers(token ? { Authorization: `Bearer ${token}` } : undefined);

  if (headers) {
    const extra = new Headers(headers);
    extra.forEach((value, key) => {
      merged.set(key, value);
    });
  }

  return merged;
};

export interface UploadedImagePayload {
  url: string;
  path: string;
}

const parseUploadError = async (response: Response): Promise<string> => {
  try {
    const payload = await response.json();
    if (payload?.message) {
      return String(payload.message);
    }
  } catch {
    // ignore parse error
  }

  return "Không thể tải ảnh lên";
};

export async function uploadArticleImage(
  file: File,
  folder: string = "articles",
  semanticType: string = "article"
): Promise<UploadedImagePayload | null> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("folder", folder);
  formData.append("semantic_type", semanticType);

  const response = await fetch(`${API_BASE_URL}/v1/admin/upload/image`, {
    method: "POST",
    body: formData,
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseUploadError(response));
  }

  const result = await response.json();

  if (result.success && result.data) {
    return {
      url: (result.data.canonical_url || result.data.url) as string,
      path: result.data.path as string,
    };
  }

  return null;
}

export async function uploadArticleImageUrl(
  url: string,
  folder: string = "articles",
  semanticType: string = "article"
): Promise<UploadedImagePayload | null> {
  const response = await fetch(`${API_BASE_URL}/v1/admin/upload/image-url`, {
    method: "POST",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ url, folder, semantic_type: semanticType }),
  });

  if (!response.ok) {
    throw new Error(await parseUploadError(response));
  }

  const result = await response.json();

  if (result.success && result.data) {
    return {
      url: (result.data.canonical_url || result.data.url) as string,
      path: result.data.path as string,
    };
  }

  return null;
}
