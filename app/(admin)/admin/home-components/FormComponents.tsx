'use client';

import React from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../components/ui';
import { ImageUploadField } from '../components/ImageUploadField';
import { SortableList } from '../components/SortableList';
import { ProductGridSelector } from '../components/ProductGridSelector';
import { ArticleGridSelector } from '../components/ArticleGridSelector';
import { apiFetch } from '@/lib/api/client';

interface ProductSelectItem {
  value: number;
  label: string;
  price: number;
  cover_image?: {
    id: number;
    url: string;
    alt: string;
  } | null;
}

interface ArticleSelectItem {
  value: number;
  label: string;
  published_at?: string;
  cover_image?: {
    id: number;
    url: string;
    alt: string;
  } | null;
}

// API helper functions
async function fetchProductsForSelect(query: string) {
  const payload = await apiFetch<{ data: ProductSelectItem[] }>(
    `v1/admin/products/list-for-select?q=${encodeURIComponent(query)}&limit=50`,
  );
  return payload.data || [];
}

async function fetchArticlesForSelect(query: string) {
  const payload = await apiFetch<{ data: ArticleSelectItem[] }>(
    `v1/admin/articles/list-for-select?q=${encodeURIComponent(query)}&limit=50`,
  );
  return payload.data || [];
}

interface Slide {
  id: number;
  image: string;
  path: string;
  imageId?: number; // Add image_id field
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

  const updateSlideImage = (index: number, url: string, path: string, imageId?: number) => {
    const updated = slides.map((slide, i) =>
      i === index ? { ...slide, image: url, path, imageId } : slide
    );
    onChange(updated);
  };

  const removeSlide = (index: number) => {
    onChange(slides.filter((_, i) => i !== index));
  };

  const removeSlideImage = (index: number) => {
    const updated = slides.map((slide, i) =>
      i === index ? { ...slide, image: '', path: '', imageId: undefined } : slide
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
                  onChange={(url, path, imageId) => updateSlideImage(idx, url, path, imageId)}
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
  // Debug log
  React.useEffect(() => {
    console.log('DualBannerForm render - banners:', banners);
  }, [banners]);

  const updateBanner = (index: number, field: keyof DualBannerItem, value: string) => {
    const updated = banners.map((banner, i) =>
      i === index ? { ...banner, [field]: value } : banner
    );
    onChange(updated);
  };

  const updateBannerImage = (index: number, url: string, path: string) => {
    console.log('updateBannerImage called:', { index, url, path });
    const updated = banners.map((banner, i) =>
      i === index ? { ...banner, image: url, path } : banner
    );
    console.log('updateBannerImage - updated banners:', updated);
    onChange(updated);
  };

  const removeBannerImage = (index: number) => {
    const updated = banners.map((banner, i) =>
      i === index ? { ...banner, image: '', path: '' } : banner
    );
    onChange(updated);
  };

  // Initialize with 2 banners if empty
  const [isInitialized, setIsInitialized] = React.useState(false);
  
  React.useEffect(() => {
    if (banners.length === 0 && !isInitialized) {
      console.log('DualBannerForm - initializing with empty banners');
      onChange([
        { id: 1, image: '', path: '', link: '', alt: '' },
        { id: 2, image: '', path: '', link: '', alt: '' },
      ]);
      setIsInitialized(true);
    }
  }, [banners.length, isInitialized, onChange]);

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
  // Debug log
  React.useEffect(() => {
    console.log('CategoryGridForm render - categories:', categories);
  }, [categories]);

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
    console.log('updateCategoryImage called:', { index, url, path });
    const updated = categories.map((cat, i) =>
      i === index ? { ...cat, image: url, path } : cat
    );
    console.log('updateCategoryImage - updated categories:', updated);
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
          <div className="space-y-4">
            {/* Grid layout for categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat, idx) => (
                <div key={cat.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
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
              ))}
            </div>

            {/* Note about drag & drop - removed sortable for better UX */}
            <p className="text-xs text-slate-500 italic">
              💡 Tip: Thứ tự hiển thị từ trái sang phải, trên xuống dưới
            </p>
          </div>
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
  imageId?: number;
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
      imageId: undefined,
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

  const updateBrandImage = (index: number, url: string, path: string, imageId?: number) => {
    const updated = brands.map((brand, i) =>
      i === index ? { ...brand, image: url, path, imageId } : brand
    );
    onBrandsChange(updated);
  };

  const removeBrand = (index: number) => {
    onBrandsChange(brands.filter((_, i) => i !== index));
  };

  const removeBrandImage = (index: number) => {
    const updated = brands.map((brand, i) =>
      i === index ? { ...brand, image: '', path: '', imageId: undefined } : brand
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
            <div className="space-y-4">
              {/* Grid layout for brands */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {brands.map((brand, idx) => (
                  <div key={brand.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
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
                      onChange={(url, path, imageId) => updateBrandImage(idx, url, path, imageId)}
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
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-500 italic">
                💡 Tip: Logo sẽ hiển thị theo thứ tự từ trái sang phải
              </p>
            </div>
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
  ctaLabel: string;
  ctaHref: string;
  productIds: string;
  onTitleChange: (title: string) => void;
  onSubtitleChange: (subtitle: string) => void;
  onCtaLabelChange: (ctaLabel: string) => void;
  onCtaHrefChange: (ctaHref: string) => void;
  onProductIdsChange: (productIds: string) => void;
}

export function CollectionShowcaseForm({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  productIds,
  onTitleChange,
  onSubtitleChange,
  onCtaLabelChange,
  onCtaHrefChange,
  onProductIdsChange,
}: CollectionShowcaseFormProps) {
  // Parse productIds string to array
  const productIdsArray = productIds
    ? productIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
    : [];

  const handleProductIdsChange = (ids: number[]) => {
    onProductIdsChange(ids.join(','));
  };

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

        <ProductGridSelector
          label="Sản phẩm"
          value={productIdsArray}
          onChange={handleProductIdsChange}
          fetchProducts={fetchProductsForSelect}
          required
          helpText="Chọn các sản phẩm để hiển thị trong bộ sưu tập này (khuyến nghị 4-8 sản phẩm)"
          maxSelection={8}
        />
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
  const articleIdsArray = articleIds
    ? articleIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
    : [];

  const handleArticleIdsChange = (ids: number[]) => {
    onArticleIdsChange(ids.join(','));
  };

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

        <ArticleGridSelector
          label="Bài viết"
          value={articleIdsArray}
          onChange={handleArticleIdsChange}
          fetchArticles={fetchArticlesForSelect}
          required
          helpText="Chọn các bài viết để hiển thị trong section này (khuyến nghị 3 bài viết)"
          maxSelection={6}
        />
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
  const productIdsArray = productIds
    ? productIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
    : [];

  const handleProductIdsChange = (ids: number[]) => {
    onProductIdsChange(ids.join(','));
  };

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

        <ProductGridSelector
          label="Sản phẩm"
          value={productIdsArray}
          onChange={handleProductIdsChange}
          fetchProducts={fetchProductsForSelect}
          required
          helpText="Chọn các sản phẩm yêu thích để hiển thị (khuyến nghị 6-8 sản phẩm)"
        />
      </CardContent>
    </Card>
  );
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

interface FaqFormProps {
  title: string;
  eyebrow: string;
  items: FaqItem[];
  onTitleChange: (title: string) => void;
  onEyebrowChange: (eyebrow: string) => void;
  onItemsChange: (items: FaqItem[]) => void;
}

export function FaqForm({ title, eyebrow, items, onTitleChange, onEyebrowChange, onItemsChange }: FaqFormProps) {
  const addItem = () => {
    onItemsChange([
      ...items,
      {
        id: Date.now(),
        question: '',
        answer: '',
      },
    ]);
  };

  const updateItem = (index: number, field: keyof FaqItem, value: string) => {
    const updated = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    onItemsChange(updated);
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>FAQ - Câu hỏi thường gặp</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="faq-title">Tiêu đề section *</Label>
          <Input
            id="faq-title"
            placeholder="NHỮNG CÂU HỎI THƯỜNG GẶP"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            required
          />
          <p className="text-xs text-slate-500">Dùng làm tiêu đề hiển thị giữa hai đường kẻ trang trí.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="faq-eyebrow">Nhãn phụ</Label>
          <Input
            id="faq-eyebrow"
            placeholder="CÓ THỂ ĐỂ TRỐNG ĐỂ DÙNG TIÊU ĐỀ"
            value={eyebrow}
            onChange={(e) => onEyebrowChange(e.target.value)}
          />
        </div>

        {items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ChevronDown size={18} className="text-slate-400" />
                    <Label className="font-semibold">Câu hỏi {idx + 1}</Label>
                  </div>
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(idx)}>
                    <Trash2 size={14} className="mr-1" />
                    Xóa
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor={`faq-question-${idx}`}>Câu hỏi *</Label>
                    <Input
                      id={`faq-question-${idx}`}
                      placeholder="Địa chỉ các cửa hàng của WINECELLAR.vn ở đâu?"
                      value={item.question}
                      onChange={(e) => updateItem(idx, 'question', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`faq-answer-${idx}`}>Câu trả lời *</Label>
                    <textarea
                      id={`faq-answer-${idx}`}
                      placeholder="Nhập câu trả lời chi tiết..."
                      value={item.answer}
                      onChange={(e) => updateItem(idx, 'answer', e.target.value)}
                      className="w-full min-h-[140px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-y"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">
            Chưa có câu hỏi nào. Click &quot;Thêm câu hỏi&quot; để bắt đầu.
          </p>
        )}

        <Button type="button" onClick={addItem} className="w-full">
          <Plus size={16} className="mr-2" />
          Thêm câu hỏi
        </Button>
      </CardContent>
    </Card>
  );
}

interface SpeedDialItem {
  id: number;
  iconType: 'home' | 'phone' | 'zalo' | 'messenger' | 'custom';
  iconUrl: string;
  label: string;
  href: string;
  target: '_self' | '_blank';
}

interface SpeedDialFormProps {
  items: SpeedDialItem[];
  onChange: (items: SpeedDialItem[]) => void;
}

export function SpeedDialForm({ items, onChange }: SpeedDialFormProps) {
  const addItem = () => {
    const newItem: SpeedDialItem = {
      id: Date.now(),
      iconType: 'phone',
      iconUrl: '',
      label: '',
      href: '',
      target: '_self',
    };
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof SpeedDialItem, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  const updateItemImage = (index: number, url: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, iconUrl: url } : item
    );
    onChange(updated);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const removeItemImage = (index: number) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, iconUrl: '' } : item
    );
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Speed Dial - Nút liên hệ nhanh</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Desktop:</strong> Hiển thị dọc bên phải màn hình
            <br />
            <strong>Mobile:</strong> Hiển thị thanh ngang ở dưới cùng
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item, idx) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Nút {idx + 1}</Label>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(idx)}
                  >
                    <Trash2 size={14} className="mr-1" />
                    Xóa
                  </Button>
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`dial-label-${idx}`}>Tên nút *</Label>
                  <Input
                    id={`dial-label-${idx}`}
                    placeholder="Hotline"
                    value={item.label}
                    onChange={(e) => updateItem(idx, 'label', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`dial-href-${idx}`}>Link đích *</Label>
                  <Input
                    id={`dial-href-${idx}`}
                    placeholder="tel:0946698008"
                    value={item.href}
                    onChange={(e) => updateItem(idx, 'href', e.target.value)}
                    required
                  />
                  <p className="text-xs text-slate-500">
                    VD: tel:0123456789, https://zalo.me/...
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor={`dial-target-${idx}`}>Target</Label>
                    <select
                      id={`dial-target-${idx}`}
                      value={item.target}
                      onChange={(e) => updateItem(idx, 'target', e.target.value as '_self' | '_blank')}
                      className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    >
                      <option value="_self">Mở cùng tab (_self)</option>
                      <option value="_blank">Mở tab mới (_blank)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={`dial-icon-type-${idx}`}>Loại icon</Label>
                    <select
                      id={`dial-icon-type-${idx}`}
                      value={item.iconType}
                      onChange={(e) => updateItem(idx, 'iconType', e.target.value)}
                      className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    >
                      <option value="home">Trang chủ (Home)</option>
                      <option value="phone">Điện thoại (Phone)</option>
                      <option value="zalo">Zalo</option>
                      <option value="messenger">Messenger</option>
                      <option value="custom">Custom (upload ảnh)</option>
                    </select>
                  </div>
                </div>

                {item.iconType === 'custom' && (
                  <ImageUploadField
                    label="Icon custom"
                    value={item.iconUrl}
                    path={item.iconUrl}
                    onChange={(url) => updateItemImage(idx, url)}
                    onRemove={() => removeItemImage(idx)}
                    aspectRatio="square"
                    folder="home-components/speed-dial"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">
            Chưa có nút nào. Click &quot;Thêm nút&quot; để bắt đầu.
          </p>
        )}

        <Button type="button" onClick={addItem} className="w-full">
          <Plus size={16} className="mr-2" />
          Thêm nút
        </Button>
      </CardContent>
    </Card>
  );
}
