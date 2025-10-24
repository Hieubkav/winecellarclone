"use client"

import { useEffect, useState } from "react"

const DEFAULT_BREAKPOINT = 768

export function useIsMobile(breakpoint: number = DEFAULT_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const updateMatches = () => setIsMobile(mediaQuery.matches)

    updateMatches()

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMatches)
      return () => mediaQuery.removeEventListener("change", updateMatches)
    }

    mediaQuery.addListener(updateMatches)
    return () => mediaQuery.removeListener(updateMatches)
  }, [breakpoint])

  return isMobile
}
