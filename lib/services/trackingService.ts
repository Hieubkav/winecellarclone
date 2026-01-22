import { apiFetch } from "@/lib/api/client";

const VISITOR_ID_KEY = "winecellar_visitor_id";
const SESSION_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes

interface TrackVisitorResponse {
  success: boolean;
  data: {
    visitor_id: number;
    session_id: number;
  };
}

interface TrackEventResponse {
  success: boolean;
  data: {
    event_id: number;
    event_type: string;
    occurred_at: string;
  };
}

interface GenerateIdResponse {
  success: boolean;
  data: {
    anon_id: string;
  };
}

class TrackingService {
  private anonId: string | null = null;
  private initialized = false;
  private sessionCheckTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize tracking service
   * Get or create anonymous ID from localStorage
   */
  async initialize(): Promise<void> {
    if (this.initialized || typeof window === "undefined") {
      return;
    }

    try {
      // Try to get existing anon_id from localStorage
      const storedId = localStorage.getItem(VISITOR_ID_KEY);

      if (storedId && this.isValidUUID(storedId)) {
        this.anonId = storedId;
      } else {
        // Generate new ID from backend
        const response = await apiFetch<GenerateIdResponse>(
          "/v1/track/generate-id"
        );
        this.anonId = response.data.anon_id;
        localStorage.setItem(VISITOR_ID_KEY, this.anonId);
      }

      this.initialized = true;
      this.startSessionCheck();
    } catch (error) {
      console.warn("[Tracking] Failed to initialize:", error);
      // Fallback: generate UUID on client
      this.anonId = this.generateUUID();
      localStorage.setItem(VISITOR_ID_KEY, this.anonId);
      this.initialized = true;
    }
  }

  /**
   * Track visitor (should be called once when app loads)
   */
  async trackVisitor(): Promise<void> {
    if (!this.initialized || !this.anonId) {
      await this.initialize();
    }

    if (!this.anonId) {
      console.warn("[Tracking] Cannot track visitor: no anon_id");
      return;
    }

    try {
      await apiFetch<TrackVisitorResponse>("/v1/track/visitor", {
        method: "POST",
        body: JSON.stringify({
          anon_id: this.anonId,
          user_agent: navigator.userAgent,
        }),
        cache: "no-store",
      });
    } catch (error) {
      console.warn("[Tracking] Failed to track visitor:", error);
    }
  }

  /**
   * Track product view event
   */
  async trackProductView(
    productId: number,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    return this.trackEvent("product_view", { product_id: productId }, metadata);
  }

  /**
   * Track article view event
   */
  async trackArticleView(
    articleId: number,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    return this.trackEvent("article_view", { article_id: articleId }, metadata);
  }

  /**
   * Track CTA contact event
   */
  async trackCTAContact(metadata?: Record<string, unknown>): Promise<void> {
    return this.trackEvent("cta_contact", {}, metadata);
  }

  /**
   * Track page view event
   */
  async trackPageView(
    pagePath: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    return this.trackEvent("page_view", {}, { ...metadata, page_path: pagePath });
  }

  /**
   * Generic track event method
   */
  private async trackEvent(
    eventType: "product_view" | "article_view" | "cta_contact" | "page_view",
    params: { product_id?: number; article_id?: number },
    metadata?: Record<string, unknown>
  ): Promise<void> {
    if (!this.initialized || !this.anonId) {
      await this.initialize();
    }

    if (!this.anonId) {
      console.warn("[Tracking] Cannot track event: no anon_id");
      return;
    }

    try {
      await apiFetch<TrackEventResponse>("/v1/track/event", {
        method: "POST",
        body: JSON.stringify({
          anon_id: this.anonId,
          event_type: eventType,
          product_id: params.product_id,
          article_id: params.article_id,
          metadata: {
            ...metadata,
            timestamp: Date.now(),
            page: typeof window !== "undefined" ? window.location.pathname : "",
          },
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        }),
        cache: "no-store",
      });
    } catch (error) {
      console.warn(`[Tracking] Failed to track ${eventType}:`, error);
    }
  }

  /**
   * Periodically update session (keep session alive)
   */
  private startSessionCheck(): void {
    if (typeof window === "undefined") return;

    this.sessionCheckTimer = setInterval(() => {
      this.trackVisitor();
    }, SESSION_CHECK_INTERVAL);
  }

  /**
   * Stop session check timer
   */
  destroy(): void {
    if (this.sessionCheckTimer) {
      clearInterval(this.sessionCheckTimer);
      this.sessionCheckTimer = null;
    }
  }

  /**
   * Validate UUID format
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Generate UUID v4 on client side (fallback)
   */
  private generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  /**
   * Get current anonymous ID
   */
  getAnonId(): string | null {
    return this.anonId;
  }
}

// Export singleton instance
export const trackingService = new TrackingService();
