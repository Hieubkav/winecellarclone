import { useEffect, useRef, useCallback } from 'react'

/**
 * useDebouncedCallback - React hook for debouncing callbacks
 * 
 * Usage:
 * const debouncedSave = useDebouncedCallback((value) => {
 *   saveToServer(value)
 * }, 500)
 * 
 * // In onChange:
 * onChange={e => debouncedSave(e.target.value)}
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(callback)

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay]
  )
}

/**
 * useDebounce - React hook for debouncing values
 * 
 * Usage:
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedTerm = useDebounce(searchTerm, 500)
 * 
 * useEffect(() => {
 *   fetchProducts(debouncedTerm)
 * }, [debouncedTerm])
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
