'use client';

import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, Loader2, Package, FileText, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/api/client';
import { getImageUrl } from '@/lib/utils/article-content';

// Fixed colors từ site
const WINE_COLOR = "#9B2C3B";  // Đỏ burgundy
const _SPIRIT_COLOR = "#ECAA4D"; // Vàng gold

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

const deviceWidths = {
  desktop: 'w-full max-w-7xl',
  tablet: 'w-[768px] max-w-full',
  mobile: 'w-[375px] max-w-full'
};

const devices = [
  { id: 'desktop' as const, icon: Monitor, label: 'Desktop (max-w-7xl)' },
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
            {/* Fake header */}
            <div className="relative px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: WINE_COLOR, opacity: 0.6 }} />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: WINE_COLOR }}></div>
                <div className="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              {device !== 'mobile' && <div className="flex gap-4">{[1,2,3,4].map(i => (<div key={i} className="w-12 h-2 bg-slate-100 dark:bg-slate-800 rounded"></div>))}</div>}
            </div>
            
            {/* Hero section - responsive aspect ratio */}
            <section className="relative w-full bg-slate-900 overflow-hidden">
              <div className={cn(
                "relative w-full",
                device === 'mobile' ? 'aspect-[16/9] max-h-[200px]' : device === 'tablet' ? 'aspect-[16/9] max-h-[250px]' : 'aspect-[21/9] max-h-[280px]'
              )}>
                {slides.length > 0 ? (
                  <>
                    {slides.map((slide, idx) => {
                      // Use image or fallback to path, then convert to absolute URL
                      const rawUrl = slide.image || slide.path || '';
                      const imageUrl = rawUrl ? getImageUrl(rawUrl) : '';
                      return (
                        <div key={slide.id} className={cn("absolute inset-0 transition-opacity duration-700",
                          idx === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none")}>
                          {imageUrl ? (
                            <div className="w-full h-full relative">
                              {/* Blurred background - FULL không letterbox */}
                              <div 
                                className="absolute inset-0"
                                style={{
                                  backgroundImage: `url(${imageUrl})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  filter: 'blur(40px)',
                                  transform: 'scale(1.2)',
                                }}
                              />
                              <div className="absolute inset-0 bg-black/30" />
                              {/* Main image - object-contain */}
                              <img src={imageUrl} alt={slide.alt || `Slide ${idx + 1}`} className="relative w-full h-full object-contain z-10" />
                            </div>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: `${WINE_COLOR}25` }}>
                                <ImageIcon size={24} style={{ color: WINE_COLOR }} />
                              </div>
                              <span className="text-sm font-medium text-slate-400">Banner #{idx + 1}</span>
                              <span className="text-xs text-slate-500 mt-1">Khuyến nghị: 1920x600px</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {slides.length > 1 && (
                      <>
                        <button type="button" onClick={prevSlide} 
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center z-20 border-2 border-transparent hover:scale-105 transition-all"
                          style={{ borderColor: `${WINE_COLOR}40` }}>
                          <ChevronLeft size={14} style={{ color: WINE_COLOR }} />
                        </button>
                        <button type="button" onClick={nextSlide}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center z-20 border-2 border-transparent hover:scale-105 transition-all"
                          style={{ borderColor: `${WINE_COLOR}40` }}>
                          <ChevronRight size={14} style={{ color: WINE_COLOR }} />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
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
            </section>
            
            {/* Fake content below */}
            <div className="p-4 space-y-3">
              <div className="flex gap-3">{[1,2,3,4].slice(0, device === 'mobile' ? 2 : 4).map(i => (<div key={i} className="flex-1 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>))}</div>
            </div>
          </BrowserFrame>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          {device === 'desktop' && 'Desktop max-w-7xl (1280px)'}{device === 'tablet' && 'Tablet (768px)'}{device === 'mobile' && 'Mobile (375px)'}
          {' • '}Slide {currentSlide + 1} / {slides.length || 1}
        </div>
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-2">
            <ImageIcon size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <strong>1920×600px</strong> (16:5) • Preview sử dụng blurred background + object-contain để hiển thị toàn bộ ảnh
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============ COLLECTION SHOWCASE PREVIEW (Real Products) ============
interface CollectionShowcasePreviewProps {
  title: string;
  subtitle?: string;
  productIds: string; // "1,2,3,4"
}

export const CollectionShowcasePreview = ({ title, subtitle, productIds }: CollectionShowcasePreviewProps) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  
  // Parse IDs
  const ids = productIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
  
  // Fetch real products từ API
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'by-ids', ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const response = await fetch(`${API_BASE_URL}/v1/admin/products/list-for-select?ids=${ids.join(',')}&limit=100`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const json = await response.json();
      return json.data || [];
    },
    enabled: ids.length > 0,
  });
  
  const accentColor = WINE_COLOR;
  
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
                    // listForSelect API returns: value, label, price, cover_image
                    const productId = product.value || product.id;
                    const productName = product.label?.replace(/\s*\(#\d+\)$/, '') || product.name || '';
                    const productPrice = product.price;
                    // Convert to absolute URL using helper
                    const imageUrl = getImageUrl(product.cover_image?.url);
                    return (
                      <div key={productId} className="border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                        {imageUrl && (
                          <img src={imageUrl} alt={productName} className="w-full aspect-square object-cover rounded mb-2" />
                        )}
                        <h3 className="font-medium text-sm line-clamp-2 mb-1">{productName}</h3>
                        <p className="text-sm font-bold" style={{ color: accentColor }}>
                          {productPrice ? `${productPrice.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
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
      const response = await fetch(`${API_BASE_URL}/v1/admin/articles/list-for-select?ids=${ids.join(',')}&limit=100`);
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
            <div className="py-16 bg-white">
              <div className="mx-auto w-full max-w-6xl px-4 lg:px-2">
                <div className="rounded-3xl bg-white p-6 md:p-10">
                  <header className="mb-10 text-center">
                    {label && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-3"
                        style={{ backgroundColor: `${WINE_COLOR}15`, color: WINE_COLOR }}>
                        {label}
                      </span>
                    )}
                    <h2 className="text-2xl font-bold uppercase tracking-[0.18em] text-[#1C1C1C] md:text-[32px]">
                      {title || 'Tiêu đề'}
                    </h2>
                    <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#ECAA4D]" />
                    {description && (
                      <p className="max-w-2xl mx-auto text-slate-600 mt-4">{description}</p>
                    )}
                  </header>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                  <p className="text-sm text-slate-500 mt-2">Đang tải bài viết...</p>
                </div>
              ) : articles && articles.length > 0 ? (
                <div className={cn(
                  "grid gap-8",
                  device === 'mobile' ? 'grid-cols-1' : 'md:grid-cols-3'
                )}>
                  {articles.slice(0, 3).map((article: any) => {
                    // listForSelect API returns: value, label, cover_image, published_at
                    const articleId = article.value || article.id;
                    const articleTitle = article.label?.replace(/\s*\(#\d+\)$/, '') || article.title || '';
                    const publishedAt = article.published_at;
                    // Convert to absolute URL using helper
                    const imageUrl = getImageUrl(article.cover_image?.url);
                    return (
                      <div key={articleId} className="group flex h-full flex-col overflow-hidden border border-[#efefef] bg-white/95 p-0 rounded-lg transition hover:-translate-y-1 hover:border-[#ECAA4D]/60">
                        {imageUrl && (
                          <div className="relative aspect-video w-full overflow-hidden bg-[#FAFAFA]">
                            <img src={imageUrl} alt={articleTitle} className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.02]" />
                          </div>
                        )}
                        <div className="flex flex-1 flex-col p-5">
                          <h3 className="text-lg font-semibold text-[#1C1C1C] transition-colors group-hover:text-[#9B2C3B]">
                            {articleTitle}
                          </h3>
                          <div className="mt-auto flex items-center justify-between border-t border-[#f5f5f5] pt-4">
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9B2C3B]">Thien Kim Wine</span>
                            <span className="text-xs text-slate-500">
                              {publishedAt ? new Date(publishedAt).toLocaleDateString('vi-VN') : ''}
                            </span>
                          </div>
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
              </div>
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
      const response = await fetch(`${API_BASE_URL}/v1/admin/products/list-for-select?ids=${ids.join(',')}&limit=100`);
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
            <div className="py-6 md:py-8 bg-white">
              <div className="mx-auto w-full max-w-6xl px-4">
                {/* Heading */}
                <header className="mb-4 md:mb-5">
                  <h2 className="text-lg font-bold text-[#1C1C1C] tracking-tight md:text-xl">{title || 'Tiêu đề'}</h2>
                  {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
                </header>

                {/* Scroll row - HORIZONTAL LAYOUT */}
                {isLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                    <p className="text-sm text-slate-500 mt-2">Đang tải sản phẩm...</p>
                  </div>
                ) : products && products.length > 0 ? (
                  <div className="overflow-x-auto pb-2 -mx-3 md:-mx-1.5">
                    <div className="flex gap-3 md:gap-4 px-3 md:px-1.5">
                      {products.slice(0, 6).map((product: any) => {
                        // listForSelect API returns: value, label, price, cover_image
                        const productId = product.value || product.id;
                        const productName = product.label?.replace(/\s*\(#\d+\)$/, '') || product.name || '';
                        const productPrice = product.price;
                        // Convert to absolute URL using helper
                        const imageUrl = getImageUrl(product.cover_image?.url);
                        const itemWidth = device === 'mobile' ? 'w-[140px]' : device === 'tablet' ? 'w-[150px]' : 'w-[170px]';
                        return (
                          <div key={productId} className={cn("flex-shrink-0", itemWidth)}>
                            <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100">
                              {/* Image */}
                              {imageUrl && (
                                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-lg">
                                  <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />
                                  <span className="absolute left-2 top-2 rounded-full bg-[#9B2C3B] px-1.5 py-0.5 text-[9px] font-bold text-white z-20">
                                    NEW
                                  </span>
                                </div>
                              )}
                              {/* Content */}
                              <div className="flex flex-1 flex-col p-2 text-[#1C1C1C]">
                                <p className="mb-1 text-xs font-bold leading-tight line-clamp-2 h-8">{productName}</p>
                                <p className="text-xs font-bold text-[#ECAA4D]">
                                  {productPrice ? `${productPrice.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
            </div>
          </BrowserFrame>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          {device} • {products?.length || 0} sản phẩm • Horizontal scroll layout
        </div>
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-2">
            <Package size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <strong>Horizontal scroll</strong> • Mobile: 140px, Tablet: 150px, Desktop: 170px per item
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============ DUAL BANNER PREVIEW ============
interface DualBannerItem {
  id: number;
  image: string;
  path?: string;
  link: string;
  alt: string;
}

export const DualBannerPreview = ({ banners }: { banners: DualBannerItem[] }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            Preview Dual Banner
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
            {/* Fake header */}
            <div className="relative px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: WINE_COLOR, opacity: 0.6 }} />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: WINE_COLOR }}></div>
                <div className="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              {device !== 'mobile' && <div className="flex gap-4">{[1,2,3,4].map(i => (<div key={i} className="w-12 h-2 bg-slate-100 dark:bg-slate-800 rounded"></div>))}</div>}
            </div>

            {/* Dual Banner section */}
            <section className="relative bg-white py-4">
              <div className="mx-auto max-w-7xl px-2">
                {banners.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {banners.slice(0, 2).map((banner, idx) => {
                      const rawUrl = banner.image || banner.path || '';
                      const imageUrl = rawUrl ? getImageUrl(rawUrl) : '';
                      return (
                        <div key={banner.id} className="group relative block rounded-lg border border-slate-200 bg-white/95 p-1 shadow-md transition-all hover:-translate-y-1 hover:border-[#9B2C3B]/40">
                          <div className="relative overflow-hidden rounded-md">
                            {imageUrl ? (
                              <div className="relative aspect-[1000/407] w-full">
                                <img src={imageUrl} alt={banner.alt || `Banner ${idx + 1}`} className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.02]" />
                              </div>
                            ) : (
                              <div className="relative aspect-[1000/407] w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${WINE_COLOR}25` }}>
                                  <ImageIcon size={20} style={{ color: WINE_COLOR }} />
                                </div>
                                <span className="text-xs font-medium text-slate-500">Banner #{idx + 1}</span>
                                <span className="text-[10px] text-slate-400 mt-1">1000x407px</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon size={48} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">Chưa có banner</p>
                  </div>
                )}
              </div>
            </section>

            {/* Fake content below */}
            <div className="p-4 space-y-3">
              <div className="flex gap-3">{[1,2,3,4].slice(0, device === 'mobile' ? 2 : 4).map(i => (<div key={i} className="flex-1 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>))}</div>
            </div>
          </BrowserFrame>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          {device === 'desktop' && 'Desktop max-w-7xl (1280px)'}{device === 'tablet' && 'Tablet (768px)'}{device === 'mobile' && 'Mobile (375px)'}
          {' • '}{banners.length} banner(s)
        </div>
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-2">
            <ImageIcon size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <strong>1000×407px</strong> (aspect-ratio ~2.46:1) • 2 banners ngang nhau, responsive grid
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============ CATEGORY GRID PREVIEW ============
interface CategoryItem {
  id: number;
  title: string;
  href: string;
  image: string;
  path?: string;
}

export const CategoryGridPreview = ({ categories }: { categories: CategoryItem[] }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            Preview Category Grid
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
            {/* Fake header */}
            <div className="relative px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: WINE_COLOR, opacity: 0.6 }} />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: WINE_COLOR }}></div>
                <div className="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              {device !== 'mobile' && <div className="flex gap-4">{[1,2,3,4].map(i => (<div key={i} className="w-12 h-2 bg-slate-100 dark:bg-slate-800 rounded"></div>))}</div>}
            </div>

            {/* Category Grid section */}
            <section className="bg-white py-2">
              <div className="mx-auto max-w-7xl px-2">
                {categories.length > 0 ? (
                  <div className={cn(
                    "grid gap-1.5",
                    device === 'mobile' ? 'grid-cols-3' : 'grid-cols-6'
                  )}>
                    {categories.map((cat, _idx) => {
                      const rawUrl = cat.image || cat.path || '';
                      const imageUrl = rawUrl ? getImageUrl(rawUrl) : '';
                      return (
                        <div key={cat.id} className="group">
                          <div className="rounded-lg overflow-hidden border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-[#ECAA4D]/45 hover:shadow-lg">
                            <div className="relative aspect-[15/16] sm:aspect-[25/12] overflow-hidden">
                              {imageUrl ? (
                                <>
                                  <img src={imageUrl} alt={cat.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
                                  <div className="absolute inset-x-1 bottom-1 flex items-center justify-center rounded-md bg-black/40 px-1.5 py-0.5 text-center text-[0.65rem] font-normal uppercase tracking-[0.15em] text-white shadow-lg backdrop-blur-sm border border-[#ECAA4D]/20">
                                    {cat.title}
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5" style={{ backgroundColor: `${WINE_COLOR}25` }}>
                                    <ImageIcon size={16} style={{ color: WINE_COLOR }} />
                                  </div>
                                  <span className="text-[10px] font-medium text-slate-600 px-2 text-center">{cat.title}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon size={48} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">Chưa có danh mục</p>
                  </div>
                )}
              </div>
            </section>

            {/* Fake content below */}
            <div className="p-4 space-y-3">
              <div className="flex gap-3">{[1,2,3,4].slice(0, device === 'mobile' ? 2 : 4).map(i => (<div key={i} className="flex-1 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>))}</div>
            </div>
          </BrowserFrame>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          {device === 'desktop' && 'Desktop max-w-7xl (1280px)'}{device === 'tablet' && 'Tablet (768px)'}{device === 'mobile' && 'Mobile (375px)'}
          {' • '}{categories.length} categories • Grid: {device === 'mobile' ? '3' : '6'} cols
        </div>
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-2">
            <ImageIcon size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <strong>Square images</strong> • Mobile: 3 cols, Desktop: 6 cols • Overlay gradient + title
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============ BRAND SHOWCASE PREVIEW ============
interface BrandItem {
  id: number;
  image: string;
  path?: string;
  href: string;
  alt: string;
}

export const BrandShowcasePreview = ({ title, brands }: { title: string; brands: BrandItem[] }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Simulate carousel - show 5 items at a time on desktop, 3 on tablet, 1 on mobile
  const itemsPerView = device === 'mobile' ? 3 : device === 'tablet' ? 4 : 5;
  const visibleBrands = brands.slice(currentIndex, currentIndex + itemsPerView);

  const handleNext = () => {
    if (currentIndex + itemsPerView < brands.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(Math.max(0, brands.length - itemsPerView)); // Loop to end
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            Preview Brand Showcase
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
            {/* Fake header */}
            <div className="relative px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: WINE_COLOR, opacity: 0.6 }} />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: WINE_COLOR }}></div>
                <div className="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              {device !== 'mobile' && <div className="flex gap-4">{[1,2,3,4].map(i => (<div key={i} className="w-12 h-2 bg-slate-100 dark:bg-slate-800 rounded"></div>))}</div>}
            </div>

            {/* Brand Showcase section */}
            <section className="bg-white py-6">
              <div className="mx-auto max-w-6xl">
                <header className="mb-4 text-center">
                  <h2 className="text-2xl font-bold uppercase tracking-wide text-[#1C1C1C]">
                    {title || 'Thương hiệu đối tác'}
                  </h2>
                </header>
                {brands.length > 0 ? (
                  <div className="relative px-4">
                    {/* Carousel items */}
                    <div className="flex gap-4 justify-center items-center">
                      {visibleBrands.map((brand, idx) => {
                        const rawUrl = brand.image || brand.path || '';
                        const imageUrl = rawUrl ? getImageUrl(rawUrl) : '';
                        return (
                          <div key={brand.id} className="flex-shrink-0" style={{ width: `${100 / itemsPerView}%` }}>
                            <div className="flex h-full items-center justify-center rounded-xl border border-transparent p-2 transition-all hover:-translate-y-0.5 hover:border-[#ECAA4D]/40 hover:shadow-md">
                              {imageUrl ? (
                                <img src={imageUrl} alt={brand.alt} className="w-auto h-20 object-contain transition-transform hover:scale-105" />
                              ) : (
                                <div className="w-full h-20 flex flex-col items-center justify-center bg-slate-100 rounded-lg">
                                  <ImageIcon size={20} className="text-slate-400 mb-1" />
                                  <span className="text-[10px] text-slate-500">Brand {currentIndex + idx + 1}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Navigation arrows */}
                    {brands.length > itemsPerView && (
                      <>
                        <button type="button" onClick={handlePrev}
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-50 shadow-md flex items-center justify-center transition-all z-10">
                          <ChevronLeft size={16} className="text-slate-600" />
                        </button>
                        <button type="button" onClick={handleNext}
                          className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-50 shadow-md flex items-center justify-center transition-all z-10">
                          <ChevronRight size={16} className="text-slate-600" />
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon size={48} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">Chưa có thương hiệu</p>
                  </div>
                )}
              </div>
            </section>

            {/* Fake content below */}
            <div className="p-4 space-y-3">
              <div className="flex gap-3">{[1,2,3,4].slice(0, device === 'mobile' ? 2 : 4).map(i => (<div key={i} className="flex-1 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>))}</div>
            </div>
          </BrowserFrame>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          {device === 'desktop' && 'Desktop max-w-7xl (1280px)'}{device === 'tablet' && 'Tablet (768px)'}{device === 'mobile' && 'Mobile (375px)'}
          {' • '}{brands.length} brands • Carousel với autoplay
        </div>
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-2">
            <ImageIcon size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <strong>Logo images</strong> • Carousel tự động chuyển • Hover scale effect
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
