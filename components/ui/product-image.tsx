"use client";

import Image from "next/image";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import type { WatermarkPosition, WatermarkSize, WatermarkTextSize, WatermarkTextPosition } from "@/lib/api/settings";

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

const getTextSizeClasses = (size: WatermarkTextSize | null | undefined): string => {
  switch (size) {
    case 'small':
      return 'text-lg sm:text-xl';
    case 'medium':
      return 'text-xl sm:text-2xl';
    case 'large':
      return 'text-2xl sm:text-4xl';
    case 'xlarge':
      return 'text-3xl sm:text-5xl';
    default:
      return 'text-xl sm:text-2xl';
  }
};

const getTextPositionClasses = (position: WatermarkTextPosition | null | undefined): string => {
  switch (position) {
    case 'top':
      return 'top-4 left-1/2 -translate-x-1/2';
    case 'center':
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    case 'bottom':
      return 'bottom-4 left-1/2 -translate-x-1/2';
    default:
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
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
  const watermarkType = settings?.product_watermark_type ?? 'image';
  const watermarkText = settings?.product_watermark_text;
  const watermarkTextSize = settings?.product_watermark_text_size;
  const watermarkTextPosition = settings?.product_watermark_text_position;
  const watermarkTextOpacity = settings?.product_watermark_text_opacity ?? 50;
  
  const showImageWatermark = watermarkType === 'image' && watermarkUrl && watermarkPosition && watermarkPosition !== 'none';
  const showTextWatermark = watermarkType === 'text' && watermarkText;
  
  const positionClasses = getPositionClasses(watermarkPosition);
  const sizeValue = getSizeValue(watermarkSize);
  const textSizeClasses = getTextSizeClasses(watermarkTextSize);
  const textPositionClasses = getTextPositionClasses(watermarkTextPosition);

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
        {showImageWatermark && (
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
        {showTextWatermark && (
          <div 
            className={`absolute ${textPositionClasses} z-10 pointer-events-none whitespace-nowrap`}
            style={{ opacity: watermarkTextOpacity / 100 }}
          >
            <span 
              className={`${textSizeClasses} font-bold text-white drop-shadow-lg`}
              style={{ 
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {watermarkText}
            </span>
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
      {showImageWatermark && (
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
      {showTextWatermark && (
        <div 
          className={`absolute ${textPositionClasses} z-10 pointer-events-none whitespace-nowrap`}
          style={{ opacity: watermarkTextOpacity / 100 }}
        >
          <span 
            className={`${textSizeClasses} font-bold text-white drop-shadow-lg`}
            style={{ 
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {watermarkText}
          </span>
        </div>
      )}
    </div>
  );
}
