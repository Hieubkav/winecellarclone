import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Package, FileImage, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '@/lib/utils/image';

interface ImageWithFallbackProps {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  fill?: boolean;
  priority?: boolean;
  fallbackType?: 'product' | 'article' | 'image' | 'default';
  onError?: () => void;
}

const FallbackIcons = {
  product: Package,
  article: FileImage,
  image: ImageIcon,
  default: ImageIcon,
};

/**
 * Image component với fallback đẹp
 * Hiển thị icon thay vì broken image khi không có ảnh hoặc lỗi
 */
export function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className = '',
  sizes,
  fill = false,
  priority = false,
  fallbackType = 'default',
  onError,
}: ImageWithFallbackProps) {
  const Icon = FallbackIcons[fallbackType];
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = src ? getImageUrl(src) : null;
  const iconSize = Math.min(width ?? 40, height ?? 40) * 0.5;

  useEffect(() => {
    setHasError(false);
  }, [resolvedSrc]);

  // Nếu không có src, hiển thị fallback ngay
  if (!resolvedSrc || hasError) {
    return (
      <div 
        className={`bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${className} ${fill ? 'absolute inset-0' : ''}`}
        style={fill ? undefined : { width, height }}
      >
        <Icon 
          className="text-slate-400 dark:text-slate-500" 
          size={iconSize}
        />
      </div>
    );
  }

  // Có src, render Image với error handling
  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      fill={fill}
      priority={priority}
      onError={(e) => {
        setHasError(true);
        if (onError) onError();
      }}
    />
  );
}
