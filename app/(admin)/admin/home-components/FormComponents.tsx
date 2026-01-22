'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../components/ui';
import { ImageUploadField } from '../components/ImageUploadField';
import { SortableList } from '../components/SortableList';

interface Slide {
  id: number;
  image: string;
  path: string;
  link: string;
  alt: string;
}

interface HeroCarouselFormProps {
  slides: Slide[];
  onChange: (slides: Slide[]) => void;
}

export function HeroCarouselForm({ slides, onChange }: HeroCarouselFormProps) {
  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now(),
      image: '',
      path: '',
      link: '',
      alt: '',
    };
    onChange([...slides, newSlide]);
  };

  const updateSlide = (index: number, field: keyof Slide, value: string) => {
    const updated = slides.map((slide, i) =>
      i === index ? { ...slide, [field]: value } : slide
    );
    onChange(updated);
  };

  const updateSlideImage = (index: number, url: string, path: string) => {
    const updated = slides.map((slide, i) =>
      i === index ? { ...slide, image: url, path } : slide
    );
    onChange(updated);
  };

  const removeSlide = (index: number) => {
    onChange(slides.filter((_, i) => i !== index));
  };

  const removeSlideImage = (index: number) => {
    const updated = slides.map((slide, i) =>
      i === index ? { ...slide, image: '', path: '' } : slide
    );
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Carousel - Slides</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {slides.length > 0 ? (
          <SortableList
            items={slides}
            onChange={onChange}
            renderItem={(slide: Slide, idx: number) => (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Slide {idx + 1}</Label>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeSlide(idx)}
                  >
                    <Trash2 size={14} className="mr-1" />
                    Xóa
                  </Button>
                </div>

                <ImageUploadField
                  label="Hình ảnh slide"
                  value={slide.image}
                  path={slide.path}
                  onChange={(url, path) => updateSlideImage(idx, url, path)}
                  onRemove={() => removeSlideImage(idx)}
                  aspectRatio="21:9"
                  folder="home-components/hero"
                />

                <div className="space-y-2">
                  <Label htmlFor={`link-${idx}`}>Link đích khi click</Label>
                  <Input
                    id={`link-${idx}`}
                    placeholder="/products/special-offer"
                    value={slide.link}
                    onChange={(e) => updateSlide(idx, 'link', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`alt-${idx}`}>Alt text (SEO)</Label>
                  <Input
                    id={`alt-${idx}`}
                    placeholder="Banner khuyến mãi đặc biệt"
                    value={slide.alt}
                    onChange={(e) => updateSlide(idx, 'alt', e.target.value)}
                  />
                </div>
              </div>
            )}
          />
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">
            Chưa có slide nào. Click &quot;Thêm slide&quot; để bắt đầu.
          </p>
        )}

        <Button type="button" onClick={addSlide} className="w-full">
          <Plus size={16} className="mr-2" />
          Thêm slide
        </Button>
      </CardContent>
    </Card>
  );
}

interface DualBannerItem {
  id: number;
  image: string;
  path: string;
  link: string;
  alt: string;
}

interface DualBannerFormProps {
  banners: DualBannerItem[];
  onChange: (banners: DualBannerItem[]) => void;
}

export function DualBannerForm({ banners, onChange }: DualBannerFormProps) {
  const updateBanner = (index: number, field: keyof DualBannerItem, value: string) => {
    const updated = banners.map((banner, i) =>
      i === index ? { ...banner, [field]: value } : banner
    );
    onChange(updated);
  };

  const updateBannerImage = (index: number, url: string, path: string) => {
    const updated = banners.map((banner, i) =>
      i === index ? { ...banner, image: url, path } : banner
    );
    onChange(updated);
  };

  const removeBannerImage = (index: number) => {
    const updated = banners.map((banner, i) =>
      i === index ? { ...banner, image: '', path: '' } : banner
    );
    onChange(updated);
  };

  // Initialize with 2 banners if empty
  React.useEffect(() => {
    if (banners.length === 0) {
      onChange([
        { id: 1, image: '', path: '', link: '', alt: '' },
        { id: 2, image: '', path: '', link: '', alt: '' },
      ]);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dual Banner - 2 Banner ngang nhau</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {banners.slice(0, 2).map((banner, idx) => (
          <div key={banner.id} className="border rounded-lg p-4 space-y-4">
            <Label className="font-semibold">Banner {idx + 1}</Label>

            <ImageUploadField
              label="Hình ảnh banner"
              value={banner.image}
              path={banner.path}
              onChange={(url, path) => updateBannerImage(idx, url, path)}
              onRemove={() => removeBannerImage(idx)}
              aspectRatio="video"
              folder="home-components/banners"
            />

            <div className="space-y-2">
              <Label htmlFor={`banner-link-${idx}`}>Link đích</Label>
              <Input
                id={`banner-link-${idx}`}
                placeholder="/category/wine"
                value={banner.link}
                onChange={(e) => updateBanner(idx, 'link', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`banner-alt-${idx}`}>Alt text (SEO)</Label>
              <Input
                id={`banner-alt-${idx}`}
                placeholder="Banner khuyến mãi rượu vang"
                value={banner.alt}
                onChange={(e) => updateBanner(idx, 'alt', e.target.value)}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface CategoryItem {
  id: number;
  title: string;
  href: string;
  image: string;
  path: string;
}

interface CategoryGridFormProps {
  categories: CategoryItem[];
  onChange: (categories: CategoryItem[]) => void;
}

export function CategoryGridForm({ categories, onChange }: CategoryGridFormProps) {
  const addCategory = () => {
    const newCat: CategoryItem = {
      id: Date.now(),
      title: '',
      href: '',
      image: '',
      path: '',
    };
    onChange([...categories, newCat]);
  };

  const updateCategory = (index: number, field: keyof CategoryItem, value: string) => {
    const updated = categories.map((cat, i) =>
      i === index ? { ...cat, [field]: value } : cat
    );
    onChange(updated);
  };

  const updateCategoryImage = (index: number, url: string, path: string) => {
    const updated = categories.map((cat, i) =>
      i === index ? { ...cat, image: url, path } : cat
    );
    onChange(updated);
  };

  const removeCategory = (index: number) => {
    onChange(categories.filter((_, i) => i !== index));
  };

  const removeCategoryImage = (index: number) => {
    const updated = categories.map((cat, i) =>
      i === index ? { ...cat, image: '', path: '' } : cat
    );
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Grid - Lưới danh mục</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.length > 0 ? (
          <SortableList
            items={categories}
            onChange={onChange}
            renderItem={(cat: CategoryItem, idx: number) => (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Danh mục {idx + 1}</Label>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeCategory(idx)}
                  >
                    <Trash2 size={14} className="mr-1" />
                    Xóa
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`cat-title-${idx}`}>Tên danh mục *</Label>
                  <Input
                    id={`cat-title-${idx}`}
                    placeholder="Rượu Vang Đỏ"
                    value={cat.title}
                    onChange={(e) => updateCategory(idx, 'title', e.target.value)}
                    required
                  />
                </div>

                <ImageUploadField
                  label="Hình ảnh danh mục"
                  value={cat.image}
                  path={cat.path}
                  onChange={(url, path) => updateCategoryImage(idx, url, path)}
                  onRemove={() => removeCategoryImage(idx)}
                  aspectRatio="square"
                  folder="home-components/categories"
                />

                <div className="space-y-2">
                  <Label htmlFor={`cat-href-${idx}`}>Link đích *</Label>
                  <Input
                    id={`cat-href-${idx}`}
                    placeholder="/category/red-wine"
                    value={cat.href}
                    onChange={(e) => updateCategory(idx, 'href', e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
          />
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">
            Chưa có danh mục nào. Click &quot;Thêm danh mục&quot; để bắt đầu.
          </p>
        )}

        <Button type="button" onClick={addCategory} className="w-full">
          <Plus size={16} className="mr-2" />
          Thêm danh mục
        </Button>
      </CardContent>
    </Card>
  );
}

interface BrandItem {
  id: number;
  image: string;
  path: string;
  href: string;
  alt: string;
}

interface BrandShowcaseFormProps {
  title: string;
  brands: BrandItem[];
  onTitleChange: (title: string) => void;
  onBrandsChange: (brands: BrandItem[]) => void;
}

export function BrandShowcaseForm({ title, brands, onTitleChange, onBrandsChange }: BrandShowcaseFormProps) {
  const addBrand = () => {
    const newBrand: BrandItem = {
      id: Date.now(),
      image: '',
      path: '',
      href: '',
      alt: '',
    };
    onBrandsChange([...brands, newBrand]);
  };

  const updateBrand = (index: number, field: keyof BrandItem, value: string) => {
    const updated = brands.map((brand, i) =>
      i === index ? { ...brand, [field]: value } : brand
    );
    onBrandsChange(updated);
  };

  const updateBrandImage = (index: number, url: string, path: string) => {
    const updated = brands.map((brand, i) =>
      i === index ? { ...brand, image: url, path } : brand
    );
    onBrandsChange(updated);
  };

  const removeBrand = (index: number) => {
    onBrandsChange(brands.filter((_, i) => i !== index));
  };

  const removeBrandImage = (index: number) => {
    const updated = brands.map((brand, i) =>
      i === index ? { ...brand, image: '', path: '' } : brand
    );
    onBrandsChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Showcase - Logo thương hiệu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="brand-title">Tiêu đề section *</Label>
          <Input
            id="brand-title"
            placeholder="Thương hiệu đối tác"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            required
          />
        </div>

        <div className="border-t pt-4 space-y-4">
          {brands.length > 0 ? (
            <SortableList
              items={brands}
              onChange={onBrandsChange}
              renderItem={(brand: BrandItem, idx: number) => (
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">Brand {idx + 1}</Label>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeBrand(idx)}
                    >
                      <Trash2 size={14} className="mr-1" />
                      Xóa
                    </Button>
                  </div>

                  <ImageUploadField
                    label="Logo thương hiệu"
                    value={brand.image}
                    path={brand.path}
                    onChange={(url, path) => updateBrandImage(idx, url, path)}
                    onRemove={() => removeBrandImage(idx)}
                    aspectRatio="auto"
                    folder="home-components/brands"
                  />

                  <div className="space-y-2">
                    <Label htmlFor={`brand-href-${idx}`}>Link (optional)</Label>
                    <Input
                      id={`brand-href-${idx}`}
                      placeholder="/brand/moet-chandon"
                      value={brand.href}
                      onChange={(e) => updateBrand(idx, 'href', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`brand-alt-${idx}`}>Tên thương hiệu (Alt text) *</Label>
                    <Input
                      id={`brand-alt-${idx}`}
                      placeholder="Moët & Chandon"
                      value={brand.alt}
                      onChange={(e) => updateBrand(idx, 'alt', e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
            />
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">
              Chưa có thương hiệu nào. Click &quot;Thêm brand&quot; để bắt đầu.
            </p>
          )}

          <Button type="button" onClick={addBrand} className="w-full">
            <Plus size={16} className="mr-2" />
            Thêm brand
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface CollectionShowcaseFormProps {
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  tone: 'wine' | 'spirit' | 'default';
  productIds: string;
  onTitleChange: (title: string) => void;
  onSubtitleChange: (subtitle: string) => void;
  onDescriptionChange: (description: string) => void;
  onCtaLabelChange: (ctaLabel: string) => void;
  onCtaHrefChange: (ctaHref: string) => void;
  onToneChange: (tone: 'wine' | 'spirit' | 'default') => void;
  onProductIdsChange: (productIds: string) => void;
}

export function CollectionShowcaseForm({
  title,
  subtitle,
  description,
  ctaLabel,
  ctaHref,
  tone,
  productIds,
  onTitleChange,
  onSubtitleChange,
  onDescriptionChange,
  onCtaLabelChange,
  onCtaHrefChange,
  onToneChange,
  onProductIdsChange,
}: CollectionShowcaseFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collection Showcase - Bộ sưu tập</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="collection-title">Tiêu đề *</Label>
          <Input
            id="collection-title"
            placeholder="Bộ sưu tập đặc biệt"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="collection-subtitle">Phụ đề</Label>
          <Input
            id="collection-subtitle"
            placeholder="Những chai rượu được lựa chọn kỹ lưỡng"
            value={subtitle}
            onChange={(e) => onSubtitleChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="collection-description">Mô tả</Label>
          <textarea
            id="collection-description"
            placeholder="Khám phá bộ sưu tập rượu vang cao cấp..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="w-full min-h-[100px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-y"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="collection-cta-label">Text nút CTA</Label>
          <Input
            id="collection-cta-label"
            placeholder="Xem thêm"
            value={ctaLabel}
            onChange={(e) => onCtaLabelChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="collection-cta-href">Link CTA</Label>
          <Input
            id="collection-cta-href"
            placeholder="/collections/special"
            value={ctaHref}
            onChange={(e) => onCtaHrefChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="collection-tone">Tone màu sắc</Label>
          <select
            id="collection-tone"
            value={tone}
            onChange={(e) => onToneChange(e.target.value as 'wine' | 'spirit' | 'default')}
            className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
          >
            <option value="default">Default</option>
            <option value="wine">Wine (Đỏ burgundy)</option>
            <option value="spirit">Spirit (Vàng gold)</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="collection-product-ids">Product IDs *</Label>
          <Input
            id="collection-product-ids"
            placeholder="1,2,3,4,5"
            value={productIds}
            onChange={(e) => onProductIdsChange(e.target.value)}
            required
          />
          <p className="text-xs text-slate-500">
            Nhập ID sản phẩm cách nhau bởi dấu phẩy. Backend sẽ tự động fetch thông tin sản phẩm.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface EditorialSpotlightFormProps {
  label: string;
  title: string;
  description: string;
  articleIds: string;
  onLabelChange: (label: string) => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onArticleIdsChange: (articleIds: string) => void;
}

export function EditorialSpotlightForm({
  label,
  title,
  description,
  articleIds,
  onLabelChange,
  onTitleChange,
  onDescriptionChange,
  onArticleIdsChange,
}: EditorialSpotlightFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Editorial Spotlight - Bài viết nổi bật</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="editorial-label">Label phụ</Label>
          <Input
            id="editorial-label"
            placeholder="TIN TỨC"
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editorial-title">Tiêu đề section *</Label>
          <Input
            id="editorial-title"
            placeholder="Khám phá thế giới rượu vang"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editorial-description">Mô tả</Label>
          <textarea
            id="editorial-description"
            placeholder="Những câu chuyện thú vị về rượu vang và văn hóa thưởng thức..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="w-full min-h-[100px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-y"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editorial-article-ids">Article IDs *</Label>
          <Input
            id="editorial-article-ids"
            placeholder="1,2,3"
            value={articleIds}
            onChange={(e) => onArticleIdsChange(e.target.value)}
            required
          />
          <p className="text-xs text-slate-500">
            Nhập ID bài viết cách nhau bởi dấu phẩy. Backend sẽ tự động fetch thông tin bài viết.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface FavouriteProductsFormProps {
  title: string;
  subtitle: string;
  productIds: string;
  onTitleChange: (title: string) => void;
  onSubtitleChange: (subtitle: string) => void;
  onProductIdsChange: (productIds: string) => void;
}

export function FavouriteProductsForm({
  title,
  subtitle,
  productIds,
  onTitleChange,
  onSubtitleChange,
  onProductIdsChange,
}: FavouriteProductsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Favourite Products - Sản phẩm yêu thích</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fav-title">Tiêu đề *</Label>
          <Input
            id="fav-title"
            placeholder="Sản phẩm yêu thích"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fav-subtitle">Phụ đề</Label>
          <Input
            id="fav-subtitle"
            placeholder="Những sản phẩm được khách hàng lựa chọn nhiều nhất"
            value={subtitle}
            onChange={(e) => onSubtitleChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fav-product-ids">Product IDs *</Label>
          <Input
            id="fav-product-ids"
            placeholder="1,2,3,4,5,6"
            value={productIds}
            onChange={(e) => onProductIdsChange(e.target.value)}
            required
          />
          <p className="text-xs text-slate-500">
            Nhập ID sản phẩm cách nhau bởi dấu phẩy. Backend sẽ tự động fetch thông tin sản phẩm.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
