/**
 * Utility functions để xử lý image URLs từ backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';
const BACKEND_BASE = API_BASE_URL.replace('/api', '');

/**
 * Convert relative image URL từ backend thành absolute URL
 * @param url - URL từ backend (có thể là relative hoặc absolute)
 * @param fallback - Fallback image nếu url null/undefined
 * @returns Absolute URL
 */
export function getImageUrl(url: string | null | undefined, fallback?: string): string {
  if (!url) {
    return fallback || '/placeholder/no-image.svg';
  }

  // Nếu đã là absolute URL (http/https), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Nếu là relative URL, prepend backend base URL
  if (url.startsWith('/')) {
    return `${BACKEND_BASE}${url}`;
  }

  // Trường hợp khác, cũng prepend backend base
  return `${BACKEND_BASE}/${url}`;
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
