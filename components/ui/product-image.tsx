"use client";

import Image from "next/image";

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
}: ProductImageProps) {
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        priority={priority}
        loading={loading}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
      loading={loading}
      style={style}
    />
  );
}
