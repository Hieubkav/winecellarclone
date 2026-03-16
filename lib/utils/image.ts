/**
 * Image URL utilities for Next.js frontend
 * 
 * IMPORTANT: Backend returns absolute URLs.
 * This utility is only a SAFETY NET for edge cases.
 */

const getBackendBaseUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
  return apiUrl.replace(/\/api\/?$/, "");
};

/**
 * Get image URL with minimal fallback
 * Backend already provides absolute URLs with fallback logic
 */
export function getImageUrl(url: string | null | undefined, fallback?: string): string {
  // Backend already handles all logic, just use the URL
  if (url) {
    const backendUrl = getBackendBaseUrl();

    if (url.includes("127.0.0.1:8000/storage/") || url.includes("localhost:8000/storage/")) {
      const storagePath = url.replace(/^https?:\/\/(127\.0\.0\.1|localhost):8000/, "");
      return `${backendUrl}${storagePath}`;
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    if (url.startsWith("/storage/")) {
      return `${backendUrl}${url}`;
    }

    if (url.startsWith("storage/")) {
      return `${backendUrl}/${url}`;
    }

    if (url.startsWith("/media/")) {
      return url;
    }

    if (url.startsWith("media/")) {
      return `/${url}`;
    }

    if (!url.startsWith("/")) {
      const cleanedPath = url.replace(/^\/+/, "");
      return `${backendUrl}/storage/${cleanedPath}`;
    }

    return url;
  }

  // Safety net fallback (should rarely be used)
  return fallback || '/placeholder/no-image.svg';
}

/**
 * Convert multiple image URLs
 */
export function getImageUrls(urls: (string | null | undefined)[], fallback?: string): string[] {
  return urls.map(url => getImageUrl(url, fallback));
}

/**
 * Get product image URL with fallback
 */
export function getProductImageUrl(url: string | null | undefined): string {
  return getImageUrl(url, '/placeholder/wine-bottle.svg');
}

/**
 * Get article image URL with fallback
 */
export function getArticleImageUrl(url: string | null | undefined): string {
  return getImageUrl(url, '/placeholder/article.svg');
}
