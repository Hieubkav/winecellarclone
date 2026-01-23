import { debounce } from 'lodash'

export { debounce }

/**
 * Custom debounce function without dependencies
 * 
 * Usage:
 * const debouncedSearch = debounce((query) => {
 *   fetchProducts(query)
 * }, 500)
 * 
 * debouncedSearch('wine')
 */
export function createDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Debounce for async functions
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null
  let latestResolve: ((value: ReturnType<T>) => void) | null = null
  let latestReject: ((reason?: any) => void) | null = null
  
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      if (timeout) {
        clearTimeout(timeout)
      }
      
      latestResolve = resolve
      latestReject = reject
      
      timeout = setTimeout(async () => {
        try {
          const result = await func(...args)
          if (latestResolve) {
            latestResolve(result)
          }
        } catch (error) {
          if (latestReject) {
            latestReject(error)
          }
        }
      }, wait)
    })
  }
}
