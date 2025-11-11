/**
 * Process article content to convert relative storage URLs to absolute URLs
 */

const getBackendBaseUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
  // Remove /api suffix to get base URL
  return apiUrl.replace(/\/api\/?$/, "");
};

/**
 * Convert relative /storage/ paths to absolute URLs
 * Example: /storage/image.jpg -> http://127.0.0.1:8000/storage/image.jpg
 */
export function processArticleContent(content: string | null): string {
  if (!content) return "";

  const backendUrl = getBackendBaseUrl();

  // Replace relative /storage/ paths with absolute URLs
  // Matches: src="/storage/..." or src='/storage/...'
  const processedContent = content.replace(
    /(src=["'])\/storage\//gi,
    `$1${backendUrl}/storage/`
  );

  return processedContent;
}

/**
 * Strip HTML tags for plain text extraction (e.g., for excerpts)
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Calculate estimated reading time based on word count
 */
export function calculateReadingTime(content: string): number {
  const plainText = stripHtmlTags(content);
  const wordCount = plainText.trim().split(/\s+/).length;
  const wordsPerMinute = 200; // Average reading speed
  return Math.ceil(wordCount / wordsPerMinute);
}
