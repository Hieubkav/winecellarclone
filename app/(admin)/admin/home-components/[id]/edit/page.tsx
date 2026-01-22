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
} from '../../FormComponents';

interface HeroSlide {
  id: number;
  image: string;
  path: string;
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
  href: string;
  alt: string;
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
  const [collectionDescription, setCollectionDescription] = useState('');
  const [collectionCtaLabel, setCollectionCtaLabel] = useState('');
  const [collectionCtaHref, setCollectionCtaHref] = useState('');
  const [collectionTone, setCollectionTone] = useState<'wine' | 'spirit' | 'default'>('default');
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

  useEffect(() => {
    params.then(p => {
      const id = parseInt(p.id);
      setComponentId(id);
      loadComponent(id);
    });
  }, []);

  const parseConfig = (type: string, config: any) => {
    try {
      switch (type) {
        case 'hero_carousel':
          if (config.slides && Array.isArray(config.slides)) {
            setHeroSlides(config.slides.map((slide: any, idx: number) => ({
              id: Date.now() + idx,
              image: slide.image?.url || '',
              path: slide.image?.url || '',
              link: slide.href || '',
              alt: slide.alt || '',
            })));
          }
          break;

        case 'dual_banner':
          if (config.banners && Array.isArray(config.banners)) {
            setDualBanners(config.banners.slice(0, 2).map((banner: any, idx: number) => ({
              id: idx + 1,
              image: banner.image?.url || '',
              path: banner.image?.url || '',
              link: banner.href || '',
              alt: banner.alt || '',
            })));
          }
          break;

        case 'category_grid':
          if (config.categories && Array.isArray(config.categories)) {
            setCategories(config.categories.map((cat: any, idx: number) => ({
              id: Date.now() + idx,
              title: cat.title || '',
              href: cat.href || '',
              image: cat.image?.url || '',
              path: cat.image?.url || '',
            })));
          }
          break;

        case 'brand_showcase':
          setBrandTitle(config.title || '');
          if (config.brands && Array.isArray(config.brands)) {
            setBrands(config.brands.map((brand: any, idx: number) => ({
              id: Date.now() + idx,
              image: brand.image?.url || '',
              path: brand.image?.url || '',
              href: brand.href || '',
              alt: brand.alt || '',
            })));
          }
          break;

        case 'collection_showcase':
          setCollectionTitle(config.title || '');
          setCollectionSubtitle(config.subtitle || '');
          setCollectionDescription(config.description || '');
          setCollectionCtaLabel(config.ctaLabel || '');
          setCollectionCtaHref(config.ctaHref || '');
          setCollectionTone(config.tone || 'default');
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
            image: { id: 0, url: slide.image, alt: slide.alt },
            href: slide.link,
            alt: slide.alt,
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
            image: { id: 0, url: brand.image, alt: brand.alt },
            href: brand.href || null,
            alt: brand.alt,
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
          description: collectionDescription || null,
          ctaLabel: collectionCtaLabel || null,
          ctaHref: collectionCtaHref || null,
          tone: collectionTone,
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
        router.push('/admin/home-components');
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
          <HeroCarouselForm slides={heroSlides} onChange={setHeroSlides} />
        )}

        {componentType === 'dual_banner' && (
          <DualBannerForm banners={dualBanners} onChange={setDualBanners} />
        )}

        {componentType === 'category_grid' && (
          <CategoryGridForm categories={categories} onChange={setCategories} />
        )}

        {componentType === 'brand_showcase' && (
          <BrandShowcaseForm
            title={brandTitle}
            brands={brands}
            onTitleChange={setBrandTitle}
            onBrandsChange={setBrands}
          />
        )}

        {componentType === 'collection_showcase' && (
          <CollectionShowcaseForm
            title={collectionTitle}
            subtitle={collectionSubtitle}
            description={collectionDescription}
            ctaLabel={collectionCtaLabel}
            ctaHref={collectionCtaHref}
            tone={collectionTone}
            productIds={collectionProductIds}
            onTitleChange={setCollectionTitle}
            onSubtitleChange={setCollectionSubtitle}
            onDescriptionChange={setCollectionDescription}
            onCtaLabelChange={setCollectionCtaLabel}
            onCtaHrefChange={setCollectionCtaHref}
            onToneChange={setCollectionTone}
            onProductIdsChange={setCollectionProductIds}
          />
        )}

        {componentType === 'editorial_spotlight' && (
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
        )}

        {componentType === 'favourite_products' && (
          <FavouriteProductsForm
            title={favouriteTitle}
            subtitle={favouriteSubtitle}
            productIds={favouriteProductIds}
            onTitleChange={setFavouriteTitle}
            onSubtitleChange={setFavouriteSubtitle}
            onProductIdsChange={setFavouriteProductIds}
          />
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
