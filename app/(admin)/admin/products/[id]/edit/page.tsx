 'use client';
 
 import React, { useState, useEffect, use, useCallback, useRef } from 'react';
 import Image from 'next/image';
 import Link from 'next/link';
 import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Pencil, X, ImageIcon, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
 import { Button, Card, CardContent, Input, Label, Skeleton } from '../../../components/ui';
 import { fetchAdminProduct, updateProduct } from '@/lib/api/admin';
 import { API_BASE_URL } from '@/lib/api/client';
 import { fetchProductFilters, type ProductFilterOption, type AttributeFilter } from '@/lib/api/products';
import { LexicalEditor } from '../../../components/LexicalEditor';
import { toast } from 'sonner';

const formatNumberInput = (value: string) => {
  const digits = value.replace(/[^0-9]/g, '');
  if (!digits) return '';
  return new Intl.NumberFormat('en-US').format(Number(digits));
};

const parseNumberValue = (value: string) => (value ? Number(value.replace(/,/g, '')) : null);
 
 export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
   const { id } = use(params);
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [types, setTypes] = useState<ProductFilterOption[]>([]);
   const [categories, setCategories] = useState<ProductFilterOption[]>([]);
   const [notFound, setNotFound] = useState(false);
  const [attributeFilters, setAttributeFilters] = useState<AttributeFilter[]>([]);
 
   const [name, setName] = useState('');
   const [slug, setSlug] = useState('');
   const [price, setPrice] = useState('');
   const [originalPrice, setOriginalPrice] = useState('');
   const [typeId, setTypeId] = useState('');
   const [categoryIds, setCategoryIds] = useState<number[]>([]);
   const [description, setDescription] = useState('');
   const [active, setActive] = useState(true);
  const [showSlugEditor, setShowSlugEditor] = useState(false);
  const [initialDescription, setInitialDescription] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [galleryImages, setGalleryImages] = useState<{ url: string; path: string }[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [selectedTermIds, setSelectedTermIds] = useState<Record<string, number[]>>({});
  const [manualAttributes, setManualAttributes] = useState<Record<string, string>>({});
  const didSyncTypeRef = useRef(false);
 
   useEffect(() => {
     async function loadData() {
       try {
         const [productRes, filtersRes] = await Promise.all([
           fetchAdminProduct(Number(id)),
           fetchProductFilters(),
         ]);
 
         const product = productRes.data;
         setName(product.name);
         setSlug(product.slug);
        setPrice(formatNumberInput(product.price?.toString() || ''));
        setOriginalPrice(formatNumberInput(product.original_price?.toString() || ''));
         setTypeId(product.type_id?.toString() || '');
         setCategoryIds(product.category_ids || []);
         setDescription(product.description || '');
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
 
         setTypes(filtersRes.types);
 
        const baseFilters = product.type_id
          ? await fetchProductFilters(product.type_id)
          : filtersRes;

        setCategories(baseFilters.categories);
        setAttributeFilters(baseFilters.attribute_filters || []);

        const termIds = (product.term_ids || []) as number[];
        const nextSelectedTermIds: Record<string, number[]> = {};
        const nextManualAttributes: Record<string, string> = {};

        (baseFilters.attribute_filters || []).forEach(group => {
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
       } catch (error) {
         console.error('Failed to load product:', error);
         setNotFound(true);
       } finally {
         setIsLoading(false);
       }
     }
     loadData();
   }, [id]);
 
  useEffect(() => {
    if (isLoading) return;
    if (!didSyncTypeRef.current) {
      didSyncTypeRef.current = true;
      return;
    }

    if (typeId) {
      fetchProductFilters(Number(typeId)).then(filters => {
        setCategories(filters.categories);
        setAttributeFilters(filters.attribute_filters || []);
        setSelectedTermIds({});
        setManualAttributes({});
      });
      return;
    }

    setAttributeFilters([]);
    setSelectedTermIds({});
    setManualAttributes({});
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

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'products');

    const response = await fetch(`${API_BASE_URL}/v1/admin/upload/image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');

    const result = await response.json();
    if (result.success && result.data) {
      return { url: result.data.url as string, path: result.data.path as string };
    }

    return null;
  }, []);

  const handleGalleryUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const uploads = Array.from(files).map((file) => uploadSingleImage(file));
      const results = await Promise.all(uploads);
      const nextImages = results.filter((item): item is { url: string; path: string } => Boolean(item));
      if (nextImages.length > 0) {
        setGalleryImages(prev => [...prev, ...nextImages]);
        toast.success(`Đã tải lên ${nextImages.length} ảnh`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Không thể tải ảnh lên');
    } finally {
      setIsUploadingImage(false);
    }
  }, [uploadSingleImage]);

  const handleUrlUpload = useCallback(async () => {
    const url = imageUrlInput.trim();
    if (!url) return;

    setIsUploadingImage(true);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/admin/upload/image-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, folder: 'products' }),
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      if (result.success && result.data) {
        setGalleryImages(prev => [...prev, { url: result.data.url, path: result.data.path }]);
        setImageUrlInput('');
        toast.success('Đã tải ảnh từ URL');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Không thể tải ảnh từ URL');
    } finally {
      setIsUploadingImage(false);
    }
  }, [imageUrlInput]);

  const handleReplaceFromUrl = useCallback(async (index: number, url: string) => {
    if (!url) return;

    setIsUploadingImage(true);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/admin/upload/image-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, folder: 'products' }),
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      if (result.success && result.data) {
        setGalleryImages(prev => prev.map((img, i) => (i === index ? result.data : img)));
        toast.success('Đã thay thế ảnh');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Không thể tải ảnh từ URL');
    } finally {
      setIsUploadingImage(false);
    }
  }, []);

  const handleReplaceFile = useCallback(async (index: number, file: File | null) => {
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const uploaded = await uploadSingleImage(file);
      if (uploaded) {
        setGalleryImages(prev => prev.map((img, i) => (i === index ? uploaded : img)));
        toast.success('Đã thay thế ảnh');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Không thể tải ảnh lên');
    } finally {
      setIsUploadingImage(false);
    }
  }, [uploadSingleImage]);

  const handleDropFiles = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files?.length) {
      handleGalleryUpload(event.dataTransfer.files);
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

  const handleTermChange = (groupCode: string, termId: number, filterType: string) => {
    setSelectedTermIds(prev => {
      const current = prev[groupCode] || [];
      if (filterType === 'chon_don') {
        return { ...prev, [groupCode]: current.includes(termId) ? [] : [termId] };
      }
      if (current.includes(termId)) {
        return { ...prev, [groupCode]: current.filter(id => id !== termId) };
      }
      return { ...prev, [groupCode]: [...current, termId] };
    });
  };

  const handleManualAttributeChange = (groupCode: string, value: string) => {
    setManualAttributes(prev => ({ ...prev, [groupCode]: value }));
  };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!name.trim()) {
       toast.error('Vui lòng nhập tên sản phẩm');
       return;
     }
 
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
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">
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
 
       <form onSubmit={handleSubmit}>
         <Card>
           <CardContent className="p-6 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Tên sản phẩm <span className="text-red-500">*</span></Label>
                 <Input
                   required
                   placeholder="Nhập tên sản phẩm..."
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                 />
               </div>
             </div>

            <div className="space-y-2">
              <Label>Ảnh sản phẩm</Label>
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
                        src={image.url.startsWith('/') ? `${API_BASE_URL.replace('/api', '')}${image.url}` : image.url}
                        alt={`Gallery ${index + 1}`}
                        width={80}
                        height={80}
                        sizes="80px"
                        className="w-20 h-20 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                      />
                      {index === 0 && (
                        <span className="absolute left-1 top-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white">
                          Ảnh chính
                        </span>
                      )}
                      <div className="absolute inset-x-1 bottom-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                              handleReplaceFromUrl(index, url.trim());
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
                  <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleGalleryUpload(e.target.files)}
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

            {attributeFilters.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Label className="text-base font-medium">Thuộc tính sản phẩm</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attributeFilters.map(group => (
                    <div key={group.code} className="space-y-2">
                      <Label className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        {(() => {
                          const iconName = group.icon_name || group.icon_url?.split('/').pop();
                          const IconComponent = iconName && (LucideIcons as any)[iconName]
                            ? (LucideIcons as any)[iconName]
                            : null;
                          return IconComponent ? <IconComponent className="w-4 h-4 text-red-500" /> : null;
                        })()}
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
                        <div className="flex flex-wrap gap-2">
                          {group.options.map(option => {
                            const isSelected = (selectedTermIds[group.code] || []).includes(option.id);
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => handleTermChange(group.code, option.id, group.filter_type)}
                                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                  isSelected
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-blue-400'
                                }`}
                              >
                                {option.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
 
             <div className="flex items-center gap-2">
               <input
                 type="checkbox"
                 id="active"
                 checked={active}
                 onChange={(e) => setActive(e.target.checked)}
                 className="h-4 w-4 rounded border-slate-300"
               />
               <Label htmlFor="active">Hiển thị sản phẩm</Label>
             </div>
           </CardContent>
 
           <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg flex justify-end gap-3">
             <Link href="/admin/products">
               <Button type="button" variant="ghost">Hủy bỏ</Button>
             </Link>
             <Button type="submit" disabled={isSubmitting}>
               {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
               Lưu thay đổi
             </Button>
           </div>
        </Card>
      </form>
     </div>
   );
 }
