'use client';

import React, { useState, useEffect, use, useCallback, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Loader2, ArrowLeft, Pencil, X, ImageIcon, Trash2, ExternalLink, Eye, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import Image from 'next/image';
import DynamicIcon from '@/components/shared/DynamicIcon';
import { Button, Card, CardContent, Input, Label, Skeleton } from '../../../components/ui';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ProductImageCropModal } from '../../../components/ProductImageCropModal';
import { AttributeCombobox } from '../../../components/AttributeCombobox';
import { fetchAdminProduct, updateProduct } from '@/features/admin/products/api/products.api';
import { uploadProductImage, uploadProductImageUrl } from '@/features/admin/products/api/products.uploads';
import { fetchAdminSettingsLite } from '@/features/admin/settings/api/settings.api';
import { getImageUrl } from '@/lib/utils/image';
import { stripHtmlTags } from '@/lib/utils/article-content';
import { fetchProductFilters, type ProductFilterOption, type AttributeFilter } from '@/lib/api/products';
import {
  PRODUCT_IMAGE_OUTPUT_LABEL,
  PRODUCT_IMAGE_PREVIEW_SIZE,
  PRODUCT_IMAGE_RATIO_LABEL,
  PRODUCT_IMAGE_CROP_RATIO,
} from '@/lib/constants/product-image';
import { toast } from 'sonner';
import { useAdminLayout } from '../../../AdminLayoutContext';

const IMAGE_RATIO_TOLERANCE = 0.01;

const getImageSizeFromFile = (file: File): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    image.src = objectUrl;
  });

const LexicalEditor = dynamic(
  () => import('../../../components/LexicalEditor').then((mod) => mod.LexicalEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
    ),
  }
);

const formatNumberInput = (value: string) => {
  const digits = value.replace(/[^0-9]/g, '');
  if (!digits) return '';
  return new Intl.NumberFormat('en-US').format(Number(digits));
};

const parseNumberValue = (value: string) => (value ? Number(value.replace(/,/g, '')) : null);

const truncateText = (value: string, maxLength: number) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength).trim();
};

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};
 
 export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
   const { id } = use(params);
   const [isLoading, setIsLoading] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [types, setTypes] = useState<ProductFilterOption[]>([]);
  const [categories, setCategories] = useState<ProductFilterOption[]>([]);
  const [siteName, setSiteName] = useState('Thiên Kim Wine');
   const [notFound, setNotFound] = useState(false);
  const [attributeFilters, setAttributeFilters] = useState<AttributeFilter[]>([]);
 
   const [name, setName] = useState('');
   const [slug, setSlug] = useState('');
   const [price, setPrice] = useState('');
   const [originalPrice, setOriginalPrice] = useState('');
  const [shopeeUrl, setShopeeUrl] = useState('');
   const [typeId, setTypeId] = useState('');
   const [categoryIds, setCategoryIds] = useState<number[]>([]);
   const [description, setDescription] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
   const [active, setActive] = useState(true);
  const [showSlugEditor, setShowSlugEditor] = useState(false);
  const [initialDescription, setInitialDescription] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [galleryImages, setGalleryImages] = useState<{ url: string; path: string }[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState('');
  const [cropTargetIndex, setCropTargetIndex] = useState<number | null>(null);
  const cropUrlRef = useRef<string | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isNameCopied, setIsNameCopied] = useState(false);
  const { isSidebarCollapsed } = useAdminLayout();
  const previewSize = PRODUCT_IMAGE_PREVIEW_SIZE;
  const [selectedTermIds, setSelectedTermIds] = useState<Record<string, number[]>>({});
  const [manualAttributes, setManualAttributes] = useState<Record<string, string>>({});
  const [productShopeeLinkEnabled, setProductShopeeLinkEnabled] = useState(false);
  const didSyncTypeRef = useRef(false);
  const currentFiltersTypeRef = useRef<number | null>(null);
  const productDataRef = useRef<Awaited<ReturnType<typeof fetchAdminProduct>>['data'] | null>(null);
  const [isAttributeLoading, setIsAttributeLoading] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const syncFiltersWithProduct = useCallback(
    (
      filters: Awaited<ReturnType<typeof fetchProductFilters>>,
      product: Awaited<ReturnType<typeof fetchAdminProduct>>['data']
    ) => {
      setCategories(filters.categories);
      setAttributeFilters(filters.attribute_filters || []);

      const termIds = (product.term_ids || []) as number[];
      const nextSelectedTermIds: Record<string, number[]> = {};
      const nextManualAttributes: Record<string, string> = {};

      (filters.attribute_filters || []).forEach(group => {
        if (group.filter_type === 'nhap_tay' || group.filter_type === 'range') {
          const extraAttr = product.extra_attrs?.[group.code];
          if (extraAttr?.value !== undefined && extraAttr?.value !== null) {
            nextManualAttributes[group.code] = String(extraAttr.value);
          }
          return;
        }

        const selected = group.options
          .map(option => option.id)
          .filter(optionId => termIds.includes(optionId));

        if (selected.length > 0) {
          nextSelectedTermIds[group.code] = selected;
        }
      });

      setSelectedTermIds(nextSelectedTermIds);
      setManualAttributes(nextManualAttributes);
    },
    []
  );
 
   useEffect(() => {
    async function loadData() {
      let product: Awaited<ReturnType<typeof fetchAdminProduct>>['data'] | null = null;
       try {
       const [productRes, settingsRes, baseFilters] = await Promise.all([
           fetchAdminProduct(Number(id)),
           fetchAdminSettingsLite().catch(() => null),
           fetchProductFilters().catch(() => null),
         ]);

        product = productRes.data;
         setName(product.name);
         setSlug(product.slug);
        setPrice(formatNumberInput(product.price?.toString() || ''));
        setOriginalPrice(formatNumberInput(product.original_price?.toString() || ''));
         setTypeId(product.type_id?.toString() || '');
         setCategoryIds(product.category_ids || []);
         setDescription(product.description || '');
        setMetaTitle(product.meta_title || '');
        setMetaDescription(product.meta_description || '');
        setShopeeUrl(product.shopee_url || '');
        setInitialDescription(product.description || '');
         setActive(product.active);
        setGalleryImages(
          (product.images || [])
            .map((image: { url?: string | null; path?: string | null }) => ({
              url: image.url || '',
              path: image.path || '',
            }))
            .filter((image: { url: string; path: string }) => image.url && image.path)
        );
 
         setTypes(baseFilters?.types ?? []);
        setCategories(baseFilters?.categories ?? []);
        setAttributeFilters([]);
        setProductShopeeLinkEnabled(Boolean(settingsRes?.data.product_shopee_link_enabled));
        const resolvedSiteName = (settingsRes?.data as { site_name?: string } | null)?.site_name?.trim();
        setSiteName(resolvedSiteName || 'Thiên Kim Wine');
        currentFiltersTypeRef.current = null;
        productDataRef.current = product;
        didSyncTypeRef.current = false;
        setIsAttributeLoading(Boolean(product.type_id));
       } catch (error) {
         console.error('Failed to load product:', error);
         setNotFound(true);
       } finally {
         setIsLoading(false);
       }
     }
     void loadData();
   }, [id]);
 
  useEffect(() => {
    if (isLoading) return;
    if (typeId) {
      const nextTypeId = Number(typeId);
      if (currentFiltersTypeRef.current === nextTypeId) {
        return;
      }

      setIsAttributeLoading(true);
      void fetchProductFilters(nextTypeId)
        .then(filters => {
          setCategories(filters.categories);
          setAttributeFilters(filters.attribute_filters || []);

          if (!didSyncTypeRef.current && productDataRef.current) {
            syncFiltersWithProduct(filters, productDataRef.current);
            didSyncTypeRef.current = true;
          } else {
            setSelectedTermIds({});
            setManualAttributes({});
          }

          currentFiltersTypeRef.current = nextTypeId;
        })
        .finally(() => {
          setIsAttributeLoading(false);
        });
      return;
    }

    setAttributeFilters([]);
    setSelectedTermIds({});
    setManualAttributes({});
    currentFiltersTypeRef.current = null;
    didSyncTypeRef.current = false;
    productDataRef.current = null;
    setIsAttributeLoading(false);
  }, [typeId, isLoading]);

  const uploadSingleImage = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return null;
    }

    return uploadProductImage(file);
  }, []);

  const isMatchingProductImageRatio = useCallback(async (file: File) => {
    try {
      const { width, height } = await getImageSizeFromFile(file);
      if (!width || !height) return false;
      const ratio = width / height;
      return Math.abs(ratio - PRODUCT_IMAGE_CROP_RATIO) <= IMAGE_RATIO_TOLERANCE;
    } catch (error) {
      console.error('Image ratio check failed:', error);
      return false;
    }
  }, []);

  const uploadDirectImage = useCallback(async (file: File, targetIndex?: number) => {
    try {
      const uploaded = await uploadSingleImage(file);
      if (!uploaded) return null;

      if (typeof targetIndex === 'number') {
        setGalleryImages(prev => prev.map((img, i) => (i === targetIndex ? uploaded : img)));
        toast.success('Đã thay thế ảnh');
      } else {
        setGalleryImages(prev => [...prev, uploaded]);
        toast.success('Đã tải ảnh lên');
      }

      return uploaded;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Không thể tải ảnh lên');
      return null;
    }
  }, [uploadSingleImage]);

  const uploadDirectImageWithLoading = useCallback(async (file: File, targetIndex?: number) => {
    setIsUploadingImage(true);
    try {
      await uploadDirectImage(file, targetIndex);
    } finally {
      setIsUploadingImage(false);
    }
  }, [uploadDirectImage]);

  const openCropWithFile = useCallback((file: File, targetIndex?: number) => {
    if (cropUrlRef.current) {
      URL.revokeObjectURL(cropUrlRef.current);
      cropUrlRef.current = null;
    }
    const objectUrl = URL.createObjectURL(file);
    cropUrlRef.current = objectUrl;
    setCropSource(objectUrl);
    setCropFileName(file.name);
    setCropTargetIndex(typeof targetIndex === 'number' ? targetIndex : null);
  }, []);

  const closeCrop = useCallback(() => {
    if (cropUrlRef.current) {
      URL.revokeObjectURL(cropUrlRef.current);
      cropUrlRef.current = null;
    }
    setCropSource(null);
    setCropFileName('');
    setCropTargetIndex(null);
  }, []);

  useEffect(() => {
    if (cropSource || cropQueue.length === 0) return;
    const [nextFile, ...rest] = cropQueue;
    setCropQueue(rest);
    openCropWithFile(nextFile);
  }, [cropQueue, cropSource, openCropWithFile]);

  useEffect(() => {
    if (previewIndex === null) return;
    if (galleryImages.length === 0) {
      setPreviewIndex(null);
      return;
    }
    if (previewIndex >= galleryImages.length) {
      setPreviewIndex(galleryImages.length - 1);
    }
  }, [galleryImages.length, previewIndex]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCroppedUpload = useCallback(async (file: File) => {
    if (isUploadingImage) return;
    const targetIndex = typeof cropTargetIndex === 'number' ? cropTargetIndex : undefined;
    await uploadDirectImageWithLoading(file, targetIndex);
    closeCrop();
  }, [closeCrop, cropTargetIndex, isUploadingImage, uploadDirectImageWithLoading]);

  const handleCopyName = useCallback(async () => {
    const text = name.trim();
    if (!text) {
      toast.error('Chưa có tên sản phẩm để copy');
      return;
    }
    if (!navigator?.clipboard?.writeText) {
      toast.error('Trình duyệt không hỗ trợ copy nhanh');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setIsNameCopied(true);
      toast.success('Đã copy tên sản phẩm');
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setIsNameCopied(false), 1500);
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Copy thất bại, vui lòng thử lại');
    }
  }, [name]);

  const handleGalleryUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const cropCandidates: File[] = [];
    let didUpload = false;

    for (const file of Array.from(files)) {
      const matchesRatio = await isMatchingProductImageRatio(file);
      if (!matchesRatio) {
        cropCandidates.push(file);
        continue;
      }

      if (!didUpload) {
        setIsUploadingImage(true);
        didUpload = true;
      }

      await uploadDirectImage(file);
    }

    if (didUpload) {
      setIsUploadingImage(false);
    }

    if (cropCandidates.length > 0) {
      setCropQueue(prev => [...prev, ...cropCandidates]);
    }
  }, [isMatchingProductImageRatio, uploadDirectImage]);

  const handleUrlUpload = useCallback(async () => {
    const url = imageUrlInput.trim();
    if (!url) return;

    setIsUploadingImage(true);
    try {
      const uploaded = await uploadProductImageUrl(url);
      if (!uploaded) {
        toast.error('Không thể tải ảnh từ URL.');
        return;
      }

      setGalleryImages(prev => [...prev, uploaded]);
      setImageUrlInput('');
      toast.success('Đã nhập ảnh từ URL');
    } catch (error) {
      console.error('Upload error:', error);
      const message = error instanceof Error ? error.message : 'Không thể tải ảnh từ URL.';
      toast.error(message);
    } finally {
      setIsUploadingImage(false);
    }
  }, [imageUrlInput]);

  const handleReplaceFromUrl = useCallback(async (index: number, url: string) => {
    if (!url) return;

    setIsUploadingImage(true);
    try {
      const uploaded = await uploadProductImageUrl(url);
      if (!uploaded) {
        toast.error('Không thể tải ảnh từ URL.');
        return;
      }

      setGalleryImages(prev => prev.map((img, i) => (i === index ? uploaded : img)));
      toast.success('Đã thay thế ảnh');
    } catch (error) {
      console.error('Upload error:', error);
      const message = error instanceof Error ? error.message : 'Không thể tải ảnh từ URL.';
      toast.error(message);
    } finally {
      setIsUploadingImage(false);
    }
  }, []);

  const handleReplaceFile = useCallback(async (index: number, file: File | null) => {
    if (!file) return;
    const matchesRatio = await isMatchingProductImageRatio(file);

    if (matchesRatio) {
      await uploadDirectImageWithLoading(file, index);
      return;
    }

    openCropWithFile(file, index);
  }, [isMatchingProductImageRatio, openCropWithFile, uploadDirectImageWithLoading]);

  const handleDropFiles = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files?.length) {
      void handleGalleryUpload(event.dataTransfer.files);
    }
  }, [handleGalleryUpload]);

  const handleReorder = useCallback((targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }

    setGalleryImages(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
  }, [dragIndex]);

  const buildMetaTitle = (productName: string, resolvedSiteName: string) =>
    `${productName} | Giá tốt chính hãng | ${resolvedSiteName}`;

  const handleManualAttributeChange = (groupCode: string, value: string) => {
    setManualAttributes(prev => ({ ...prev, [groupCode]: value }));
  };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!name.trim()) {
       toast.error('Vui lòng nhập tên sản phẩm');
       return;
     }

    const resolvedMetaTitleSource = metaTitle.trim()
      ? metaTitle.trim()
      : buildMetaTitle(name.trim(), siteName);
    const resolvedMetaTitle = truncateText(resolvedMetaTitleSource, 60);
    const resolvedMetaDescription = truncateText(
      metaDescription.trim() || stripHtmlTags(description || ''),
      160
    );
 
     setIsSubmitting(true);
     try {
      const extraAttrs = attributeFilters
        .filter(group => group.filter_type === 'nhap_tay' || group.filter_type === 'range')
        .reduce<Record<string, { label: string; value: string | number; type: string }>>((acc, group) => {
          const value = manualAttributes[group.code];
          if (value === undefined || value === '') {
            return acc;
          }
          const type = group.input_type || 'text';
          acc[group.code] = {
            label: group.name,
            value: type === 'number' ? Number(value) : value,
            type,
          };
          return acc;
        }, {});

       const data = {
         name: name.trim(),
         slug: slug.trim(),
        price: parseNumberValue(price),
        original_price: parseNumberValue(originalPrice),
         type_id: typeId ? Number(typeId) : null,
         category_ids: categoryIds,
         description: description.trim(),
        meta_title: resolvedMetaTitle || null,
        meta_description: resolvedMetaDescription || null,
       shopee_url: shopeeUrl.trim() || null,
         active,
        image_paths: galleryImages.map(image => image.path),
        extra_attrs: Object.keys(extraAttrs).length > 0 ? extraAttrs : null,
        term_ids: Object.values(selectedTermIds).flat(),
       };
 
       const result = await updateProduct(Number(id), data);
       if (result.success) {
         toast.success('Đã lưu thay đổi thành công');
       }
     } catch (error) {
       console.error('Failed to update product:', error);
       toast.error('Cập nhật sản phẩm thất bại. Vui lòng thử lại.');
     } finally {
       setIsSubmitting(false);
     }
   };
 
   if (isLoading) {
     return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
         <Skeleton className="h-8 w-48" />
         <Card>
           <CardContent className="p-6 space-y-4">
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-32 w-full" />
           </CardContent>
         </Card>
       </div>
     );
   }
 
   if (notFound) {
     return (
       <div className="text-center py-12">
         <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
           Không tìm thấy sản phẩm
         </h2>
         <p className="text-slate-500 mb-4">Sản phẩm này có thể đã bị xóa hoặc không tồn tại.</p>
         <Link href="/admin/products">
           <Button>Quay lại danh sách</Button>
         </Link>
       </div>
     );
   }
 
   return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-28">
       <div className="flex flex-wrap items-center justify-between gap-4">
         <div className="flex items-center gap-4">
           <Link href="/admin/products">
             <Button variant="ghost" size="icon">
               <ArrowLeft size={20} />
             </Button>
           </Link>
           <div>
             <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa sản phẩm</h1>
             <p className="text-sm text-slate-500">Cập nhật thông tin sản phẩm</p>
           </div>
         </div>
       </div>
 
       <form onSubmit={handleSubmit}>
         <Card>
           <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tên sản phẩm <span className="text-red-500">*</span></Label>
                <div className="flex items-center gap-2">
                  <Input
                    required
                    placeholder="Nhập tên sản phẩm..."
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!showSlugEditor) {
                        setSlug(generateSlug(e.target.value));
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyName}
                    disabled={!name.trim()}
                    title="Copy tên sản phẩm"
                  >
                    {isNameCopied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ảnh sản phẩm</Label>
              <p className="text-xs text-slate-500">Khuyến nghị ảnh {PRODUCT_IMAGE_RATIO_LABEL} ({PRODUCT_IMAGE_OUTPUT_LABEL}), chai nằm giữa khung.</p>
              <p className="text-xs text-slate-500">Kéo thả để sắp xếp. Ảnh đầu tiên là ảnh chính.</p>
              <div
                onDrop={handleDropFiles}
                onDragOver={(e) => e.preventDefault()}
                className="rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 p-3"
              >
                <div className="flex flex-wrap gap-3">
                  {galleryImages.map((image, index) => (
                    <div
                      key={`${image.path}-${index}`}
                      draggable
                      onDragStart={() => setDragIndex(index)}
                      onDragEnd={() => setDragIndex(null)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleReorder(index);
                      }}
                      className="relative group cursor-move"
                    >
                      <Image
                        src={getImageUrl(image.url)}
                        alt={`Gallery ${index + 1}`}
                        width={previewSize}
                        height={previewSize}
                        sizes={`${previewSize}px`}
                        priority={index === 0}
                        fetchPriority={index === 0 ? 'high' : 'auto'}
                        className="object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                        style={{ width: previewSize, height: previewSize }}
                      />
                      {index === 0 && (
                        <span className="absolute left-1 top-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white">
                          Ảnh chính
                        </span>
                      )}
                      <div className="absolute inset-x-1 bottom-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setPreviewIndex(index)}
                          className="text-[10px] px-2 py-1 rounded bg-white/90 text-slate-700 flex items-center gap-1"
                        >
                          <Eye size={12} />
                          Xem
                        </button>
                        <label className="text-[10px] px-2 py-1 rounded bg-white/90 text-slate-700 cursor-pointer">
                          Đổi ảnh
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleReplaceFile(index, e.target.files?.[0] || null)}
                            disabled={isUploadingImage}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const url = window.prompt('Nhập URL ảnh mới');
                            if (url) {
                              void handleReplaceFromUrl(index, url.trim());
                            }
                          }}
                          className="text-[10px] px-2 py-1 rounded bg-white/90 text-slate-700"
                        >
                          Đổi URL
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <label
                    className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                    style={{ width: previewSize, height: previewSize }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => void handleGalleryUpload(e.target.files)}
                      disabled={isUploadingImage}
                    />
                    {isUploadingImage ? (
                      <Loader2 size={20} className="animate-spin text-slate-400" />
                    ) : (
                      <>
                        <ImageIcon size={20} className="text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-400">Thêm</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Dán URL ảnh..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleUrlUpload}
                  disabled={isUploadingImage || !imageUrlInput.trim()}
                >
                  Thêm URL
                </Button>
              </div>
            </div>

            {/* Slug - hidden by default */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-slate-500 text-xs">Slug:</Label>
                {showSlugEditor ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      className="h-8 text-sm flex-1"
                      placeholder="ten-san-pham"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSlugEditor(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">
                      {slug || 'ten-san-pham'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSlugEditor(true)}
                      className="text-slate-400 hover:text-blue-600"
                      title="Chỉnh sửa slug"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
 
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Giá bán (VND)</Label>
                 <Input
                   type="text"
                   inputMode="numeric"
                   pattern="[0-9,]*"
                   placeholder="0"
                   value={price}
                   onChange={(e) => setPrice(formatNumberInput(e.target.value))}
                 />
               </div>
               <div className="space-y-2">
                 <Label>Giá gốc (VND)</Label>
                 <Input
                   type="text"
                   inputMode="numeric"
                   pattern="[0-9,]*"
                   placeholder="0"
                   value={originalPrice}
                   onChange={(e) => setOriginalPrice(formatNumberInput(e.target.value))}
                 />
               </div>
             </div>

            {productShopeeLinkEnabled && (
              <div className="space-y-2">
                <Label htmlFor="shopeeUrl">Link Shopee</Label>
                <Input
                  id="shopeeUrl"
                  type="url"
                  placeholder="https://shopee.vn/..."
                  value={shopeeUrl}
                  onChange={(e) => setShopeeUrl(e.target.value)}
                />
                <p className="text-xs text-slate-500">Hiển thị nút “Xem sản phẩm ở Shopee” trên trang chi tiết.</p>
              </div>
            )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Phân loại</Label>
                 <select
                   className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                   value={typeId}
                   onChange={(e) => {
                     setTypeId(e.target.value);
                     setCategoryIds([]);
                   }}
                 >
                   <option value="">Chọn phân loại...</option>
                   {types.map(t => (
                     <option key={t.id} value={t.id}>{t.name}</option>
                   ))}
                 </select>
               </div>
               <div className="space-y-2">
                 <Label>Danh mục</Label>
                 <select
                   className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                   value={categoryIds[0] || ''}
                   onChange={(e) => setCategoryIds(e.target.value ? [Number(e.target.value)] : [])}
                 >
                   <option value="">Chọn danh mục...</option>
                   {categories.map(c => (
                     <option key={c.id} value={c.id}>{c.name}</option>
                   ))}
                 </select>
               </div>
             </div>

            {(attributeFilters.length > 0 || isAttributeLoading) && (
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Label className="text-base font-medium">Thuộc tính sản phẩm</Label>
                {isAttributeLoading && attributeFilters.length === 0 ? (
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="h-4 w-40 rounded bg-slate-200" />
                    <div className="h-4 w-56 rounded bg-slate-200" />
                    <p>Đang tải thuộc tính theo loại sản phẩm...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attributeFilters.map(group => (
                      <div key={group.code} className="space-y-2">
                        <Label className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <DynamicIcon
                            iconUrl={group.icon_url ? getImageUrl(group.icon_url) : null}
                            iconName={group.icon_name}
                            size={16}
                            className="w-4 h-4 text-red-500"
                            imageClassName="w-4 h-4"
                          />
                          {group.name}
                          {group.filter_type === 'chon_don' && (
                            <span className="text-xs text-slate-400">(chọn 1)</span>
                          )}
                          {(group.filter_type === 'range' || group.filter_type === 'nhap_tay') && group.input_type === 'number' && (
                            <span className="text-xs text-slate-400">({group.filter_type === 'range' ? 'khoảng giá trị' : 'nhập số'})</span>
                          )}
                        </Label>
                        {(group.filter_type === 'nhap_tay' || group.filter_type === 'range') && group.input_type ? (
                          <Input
                            type={group.input_type === 'number' ? 'number' : 'text'}
                            placeholder={group.input_type === 'number' ? '0' : 'Nhập giá trị'}
                            min={group.input_type === 'number' ? 0 : undefined}
                            step={group.input_type === 'number' ? 'any' : undefined}
                            value={manualAttributes[group.code] || ''}
                            onChange={(e) => handleManualAttributeChange(group.code, e.target.value)}
                          />
                        ) : (
                          <AttributeCombobox
                            options={group.options}
                            selectedIds={selectedTermIds[group.code] || []}
                            single={group.filter_type === 'chon_don'}
                            placeholder="Gõ để tìm..."
                            onChange={(nextIds) =>
                              setSelectedTermIds(prev => ({
                                ...prev,
                                [group.code]: nextIds,
                              }))
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
 
             <div className="space-y-2">
               <Label>Mô tả</Label>
              <LexicalEditor
                onChange={setDescription}
                initialContent={initialDescription}
                folder="products"
                placeholder="Nhập mô tả sản phẩm..."
               />
             </div>
 
           </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">SEO</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Meta Title</Label>
                <span className={`text-xs ${metaTitle.length > 60 ? 'text-red-500' : 'text-slate-400'}`}>
                  {metaTitle.length}/60
                </span>
              </div>
              <Input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Để trống sẽ tự điền: {Tên sản phẩm} | Giá tốt chính hãng | {Tên website}"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Meta Description</Label>
                <span className={`text-xs ${metaDescription.length > 160 ? 'text-red-500' : 'text-slate-400'}`}>
                  {metaDescription.length}/160
                </span>
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full min-h-[90px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                placeholder="Lấy theo mô tả sản phẩm nếu bạn để trống"
              />
            </div>
            <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm">
              <div className="text-blue-600 font-medium truncate">
                {metaTitle.trim() || name.trim() || 'Tên sản phẩm'}
              </div>
              <div className="text-emerald-600 text-xs">
                /san-pham/{slug || 'san-pham'}
              </div>
              <div className="text-slate-600 text-xs mt-1 line-clamp-2">
                {metaDescription.trim()
                  || truncateText(stripHtmlTags(description || ''), 160)
                  || 'Mô tả ngắn sẽ hiển thị tại đây.'}
              </div>
            </div>
          </CardContent>
        </Card>

        <div
          className="fixed bottom-0 right-0 left-0 lg:left-[var(--admin-sidebar-offset)] z-30 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur"
          style={{
            ['--admin-sidebar-offset' as string]: isSidebarCollapsed ? '80px' : '280px',
          }}
        >
          <div className="w-full px-3 sm:px-4 lg:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-2">
                <Link href="/admin/products">
                  <Button type="button" variant="ghost">Hủy bỏ</Button>
                </Link>
                {slug ? (
                  <Link href={`/san-pham/${slug}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" aria-label="Xem trên web">
                      <ExternalLink size={16} />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="icon" aria-label="Xem trên web" disabled>
                    <ExternalLink size={16} />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <Label htmlFor="active">Hiển thị</Label>
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <ProductImageCropModal
        open={Boolean(cropSource)}
        src={cropSource || ''}
        fileName={cropFileName}
        onCancel={closeCrop}
        onConfirm={handleCroppedUpload}
        isProcessing={isUploadingImage}
      />

      <Dialog open={previewIndex !== null} onOpenChange={(open) => !open && setPreviewIndex(null)}>
        <DialogContent className="w-[92vw] max-w-4xl p-4 sm:p-6">
          <DialogTitle className="sr-only">Xem ảnh sản phẩm</DialogTitle>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {previewIndex !== null ? `Ảnh ${previewIndex + 1} / ${galleryImages.length}` : ''}
            </span>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label="Đóng preview">
                <X size={18} />
              </Button>
            </DialogClose>
          </div>
          <div className="mt-4 flex items-center justify-center">
            {previewIndex !== null && galleryImages[previewIndex] && (
              <Image
                src={getImageUrl(galleryImages[previewIndex].url)}
                alt={`Preview ${previewIndex + 1}`}
                width={960}
                height={960}
                sizes="(max-width: 768px) 90vw, 800px"
                className="max-h-[70vh] w-auto rounded-lg object-contain"
              />
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPreviewIndex((prev) => (prev === null ? null : Math.max(prev - 1, 0)))}
              disabled={previewIndex === null || previewIndex === 0}
              aria-label="Ảnh trước"
            >
              <ChevronLeft size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setPreviewIndex((prev) =>
                  prev === null ? null : Math.min(prev + 1, galleryImages.length - 1)
                )
              }
              disabled={previewIndex === null || previewIndex === galleryImages.length - 1}
              aria-label="Ảnh sau"
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
     </div>
   );
 }
