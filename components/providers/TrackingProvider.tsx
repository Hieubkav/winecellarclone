"use client";

import { useEffect } from "react";
import { trackingService } from "@/lib/services/trackingService";

/**
 * TrackingProvider initializes visitor tracking on app mount
 * Should be placed near root of app (in layout.tsx)
 */
export function TrackingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize tracking service and track visitor
    const initTracking = async () => {
      try {
        await trackingService.initialize();
        await trackingService.trackVisitor();
      } catch (error) {
        console.warn("[TrackingProvider] Failed to initialize tracking:", error);
      }
    };

    initTracking();

    // Cleanup on unmount
    return () => {
      trackingService.destroy();
    };
  }, []);

  return <>{children}</>;
}
