/**
 * Image URL utilities for Next.js frontend
 * 
 * IMPORTANT: Backend returns absolute URLs.
 * This utility is only a SAFETY NET for edge cases.
 */

/**
 * Get image URL with minimal fallback
 * Backend already provides absolute URLs with fallback logic
 */
export function getImageUrl(url: string | null | undefined, fallback?: string): string {
  // Backend already handles all logic, just use the URL
  if (url) {
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
