"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600"],
});

interface ContactMapProps {
  mapEmbedUrl: string;
}

/**
 * ContactMap - Lazy loaded Google Maps embed
 * 
 * Performance:
 * - Intersection Observer để lazy load iframe
 * - Chỉ load khi user scroll gần đến map
 * - Loading placeholder với skeleton
 * - Fallback nếu iframe fail
 * 
 * Accessibility:
 * - aria-label cho iframe
 * - title attribute cho screen readers
 * 
 * Input Support:
 * - Accepts plain URL (e.g., "https://www.google.com/maps/embed?...")
 * - OR full iframe HTML code (e.g., "<iframe src='...'></iframe>")
 */
export default function ContactMap({ mapEmbedUrl }: ContactMapProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Extract src URL from iframe HTML if needed
  const getSrcUrl = (input: string): string | null => {
    console.log('[ContactMap] Input:', input);
    console.log('[ContactMap] Input type:', typeof input);
    console.log('[ContactMap] Input length:', input?.length);
    
    if (!input || typeof input !== 'string') {
      console.log('[ContactMap] Invalid input');
      return null;
    }
    
    // Decode HTML entities if needed (e.g., &lt; &gt; &#60; &#62;)
    const decoded = input
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
    
    console.log('[ContactMap] After decode:', decoded.substring(0, 100));
    
    // Check if input is an iframe HTML string
    // Match src="..." or src='...'
    const iframeMatch = decoded.match(/src=["']([^"']+)["']/);
    if (iframeMatch && iframeMatch[1]) {
      const url = iframeMatch[1];
      console.log('[ContactMap] Extracted URL:', url);
      return url;
    }
    
    // If not iframe HTML, assume it's a direct URL
    if (decoded.startsWith('http')) {
      console.log('[ContactMap] Direct URL:', decoded);
      return decoded;
    }
    
    console.log('[ContactMap] Failed to extract URL');
    return null;
  };

  const iframeUrl = getSrcUrl(mapEmbedUrl);
  console.log('[ContactMap] Final iframe URL:', iframeUrl);

  useEffect(() => {
    console.log('[ContactMap] useEffect - Setting up Intersection Observer');
    
    // Intersection Observer để lazy load map
    const observer = new IntersectionObserver(
      (entries) => {
        console.log('[ContactMap] Intersection Observer triggered', {
          isIntersecting: entries[0].isIntersecting,
          intersectionRatio: entries[0].intersectionRatio
        });
        
        if (entries[0].isIntersecting) {
          console.log('[ContactMap] Map is visible, loading iframe...');
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px", // Load 100px trước khi user scroll đến
      }
    );

    if (mapRef.current) {
      console.log('[ContactMap] Observing map ref');
      observer.observe(mapRef.current);
    } else {
      console.log('[ContactMap] mapRef.current is null');
    }

    return () => {
      console.log('[ContactMap] Cleanup - disconnecting observer');
      observer.disconnect();
    };
  }, []);

  // Fallback if URL extraction fails
  if (!iframeUrl) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-lg border-2 border-[#ECAA4D]/30 bg-gray-50">
        <div className="text-center">
          <MapPin className="mx-auto mb-2 h-8 w-8 text-[#ECAA4D]/50" />
          <p className={`${montserrat.className} text-sm text-gray-500`}>
            Chưa có thông tin bản đồ
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="relative overflow-hidden rounded-lg border-2 border-[#ECAA4D]/30"
      style={{ minHeight: "400px" }}
    >
      {/* Loading Skeleton - Show while iframe is loading */}
      {isVisible && !isLoaded && (
        <div className="absolute inset-0 flex h-[400px] w-full items-center justify-center bg-gray-100">
          <div className="text-center">
            <MapPin className="mx-auto mb-2 h-8 w-8 animate-pulse text-[#ECAA4D]" />
            <p className={`${montserrat.className} text-sm text-gray-500`}>
              Đang tải bản đồ...
            </p>
          </div>
        </div>
      )}

      {/* Google Maps Iframe (Lazy Loaded) */}
      {isVisible && (
        <iframe
          src={iframeUrl}
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Bản đồ vị trí Thiên Kim Wine"
          aria-label="Google Maps hiển thị vị trí cửa hàng"
          onLoad={() => {
            console.log('[ContactMap] Iframe loaded successfully');
            setIsLoaded(true);
          }}
          onError={(e) => {
            console.error('[ContactMap] Iframe load error:', e);
          }}
        />
      )}
    </div>
  );
}
