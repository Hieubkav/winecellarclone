import Image from 'next/image';
import { Package, FileImage, Image as ImageIcon } from 'lucide-react';

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

  // Nếu không có src, hiển thị fallback ngay
  if (!src) {
    return (
      <div 
        className={`bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <Icon 
          className="text-slate-400 dark:text-slate-500" 
          size={Math.min(width || 40, height || 40) * 0.5}
        />
      </div>
    );
  }

  // Có src, render Image với error handling
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      fill={fill}
      priority={priority}
      onError={(e) => {
        // Thay thế bằng fallback khi lỗi
        const target = e.currentTarget as HTMLImageElement;
        target.style.display = 'none';
        
        // Tạo fallback element
        const fallback = document.createElement('div');
        fallback.className = `bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${className}`;
        if (!fill) {
          fallback.style.width = `${width}px`;
          fallback.style.height = `${height}px`;
        }
        
        // Thêm icon
        const icon = document.createElement('div');
        icon.innerHTML = `<svg width="${Math.min(width || 40, height || 40) * 0.5}" height="${Math.min(width || 40, height || 40) * 0.5}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-slate-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
        fallback.appendChild(icon);
        
        target.parentNode?.insertBefore(fallback, target);
        
        if (onError) onError();
      }}
    />
  );
}
