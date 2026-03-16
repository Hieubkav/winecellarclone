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

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers ?? {}),
  };
};

export interface UploadedImagePayload {
  url: string;
  path: string;
}

export async function uploadArticleImage(file: File, folder: string = "articles"): Promise<UploadedImagePayload | null> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("folder", folder);

  const response = await fetch(`${API_BASE_URL}/v1/admin/upload/image`, {
    method: "POST",
    body: formData,
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const result = await response.json();

  if (result.success && result.data) {
    return { url: result.data.url as string, path: result.data.path as string };
  }

  return null;
}

export async function uploadArticleImageUrl(
  url: string,
  folder: string = "articles"
): Promise<UploadedImagePayload | null> {
  const response = await fetch(`${API_BASE_URL}/v1/admin/upload/image-url`, {
    method: "POST",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ url, folder }),
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const result = await response.json();

  if (result.success && result.data) {
    return { url: result.data.url as string, path: result.data.path as string };
  }

  return null;
}
