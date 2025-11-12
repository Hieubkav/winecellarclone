import { useCallback } from "react";
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
      trackingService.trackProductView(productId, metadata);
    },
    []
  );

  const trackArticleView = useCallback(
    (articleId: number, metadata?: Record<string, unknown>) => {
      trackingService.trackArticleView(articleId, metadata);
    },
    []
  );

  const trackCTAContact = useCallback((metadata?: Record<string, unknown>) => {
    trackingService.trackCTAContact(metadata);
  }, []);

  return {
    trackProductView,
    trackArticleView,
    trackCTAContact,
  };
}
