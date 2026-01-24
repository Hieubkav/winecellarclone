'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button, Card, Label } from '../../components/ui';
import { createHomeComponent } from '@/lib/api/admin';
import { toast } from 'sonner';
import { COMPONENT_TYPES, getComponentTypeInfo } from '../componentTypes';
import {
  HeroCarouselForm,
  DualBannerForm,
  CategoryGridForm,
  BrandShowcaseForm,
  CollectionShowcaseForm,
  EditorialSpotlightForm,
  FavouriteProductsForm,
  SpeedDialForm,
} from '../FormComponents';

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

interface SpeedDialItem {
  id: number;
  iconType: 'home' | 'phone' | 'zalo' | 'messenger' | 'custom';
  iconUrl: string;
  label: string;
  href: string;
  target: '_self' | '_blank';
}

export default function HomeComponentCreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedType, setSelectedType] = useState('');
  const [active, setActive] = useState(true);

  const typeInfo = selectedType ? getComponentTypeInfo(selectedType) : null;

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

  // Reset form when type changes
  useEffect(() => {
    // Reset all states
    setHeroSlides([]);
    setDualBanners([]);
    setCategories([]);
    setBrandTitle('');
    setBrands([]);
    setCollectionTitle('');
    setCollectionSubtitle('');
    setCollectionCtaLabel('');
    setCollectionCtaHref('');
    setCollectionProductIds('');
    setEditorialLabel('');
    setEditorialTitle('');
    setEditorialDescription('');
    setEditorialArticleIds('');
    setFavouriteTitle('');
    setFavouriteSubtitle('');
    setFavouriteProductIds('');
    setSpeedDialItems([]);
  }, [selectedType]);

  const buildConfig = (): Record<string, unknown> | null => {
    switch (selectedType) {
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
    
    if (!selectedType.trim()) {
      toast.error('Vui lòng chọn loại thành phần');
      return;
    }

    const config = buildConfig();
    if (!config) return;

    setIsSubmitting(true);
    try {
      const data: Record<string, unknown> = {
        type: selectedType.trim(),
        config,
        active,
      };

      const result = await createHomeComponent(data);
      
      if (result.success) {
        toast.success(result.message || 'Tạo thành phần thành công');
        router.push('/admin/home-components');
      }
    } catch (error) {
      console.error('Failed to create component:', error);
      toast.error('Không thể tạo thành phần. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/admin/home-components">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thêm thành phần trang chủ</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tạo section mới cho trang chủ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="type">
                Loại thành phần <span className="text-red-500">*</span>
              </Label>
              <select
                id="type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Chọn loại component --</option>
                {COMPONENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {typeInfo && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <typeInfo.icon size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{typeInfo.label}</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">{typeInfo.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

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

        {selectedType === 'hero_carousel' && (
          <HeroCarouselForm slides={heroSlides} onChange={setHeroSlides} />
        )}

        {selectedType === 'dual_banner' && (
          <DualBannerForm banners={dualBanners} onChange={setDualBanners} />
        )}

        {selectedType === 'category_grid' && (
          <CategoryGridForm categories={categories} onChange={setCategories} />
        )}

        {selectedType === 'brand_showcase' && (
          <BrandShowcaseForm
            title={brandTitle}
            brands={brands}
            onTitleChange={setBrandTitle}
            onBrandsChange={setBrands}
          />
        )}

        {selectedType === 'collection_showcase' && (
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
        )}

        {selectedType === 'editorial_spotlight' && (
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

        {selectedType === 'favourite_products' && (
          <FavouriteProductsForm
            title={favouriteTitle}
            subtitle={favouriteSubtitle}
            productIds={favouriteProductIds}
            onTitleChange={setFavouriteTitle}
            onSubtitleChange={setFavouriteSubtitle}
            onProductIdsChange={setFavouriteProductIds}
          />
        )}

        {selectedType === 'speed_dial' && (
          <SpeedDialForm items={speedDialItems} onChange={setSpeedDialItems} />
        )}

        <div className="flex justify-end gap-3">
          <Link href="/admin/home-components">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Hủy
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || !selectedType}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Đang tạo...
              </>
            ) : (
              'Tạo thành phần'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
