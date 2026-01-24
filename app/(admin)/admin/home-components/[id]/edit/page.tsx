'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button, Card, Label, Skeleton } from '../../../components/ui';
import { fetchAdminHomeComponent, updateHomeComponent } from '@/lib/api/admin';
import { toast } from 'sonner';
import { getComponentTypeInfo } from '../../componentTypes';
import {
  HeroCarouselForm,
  DualBannerForm,
  CategoryGridForm,
  BrandShowcaseForm,
  CollectionShowcaseForm,
  EditorialSpotlightForm,
  FavouriteProductsForm,
  SpeedDialForm,
} from '../../FormComponents';
import {
  HeroCarouselPreview,
  DualBannerPreview,
  CategoryGridPreview,
  BrandShowcasePreview,
  CollectionShowcasePreview,
  EditorialSpotlightPreview,
  FavouriteProductsPreview,
} from '../../previews';

interface HeroSlide {
  id: number;
  image: string;
  path: string;
  imageId?: number;
  link: string;
  alt: string;
}

interface BannerItem {
  id: number;
  image: string;
  path: string;
  link: string;
  alt: string;
}

interface CategoryItem {
  id: number;
  title: string;
  href: string;
  image: string;
  path: string;
}

interface BrandItem {
  id: number;
  image: string;
  path: string;
  imageId?: number;
  href: string;
  alt: string;
}

interface SpeedDialItem {
  id: number;
  iconType: 'home' | 'phone' | 'zalo' | 'messenger' | 'custom';
  iconUrl: string;
  label: string;
  href: string;
  target: '_self' | '_blank';
}

export default function HomeComponentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [componentId, setComponentId] = useState<number | null>(null);
  
  const [componentType, setComponentType] = useState('');
  const [active, setActive] = useState(true);

  const typeInfo = componentType ? getComponentTypeInfo(componentType) : null;

  // Hero Carousel state
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);

  // Dual Banner state
  const [dualBanners, setDualBanners] = useState<BannerItem[]>([]);

  // Category Grid state
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // Brand Showcase state
  const [brandTitle, setBrandTitle] = useState('');
  const [brands, setBrands] = useState<BrandItem[]>([]);

  // Collection Showcase state
  const [collectionTitle, setCollectionTitle] = useState('');
  const [collectionSubtitle, setCollectionSubtitle] = useState('');
  const [collectionCtaLabel, setCollectionCtaLabel] = useState('');
  const [collectionCtaHref, setCollectionCtaHref] = useState('');
  const [collectionProductIds, setCollectionProductIds] = useState('');

  // Editorial Spotlight state
  const [editorialLabel, setEditorialLabel] = useState('');
  const [editorialTitle, setEditorialTitle] = useState('');
  const [editorialDescription, setEditorialDescription] = useState('');
  const [editorialArticleIds, setEditorialArticleIds] = useState('');

  // Favourite Products state
  const [favouriteTitle, setFavouriteTitle] = useState('');
  const [favouriteSubtitle, setFavouriteSubtitle] = useState('');
  const [favouriteProductIds, setFavouriteProductIds] = useState('');

  // Speed Dial state
  const [speedDialItems, setSpeedDialItems] = useState<SpeedDialItem[]>([]);

  useEffect(() => {
    params.then(p => {
      const id = parseInt(p.id);
      setComponentId(id);
      loadComponent(id);
    });
  }, []);

  const parseConfig = async (type: string, config: any) => {
    try {
      switch (type) {
        case 'hero_carousel':
          console.log('parseConfig hero_carousel - raw config:', config);
          if (config.slides && Array.isArray(config.slides)) {
            console.log('parseConfig hero_carousel - slides:', config.slides);
            
            // Fetch images for slides with image_id
            const slidesWithImages = await Promise.all(
              config.slides.map(async (slide: any) => {
                let imageUrl = '';
                
                // Try slide.image.url first (new format)
                if (slide.image?.url) {
                  imageUrl = slide.image.url;
                }
                // Fallback to fetch from image_id (old format)
                else if (slide.image_id) {
                  try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api'}/v1/admin/images/${slide.image_id}`);
                    if (response.ok) {
                      const data = await response.json();
                      imageUrl = data.data?.url || '';
                    }
                  } catch (error) {
                    console.error(`Failed to fetch image ${slide.image_id}:`, error);
                  }
                }
                
                return {
                  id: Date.now() + Math.random(),
                  image: imageUrl,
                  path: imageUrl,
                  imageId: slide.image_id || slide.image?.id,
                  link: slide.href || '',
                  alt: slide.alt || slide.image?.alt || '',
                };
              })
            );
            
            setHeroSlides(slidesWithImages);
          }
          break;

        case 'dual_banner':
          console.log('parseConfig dual_banner - raw config:', config);
          if (config.banners && Array.isArray(config.banners)) {
            console.log('parseConfig dual_banner - banners array:', config.banners);
            const parsed = config.banners.slice(0, 2).map((banner: any, idx: number) => {
              // Handle both string URL and object {url} formats
              const imageUrl = typeof banner.image === 'string' 
                ? banner.image 
                : (banner.image?.url || '');
              
              console.log(`Banner ${idx}:`, {
                originalImage: banner.image,
                imageType: typeof banner.image,
                parsedImageUrl: imageUrl,
                href: banner.href,
                alt: banner.alt,
              });
              
              return {
                id: idx + 1,
                image: imageUrl,
                path: imageUrl,
                link: banner.href || '',
                alt: banner.alt || '',
              };
            });
            console.log('parseConfig dual_banner - parsed banners:', parsed);
            setDualBanners(parsed);
          } else {
            console.log('parseConfig dual_banner - NO banners array found');
          }
          break;

        case 'category_grid':
          console.log('parseConfig category_grid - raw config:', config);
          if (config.categories && Array.isArray(config.categories)) {
            console.log('parseConfig category_grid - categories array:', config.categories);
            
            // Log first item detail
            if (config.categories[0]) {
              console.log('First category FULL OBJECT:', JSON.stringify(config.categories[0], null, 2));
            }
            
            const parsed = config.categories.map((cat: any, idx: number) => {
              // Handle both string URL and object {url} formats
              const imageUrl = typeof cat.image === 'string'
                ? cat.image
                : (cat.image?.url || '');
              
              console.log(`Category ${idx}:`, {
                originalImage: cat.image,
                imageType: typeof cat.image,
                parsedImageUrl: imageUrl,
                title: cat.title,
                href: cat.href,
                fullObject: cat,
              });
              
              return {
                id: Date.now() + idx,
                title: cat.title || '',
                href: cat.href || '',
                image: imageUrl,
                path: imageUrl,
              };
            });
            console.log('parseConfig category_grid - parsed categories:', parsed);
            setCategories(parsed);
          } else {
            console.log('parseConfig category_grid - NO categories array found');
          }
          break;

        case 'brand_showcase':
          setBrandTitle(config.title || '');
          if (config.brands && Array.isArray(config.brands)) {
            // Fetch images for brands with image_id
            const brandsWithImages = await Promise.all(
              config.brands.map(async (brand: any, idx: number) => {
                let imageUrl = '';
                
                // Try brand.image.url first (new format)
                if (brand.image?.url) {
                  imageUrl = brand.image.url;
                }
                // Fallback to fetch from image_id (old format)
                else if (brand.image_id) {
                  try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api'}/v1/admin/images/${brand.image_id}`);
                    if (response.ok) {
                      const data = await response.json();
                      imageUrl = data.data?.url || '';
                    }
                  } catch (error) {
                    console.error(`Failed to fetch image ${brand.image_id}:`, error);
                  }
                }
                
                return {
                  id: Date.now() + idx,
                  image: imageUrl,
                  path: imageUrl,
                  imageId: brand.image_id || brand.image?.id,
                  href: brand.href || '',
                  alt: brand.alt || '',
                };
              })
            );
            setBrands(brandsWithImages);
          }
          break;

        case 'collection_showcase':
          setCollectionTitle(config.title || '');
          setCollectionSubtitle(config.subtitle || '');
          setCollectionCtaLabel(config.ctaLabel || '');
          setCollectionCtaHref(config.ctaHref || '');
          if (config.product_ids && Array.isArray(config.product_ids)) {
            setCollectionProductIds(config.product_ids.join(','));
          }
          break;

        case 'editorial_spotlight':
          setEditorialLabel(config.label || '');
          setEditorialTitle(config.title || '');
          setEditorialDescription(config.description || '');
          if (config.article_ids && Array.isArray(config.article_ids)) {
            setEditorialArticleIds(config.article_ids.join(','));
          }
          break;

        case 'favourite_products':
          setFavouriteTitle(config.title || '');
          setFavouriteSubtitle(config.subtitle || '');
          if (config.product_ids && Array.isArray(config.product_ids)) {
            setFavouriteProductIds(config.product_ids.join(','));
          }
          break;

        case 'speed_dial':
          if (config.items && Array.isArray(config.items)) {
            setSpeedDialItems(config.items.map((item: any, idx: number) => ({
              id: Date.now() + idx,
              iconType: item.iconType || 'phone',
              iconUrl: item.iconUrl || '',
              label: item.label || '',
              href: item.href || '',
              target: item.target || '_self',
            })));
          }
          break;
      }
    } catch (error) {
      console.error('Failed to parse config:', error);
      toast.error('Không thể đọc cấu hình hiện tại');
    }
  };

  const loadComponent = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const result = await fetchAdminHomeComponent(id);
      const component = result.data;
      
      setComponentType(component.type);
      setActive(component.active);
      
      parseConfig(component.type, component.config);

      // Update URL with component type for better UX
      const typeInfo = getComponentTypeInfo(component.type);
      if (typeInfo) {
        const url = new URL(window.location.href);
        url.searchParams.set('type', typeInfo.label);
        window.history.replaceState({}, '', url.toString());
      }
    } catch (error) {
      console.error('Failed to load component:', error);
      toast.error('Không thể tải thành phần');
      router.push('/admin/home-components');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const buildConfig = (): Record<string, unknown> | null => {
    switch (componentType) {
      case 'hero_carousel':
        if (heroSlides.length === 0) {
          toast.error('Vui lòng thêm ít nhất 1 slide');
          return null;
        }
        return {
          slides: heroSlides.map(slide => ({
            image_id: slide.imageId || null,
            href: slide.link || null,
            alt: slide.alt || null,
          })),
        };

      case 'dual_banner':
        if (dualBanners.length < 2) {
          toast.error('Cần có đủ 2 banner');
          return null;
        }
        return {
          banners: dualBanners.slice(0, 2).map(banner => ({
            image: { id: 0, url: banner.image, alt: banner.alt },
            href: banner.link,
            alt: banner.alt,
          })),
        };

      case 'category_grid':
        if (categories.length === 0) {
          toast.error('Vui lòng thêm ít nhất 1 danh mục');
          return null;
        }
        return {
          categories: categories.map(cat => ({
            title: cat.title,
            href: cat.href,
            image: { id: 0, url: cat.image, alt: cat.title },
          })),
        };

      case 'brand_showcase':
        if (!brandTitle.trim()) {
          toast.error('Vui lòng nhập tiêu đề');
          return null;
        }
        if (brands.length === 0) {
          toast.error('Vui lòng thêm ít nhất 1 thương hiệu');
          return null;
        }
        return {
          title: brandTitle,
          brands: brands.map(brand => ({
            image_id: brand.imageId || null,
            href: brand.href || null,
            alt: brand.alt || null,
          })),
        };

      case 'collection_showcase':
        if (!collectionTitle.trim()) {
          toast.error('Vui lòng nhập tiêu đề');
          return null;
        }
        if (!collectionProductIds.trim()) {
          toast.error('Vui lòng nhập Product IDs');
          return null;
        }
        return {
          title: collectionTitle,
          subtitle: collectionSubtitle || null,
          ctaLabel: collectionCtaLabel || null,
          ctaHref: collectionCtaHref || null,
          product_ids: collectionProductIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)),
        };

      case 'editorial_spotlight':
        if (!editorialTitle.trim()) {
          toast.error('Vui lòng nhập tiêu đề');
          return null;
        }
        if (!editorialArticleIds.trim()) {
          toast.error('Vui lòng nhập Article IDs');
          return null;
        }
        return {
          label: editorialLabel || null,
          title: editorialTitle,
          description: editorialDescription || null,
          article_ids: editorialArticleIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)),
        };

      case 'favourite_products':
        if (!favouriteTitle.trim()) {
          toast.error('Vui lòng nhập tiêu đề');
          return null;
        }
        if (!favouriteProductIds.trim()) {
          toast.error('Vui lòng nhập Product IDs');
          return null;
        }
        return {
          title: favouriteTitle,
          subtitle: favouriteSubtitle || null,
          product_ids: favouriteProductIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)),
        };

      case 'speed_dial':
        if (speedDialItems.length === 0) {
          toast.error('Vui lòng thêm ít nhất 1 nút');
          return null;
        }
        return {
          items: speedDialItems.map(item => ({
            iconType: item.iconType,
            iconUrl: item.iconUrl || null,
            label: item.label,
            href: item.href,
            target: item.target,
          })),
        };

      default:
        toast.error('Loại component không hợp lệ');
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!componentId) return;

    const config = buildConfig();
    if (!config) return;

    setIsSubmitting(true);
    try {
      const data: Record<string, unknown> = {
        type: componentType,
        config,
        active,
      };

      const result = await updateHomeComponent(componentId, data);
      
      if (result.success) {
        toast.success(result.message || 'Cập nhật thành phần thành công');
        // Reload component data thay vì redirect
        await loadComponent(componentId);
      }
    } catch (error) {
      console.error('Failed to update component:', error);
      toast.error('Không thể cập nhật thành phần. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <div className="p-6 space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/admin/home-components">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa thành phần</h1>
            {typeInfo && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <typeInfo.icon size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">{typeInfo.label}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {typeInfo ? typeInfo.description : 'Cập nhật cấu hình thành phần trang chủ'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="p-6 space-y-6">
            {typeInfo && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <typeInfo.icon size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{typeInfo.label}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">{typeInfo.description}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300"
              />
              <Label htmlFor="active" className="cursor-pointer">
                Hiển thị trên trang chủ
              </Label>
            </div>
          </div>
        </Card>

        {componentType === 'hero_carousel' && (
          <>
            <HeroCarouselForm slides={heroSlides} onChange={setHeroSlides} />
            <HeroCarouselPreview slides={heroSlides.map(s => ({ id: s.id, image: s.image, link: s.link, alt: s.alt }))} />
          </>
        )}

        {componentType === 'dual_banner' && (
          <>
            <DualBannerForm banners={dualBanners} onChange={setDualBanners} />
            <DualBannerPreview banners={dualBanners.map(b => ({ id: b.id, image: b.image, path: b.path, link: b.link, alt: b.alt }))} />
          </>
        )}

        {componentType === 'category_grid' && (
          <>
            <CategoryGridForm categories={categories} onChange={setCategories} />
            <CategoryGridPreview categories={categories.map(c => ({ id: c.id, title: c.title, href: c.href, image: c.image, path: c.path }))} />
          </>
        )}

        {componentType === 'brand_showcase' && (
          <>
            <BrandShowcaseForm
              title={brandTitle}
              brands={brands}
              onTitleChange={setBrandTitle}
              onBrandsChange={setBrands}
            />
            <BrandShowcasePreview title={brandTitle} brands={brands.map(b => ({ id: b.id, image: b.image, path: b.path, href: b.href, alt: b.alt }))} />
          </>
        )}

        {componentType === 'collection_showcase' && (
          <>
            <CollectionShowcaseForm
              title={collectionTitle}
              subtitle={collectionSubtitle}
              ctaLabel={collectionCtaLabel}
              ctaHref={collectionCtaHref}
              productIds={collectionProductIds}
              onTitleChange={setCollectionTitle}
              onSubtitleChange={setCollectionSubtitle}
              onCtaLabelChange={setCollectionCtaLabel}
              onCtaHrefChange={setCollectionCtaHref}
              onProductIdsChange={setCollectionProductIds}
            />
            <CollectionShowcasePreview
              title={collectionTitle}
              subtitle={collectionSubtitle}
              productIds={collectionProductIds}
            />
          </>
        )}

        {componentType === 'editorial_spotlight' && (
          <>
            <EditorialSpotlightForm
              label={editorialLabel}
              title={editorialTitle}
              description={editorialDescription}
              articleIds={editorialArticleIds}
              onLabelChange={setEditorialLabel}
              onTitleChange={setEditorialTitle}
              onDescriptionChange={setEditorialDescription}
              onArticleIdsChange={setEditorialArticleIds}
            />
            <EditorialSpotlightPreview
              label={editorialLabel}
              title={editorialTitle}
              description={editorialDescription}
              articleIds={editorialArticleIds}
            />
          </>
        )}

        {componentType === 'favourite_products' && (
          <>
            <FavouriteProductsForm
              title={favouriteTitle}
              subtitle={favouriteSubtitle}
              productIds={favouriteProductIds}
              onTitleChange={setFavouriteTitle}
              onSubtitleChange={setFavouriteSubtitle}
              onProductIdsChange={setFavouriteProductIds}
            />
            <FavouriteProductsPreview
              title={favouriteTitle}
              subtitle={favouriteSubtitle}
              productIds={favouriteProductIds}
            />
          </>
        )}

        {componentType === 'speed_dial' && (
          <SpeedDialForm items={speedDialItems} onChange={setSpeedDialItems} />
        )}

        <div className="flex justify-end gap-3">
          <Link href="/admin/home-components">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Hủy
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
