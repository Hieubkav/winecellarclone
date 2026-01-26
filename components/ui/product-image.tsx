"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  style?: React.CSSProperties;
  showSkeleton?: boolean;
}

/**
 * ProductImage component
 * 
 * Note: Watermark is now applied server-side via Image Proxy API.
 * All product images are served through /api/v1/images/{id} endpoint
 * which applies watermark dynamically based on settings.
 * 
 * This prevents users from saving unwatermarked images and allows
 * easy watermark updates without re-uploading images.
 */
export function ProductImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  className = "",
  priority = false,
  loading,
  style,
  showSkeleton = true,
}: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Skeleton component
  const Skeleton = () => (
    <div 
      className={cn(
        "absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 animate-pulse",
        fill ? "" : "rounded"
      )}
      style={!fill ? { width: width || '100%', height: height || '100%' } : undefined}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <svg 
          className="w-10 h-10 text-stone-300" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    </div>
  );

  // Error fallback
  if (hasError) {
    return (
      <div 
        className={cn(
          "bg-stone-100 flex items-center justify-center",
          fill ? "absolute inset-0" : "",
          className
        )}
        style={!fill ? { width: width || '100%', height: height || '100%', ...style } : style}
      >
        <svg 
          className="w-12 h-12 text-stone-300" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }

  if (fill) {
    return (
      <div className="relative w-full h-full">
        {showSkeleton && isLoading && <Skeleton />}
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={cn(
            className,
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          priority={priority}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: width || 'auto', height: height || 'auto' }}>
      {showSkeleton && isLoading && <Skeleton />}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={cn(
          className,
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        priority={priority}
        loading={loading}
        style={style}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
