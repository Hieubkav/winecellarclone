"use client";

import Image from "next/image";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import type { WatermarkPosition, WatermarkSize } from "@/lib/api/settings";

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
}

const getPositionClasses = (position: WatermarkPosition | null | undefined): string => {
  switch (position) {
    case 'top_left':
      return 'top-2 left-2';
    case 'top_right':
      return 'top-2 right-2';
    case 'bottom_left':
      return 'bottom-2 left-2';
    case 'bottom_right':
      return 'bottom-2 right-2';
    default:
      return '';
  }
};

const getSizeValue = (size: WatermarkSize | null | undefined): number => {
  switch (size) {
    case '64x64':
      return 64;
    case '96x96':
      return 96;
    case '128x128':
      return 128;
    case '160x160':
      return 160;
    case '192x192':
      return 192;
    default:
      return 128;
  }
};

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
}: ProductImageProps) {
  const settings = useSettingsStore((state) => state.settings);
  
  const watermarkUrl = settings?.product_watermark_url;
  const watermarkPosition = settings?.product_watermark_position;
  const watermarkSize = settings?.product_watermark_size;
  
  const showWatermark = watermarkUrl && watermarkPosition && watermarkPosition !== 'none';
  const positionClasses = getPositionClasses(watermarkPosition);
  const sizeValue = getSizeValue(watermarkSize);
  
  // Responsive size: smaller on mobile
  const responsiveSizeClass = `w-[${Math.round(sizeValue * 0.5)}px] h-[${Math.round(sizeValue * 0.5)}px] sm:w-[${sizeValue}px] sm:h-[${sizeValue}px]`;

  if (fill) {
    return (
      <div className="relative w-full h-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={className}
          priority={priority}
          loading={loading}
        />
        {showWatermark && (
          <div 
            className={`absolute ${positionClasses} z-10 pointer-events-none opacity-70`}
            style={{ 
              width: sizeValue, 
              height: sizeValue,
            }}
          >
            <Image
              src={watermarkUrl}
              alt="watermark"
              fill
              className="object-contain max-sm:scale-50 max-sm:origin-top-left"
              sizes={`${sizeValue}px`}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={className}
        priority={priority}
        loading={loading}
      />
      {showWatermark && (
        <div 
          className={`absolute ${positionClasses} z-10 pointer-events-none opacity-70`}
          style={{ 
            width: sizeValue, 
            height: sizeValue,
          }}
        >
          <Image
            src={watermarkUrl}
            alt="watermark"
            fill
            className="object-contain max-sm:scale-50 max-sm:origin-top-left"
            sizes={`${sizeValue}px`}
          />
        </div>
      )}
    </div>
  );
}
