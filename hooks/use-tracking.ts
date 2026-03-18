import { useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackingService } from "@/lib/services/trackingService";

/**
 * Hook to access tracking functionality
 * Usage:
 *   const { trackProductView, trackArticleView, trackCTAContact } = useTracking()
 *   trackProductView(productId)
 */
export function useTracking() {
  const trackProductView = useCallback(
    (productId: number, metadata?: Record<string, unknown>) => {
      void trackingService.trackProductView(productId, metadata);
    },
    []
  );

  const trackArticleView = useCallback(
    (articleId: number, metadata?: Record<string, unknown>) => {
      void trackingService.trackArticleView(articleId, metadata);
    },
    []
  );

  const trackCTAContact = useCallback((metadata?: Record<string, unknown>) => {
    void trackingService.trackCTAContact(metadata);
  }, []);

  const trackPageView = useCallback(
    (pagePath: string, metadata?: Record<string, unknown>) => {
      void trackingService.trackPageView(pagePath, metadata);
    },
    []
  );

  return {
    trackProductView,
    trackArticleView,
    trackCTAContact,
    trackPageView,
  };
}

/**
 * Hook to automatically track page views on route change
 * Usage: Place in layout or page component
 *   usePageViewTracking()
 */
export function usePageViewTracking() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      void trackingService.trackPageView(pathname);
    }
  }, [pathname]);
}
