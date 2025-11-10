/**
 * Text normalization utilities for Vietnamese search
 * Based on product-search-scoring skill
 */

const VIETNAMESE_ACCENT_MAP: Record<string, string> = {
  'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
  'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
  'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
  'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
  'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
  'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
  'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
  'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
  'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
  'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
  'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
  'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
  'đ': 'd',
  'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
  'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
  'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
  'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
  'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
  'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
  'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
  'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
  'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
  'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
  'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
  'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
  'Đ': 'D',
}

const STOP_WORDS = new Set([
  'va', 'la', 'cua', 'voi', 'theo', 'tu', 'ma', 'thi', 'cho',
  'den', 'di', 'do', 'khi', 'nay', 'nhu', 'sau', 'tren', 'duoi'
])

/**
 * Remove Vietnamese accents from a string
 */
export function removeVietnameseAccents(text: string): string {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    result += VIETNAMESE_ACCENT_MAP[char] || char
  }
  return result
}

/**
 * Normalize text for search:
 * - Remove Vietnamese accents
 * - Convert to lowercase
 * - Remove special characters (keep only alphanumeric and spaces)
 * - Normalize whitespace
 */
export function normalizeForSearch(text: string): string {
  let normalized = removeVietnameseAccents(text)
  normalized = normalized.toLowerCase()
  normalized = normalized.replace(/[^a-z0-9\s]/g, ' ')
  normalized = normalized.replace(/\s+/g, ' ')
  return normalized.trim()
}

/**
 * Split search terms and filter stop words
 */
export function splitSearchTerms(text: string): string[] {
  const normalized = normalizeForSearch(text)
  const words = normalized.split(' ')
  
  return words.filter(word => {
    return word.length > 0 && !STOP_WORDS.has(word)
  })
}

/**
 * Check if a search query matches a text using flexible matching
 * Returns true if all search terms are found in the text
 */
export function matchesSearch(text: string, query: string): boolean {
  if (!query.trim()) {
    return true
  }
  
  const normalizedText = normalizeForSearch(text)
  const searchTerms = splitSearchTerms(query)
  
  // All terms must be found in the text
  return searchTerms.every(term => normalizedText.includes(term))
}

/**
 * Highlight search terms in text (for display purposes)
 * Returns HTML string with <mark> tags around matched terms
 */
export function highlightSearchTerms(text: string, query: string): string {
  if (!query.trim()) {
    return text
  }
  
  const searchTerms = splitSearchTerms(query)
  let highlighted = text
  
  searchTerms.forEach(term => {
    const pattern = new RegExp(`(${term})`, 'gi')
    highlighted = highlighted.replace(pattern, '<mark class="bg-yellow-200">$1</mark>')
  })
  
  return highlighted
}
