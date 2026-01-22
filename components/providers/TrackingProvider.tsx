"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackingService } from "@/lib/services/trackingService";

/**
 * TrackingProvider initializes visitor tracking on app mount
 * Should be placed near root of app (in layout.tsx)
 */
export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInitialized = useRef(false);
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Initialize tracking service and track visitor
    const initTracking = async () => {
      try {
        await trackingService.initialize();
        await trackingService.trackVisitor();
        isInitialized.current = true;
        // Track initial page view after initialization
        if (pathname) {
          trackingService.trackPageView(pathname);
          lastTrackedPath.current = pathname;
        }
      } catch (error) {
        console.warn("[TrackingProvider] Failed to initialize tracking:", error);
      }
    };

    initTracking();

    // Cleanup on unmount
    return () => {
      trackingService.destroy();
    };
  }, []); // Only run once on mount

  // Track page views on route change
  useEffect(() => {
    // Only track if already initialized (subsequent route changes)
    if (pathname && isInitialized.current && pathname !== lastTrackedPath.current) {
      trackingService.trackPageView(pathname);
      lastTrackedPath.current = pathname;
    }
  }, [pathname]);

  return <>{children}</>;
}
