'use client';

import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, Loader2, Package, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/api/client';

// Fixed colors từ site
const WINE_COLOR = "#9B2C3B";  // Đỏ burgundy
const SPIRIT_COLOR = "#ECAA4D"; // Vàng gold

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

const deviceWidths = {
  desktop: 'w-full max-w-7xl',
  tablet: 'w-[768px] max-w-full',
  mobile: 'w-[375px] max-w-full'
};

const devices = [
  { id: 'desktop' as const, icon: Monitor, label: 'Desktop' },
  { id: 'tablet' as const, icon: Tablet, label: 'Tablet (768px)' },
  { id: 'mobile' as const, icon: Smartphone, label: 'Mobile (375px)' }
];

// Browser Frame Component
const BrowserFrame = ({ children, url = 'yoursite.com' }: { children: React.ReactNode; url?: string }) => (
  <div className="border rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-lg">
    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex items-center gap-2 border-b">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-400"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div className="w-3 h-3 rounded-full bg-green-400"></div>
      </div>
      <div className="flex-1 ml-4">
        <div className="bg-white dark:bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 max-w-xs">{url}</div>
      </div>
    </div>
    {children}
  </div>
);

// ============ HERO CAROUSEL PREVIEW ============
interface HeroSlide {
  id: number;
  image: string;
  path?: string; // Fallback field
  link: string;
  alt: string;
}

export const HeroCarouselPreview = ({ slides }: { slides: HeroSlide[] }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Debug: log slides data with details
  console.log('HeroCarouselPreview slides:', slides);
  slides.forEach((slide, idx) => {
    console.log(`Slide ${idx + 1}:`, {
      id: slide.id,
      image: slide.image,
      path: slide.path,
      link: slide.link,
      alt: slide.alt,
      finalUrl: slide.image || slide.path || 'NO IMAGE'
    });
  });

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            Preview Hero Carousel
          </CardTitle>
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {devices.map((d) => (
              <button key={d.id} type="button" onClick={() => setDevice(d.id)} title={d.label}
                className={cn("p-1.5 rounded-md transition-all",
                  device === d.id ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                <d.icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("mx-auto transition-all duration-300", deviceWidths[device])}>
          <BrowserFrame>
            <div className="relative w-full aspect-[21/9] bg-slate-900">
              {slides.length > 0 ? (
                <>
                  {slides.map((slide, idx) => {
                    // Use image or fallback to path
                    let imageUrl = slide.image || slide.path || '';
                    // Fix: Add backend URL if path is relative
                    if (imageUrl && !imageUrl.startsWith('http')) {
                      imageUrl = `${API_BASE_URL.replace('/api', '')}${imageUrl}`;
                    }
                    return (
                      <div key={slide.id} className={cn("absolute inset-0 transition-opacity duration-700",
                        idx === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none")}>
                        {imageUrl ? (
                          <img src={imageUrl} alt={slide.alt || `Slide ${idx + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800">
                            <Package size={48} className="text-slate-400 mb-2" />
                            <span className="text-slate-400 text-sm">Slide #{idx + 1}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {slides.length > 1 && (
                    <>
                      <button type="button" onClick={prevSlide} 
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center z-10">
                        <ChevronLeft size={16} style={{ color: WINE_COLOR }} />
                      </button>
                      <button type="button" onClick={nextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center z-10">
                        <ChevronRight size={16} style={{ color: WINE_COLOR }} />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {slides.map((_, idx) => (
                          <button key={idx} type="button" onClick={() => setCurrentSlide(idx)}
                            className={cn("w-2 h-2 rounded-full transition-all", idx === currentSlide ? "w-6" : "bg-white/50")}
                            style={idx === currentSlide ? { backgroundColor: WINE_COLOR } : {}} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                  <span className="text-slate-400 text-sm">Chưa có banner</span>
                </div>
              )}
            </div>
          </BrowserFrame>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          {device} • Slide {currentSlide + 1} / {slides.length || 1}
        </div>
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Khuyến nghị:</strong> 1920×600px (21:9) - Đặt subject vào 2/3 phải để tránh bị che bởi text overlay
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// ============ COLLECTION SHOWCASE PREVIEW (Real Products) ============
interface CollectionShowcasePreviewProps {
  title: string;
  subtitle?: string;
  description?: string;
  productIds: string; // "1,2,3,4"
  tone: 'wine' | 'spirit' | 'default';
}

export const CollectionShowcasePreview = ({ title, subtitle, description, productIds, tone }: CollectionShowcasePreviewProps) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  
  // Parse IDs
  const ids = productIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
  
  // Fetch real products từ API
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'by-ids', ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const response = await fetch(`${API_BASE_URL}/v1/products?ids=${ids.join(',')}&per_page=100`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const json = await response.json();
      return json.data || [];
    },
    enabled: ids.length > 0,
  });
  
  const accentColor = tone === 'spirit' ? SPIRIT_COLOR : tone === 'wine' ? WINE_COLOR : WINE_COLOR;
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            Preview Collection Showcase
          </CardTitle>
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {devices.map((d) => (
              <button key={d.id} type="button" onClick={() => setDevice(d.id)} title={d.label}
                className={cn("p-1.5 rounded-md transition-all",
                  device === d.id ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                <d.icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("mx-auto transition-all duration-300", deviceWidths[device])}>
          <BrowserFrame>
            <div className="p-6 bg-white">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{title || 'Tiêu đề'}</h2>
                  {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
                </div>
                <button 
                  className="px-4 py-2 rounded-full border font-medium text-sm"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  Xem thêm
                </button>
              </div>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                  <p className="text-sm text-slate-500 mt-2">Đang tải sản phẩm...</p>
                </div>
              ) : products && products.length > 0 ? (
                <div className={cn(
                  "grid gap-4",
                  device === 'mobile' ? 'grid-cols-2' : device === 'tablet' ? 'grid-cols-3' : 'grid-cols-4'
                )}>
                  {products.slice(0, 8).map((product: any) => {
                    // Fix image URL if relative
                    let imageUrl = product.cover_image?.url || '';
                    if (imageUrl && !imageUrl.startsWith('http')) {
                      imageUrl = `${API_BASE_URL.replace('/api', '')}${imageUrl}`;
                    }
                    return (
                      <div key={product.id} className="border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                        {imageUrl && (
                          <img src={imageUrl} alt={product.name} className="w-full aspect-square object-cover rounded mb-2" />
                        )}
                        <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
                        <p className="text-sm font-bold" style={{ color: accentColor }}>
                          {product.price ? `${product.price.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">
                    {ids.length === 0 ? 'Chưa nhập Product IDs' : 'Không tìm thấy sản phẩm'}
                  </p>
                </div>
              )}
            </div>
          </BrowserFrame>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          {device} • {products?.length || 0} sản phẩm • Màu: {tone}
        </div>
      </CardContent>
    </Card>
  );
};

// ============ EDITORIAL SPOTLIGHT PREVIEW (Real Articles) ============
interface EditorialSpotlightPreviewProps {
  label?: string;
  title: string;
  description?: string;
  articleIds: string; // "1,2,3"
}

export const EditorialSpotlightPreview = ({ label, title, description, articleIds }: EditorialSpotlightPreviewProps) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  
  const ids = articleIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
  
  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles', 'by-ids', ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const response = await fetch(`${API_BASE_URL}/v1/articles?ids=${ids.join(',')}&per_page=100`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      const json = await response.json();
      return json.data || [];
    },
    enabled: ids.length > 0,
  });
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            Preview Editorial Spotlight
          </CardTitle>
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {devices.map((d) => (
              <button key={d.id} type="button" onClick={() => setDevice(d.id)} title={d.label}
                className={cn("p-1.5 rounded-md transition-all",
                  device === d.id ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                <d.icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("mx-auto transition-all duration-300", deviceWidths[device])}>
          <BrowserFrame>
            <div className="p-6 bg-white">
              {label && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ backgroundColor: `${WINE_COLOR}15`, color: WINE_COLOR }}>
                  {label}
                </span>
              )}
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{title || 'Tiêu đề'}</h2>
              {description && <p className="text-slate-600 mb-6">{description}</p>}
              
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                  <p className="text-sm text-slate-500 mt-2">Đang tải bài viết...</p>
                </div>
              ) : articles && articles.length > 0 ? (
                <div className={cn(
                  "grid gap-4",
                  device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3'
                )}>
                  {articles.slice(0, 3).map((article: any) => {
                    // Fix image URL if relative
                    let imageUrl = article.cover_image?.url || '';
                    if (imageUrl && !imageUrl.startsWith('http')) {
                      imageUrl = `${API_BASE_URL.replace('/api', '')}${imageUrl}`;
                    }
                    return (
                      <div key={article.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        {imageUrl && (
                          <img src={imageUrl} alt={article.title} className="w-full aspect-video object-cover" />
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-sm line-clamp-2 mb-2">{article.title}</h3>
                          <p className="text-xs text-slate-500">
                            {article.published_at ? new Date(article.published_at).toLocaleDateString('vi-VN') : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">
                    {ids.length === 0 ? 'Chưa nhập Article IDs' : 'Không tìm thấy bài viết'}
                  </p>
                </div>
              )}
            </div>
          </BrowserFrame>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          {device} • {articles?.length || 0} bài viết
        </div>
      </CardContent>
    </Card>
  );
};

// ============ FAVOURITE PRODUCTS PREVIEW (Real Products) ============
interface FavouriteProductsPreviewProps {
  title: string;
  subtitle?: string;
  productIds: string; // "1,2,3,4,5,6"
}

export const FavouriteProductsPreview = ({ title, subtitle, productIds }: FavouriteProductsPreviewProps) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  
  const ids = productIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'favourite', ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const response = await fetch(`${API_BASE_URL}/v1/products?ids=${ids.join(',')}&per_page=100`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const json = await response.json();
      return json.data || [];
    },
    enabled: ids.length > 0,
  });
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            Preview Favourite Products
          </CardTitle>
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {devices.map((d) => (
              <button key={d.id} type="button" onClick={() => setDevice(d.id)} title={d.label}
                className={cn("p-1.5 rounded-md transition-all",
                  device === d.id ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                <d.icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("mx-auto transition-all duration-300", deviceWidths[device])}>
          <BrowserFrame>
            <div className="p-6 bg-white">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{title || 'Tiêu đề'}</h2>
              {subtitle && <p className="text-sm text-slate-600 mb-6">{subtitle}</p>}
              
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                  <p className="text-sm text-slate-500 mt-2">Đang tải sản phẩm...</p>
                </div>
              ) : products && products.length > 0 ? (
                <div className={cn(
                  "grid gap-4",
                  device === 'mobile' ? 'grid-cols-2' : device === 'tablet' ? 'grid-cols-3' : 'grid-cols-4 lg:grid-cols-6'
                )}>
                  {products.slice(0, 6).map((product: any) => {
                    // Fix image URL if relative
                    let imageUrl = product.cover_image?.url || '';
                    if (imageUrl && !imageUrl.startsWith('http')) {
                      imageUrl = `${API_BASE_URL.replace('/api', '')}${imageUrl}`;
                    }
                    return (
                      <div key={product.id} className="border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                        {imageUrl && (
                          <img src={imageUrl} alt={product.name} className="w-full aspect-square object-cover rounded mb-2" />
                        )}
                        <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
                        <p className="text-sm font-bold" style={{ color: WINE_COLOR }}>
                          {product.price ? `${product.price.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">
                    {ids.length === 0 ? 'Chưa nhập Product IDs' : 'Không tìm thấy sản phẩm'}
                  </p>
                </div>
              )}
            </div>
          </BrowserFrame>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          {device} • {products?.length || 0} sản phẩm
        </div>
      </CardContent>
    </Card>
  );
};
