 'use client';
 
import React, { useState, useEffect, useCallback } from 'react';
 import Link from 'next/link';
 import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Pencil, X, ImageIcon, Trash2 } from 'lucide-react';
 import { Button, Card, CardContent, Input, Label, Skeleton } from '../../components/ui';
import { createProduct } from '@/lib/api/admin';
import { API_BASE_URL } from '@/lib/api/client';
import { fetchProductFilters, type ProductFilterOption, type AttributeFilter } from '@/lib/api/products';
import { LexicalEditor } from '../../components/LexicalEditor';

 export default function ProductCreatePage() {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [types, setTypes] = useState<ProductFilterOption[]>([]);
   const [categories, setCategories] = useState<ProductFilterOption[]>([]);
 
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
 
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [coverImagePath, setCoverImagePath] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedTermIds, setSelectedTermIds] = useState<Record<string, number[]>>({});
   useEffect(() => {
     async function loadFilters() {
       try {
         const filters = await fetchProductFilters();
         setTypes(filters.types);
         setCategories(filters.categories);
       } catch (error) {
         console.error('Failed to load filters:', error);
       } finally {
         setIsLoading(false);
       }
     }
     loadFilters();
   }, []);
 
   useEffect(() => {
     if (typeId) {
       fetchProductFilters(Number(typeId)).then(filters => {
         setCategories(filters.categories);
        setAttributeFilters(filters.attribute_filters || []);
        setSelectedTermIds({});
       });
    } else {
      setAttributeFilters([]);
      setSelectedTermIds({});
     }
   }, [typeId]);
 
  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui long chon file hinh anh');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Kich thuoc file khong duoc vuot qua 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
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
        setCoverImageUrl(result.data.url);
        setCoverImagePath(result.data.path);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Khong the tai anh len');
    } finally {
      setIsUploadingImage(false);
    }
  }, []);

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

   const generateSlug = (text: string) => {
     return text
       .toLowerCase()
       .normalize('NFD')
       .replace(/[\u0300-\u036f]/g, '')
       .replace(/đ/g, 'd')
       .replace(/[^a-z0-9\s-]/g, '')
       .replace(/\s+/g, '-')
       .replace(/-+/g, '-')
       .trim();
   };
 
   const handleNameChange = (value: string) => {
     setName(value);
     if (!slug || slug === generateSlug(name)) {
       setSlug(generateSlug(value));
     }
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!name.trim()) {
       alert('Vui lòng nhập tên sản phẩm');
       return;
     }
 
     setIsSubmitting(true);
     try {
       const data = {
         name: name.trim(),
         slug: slug.trim() || generateSlug(name),
         price: price ? Number(price) : null,
         original_price: originalPrice ? Number(originalPrice) : null,
         type_id: typeId ? Number(typeId) : null,
         category_ids: categoryIds,
         description: description.trim(),
         active,
        cover_image_path: coverImagePath,
        term_ids: Object.values(selectedTermIds).flat(),
       };
 
       const result = await createProduct(data);
       if (result.success) {
         router.push('/admin/products');
       }
     } catch (error) {
       console.error('Failed to create product:', error);
       alert('Tạo sản phẩm thất bại. Vui lòng thử lại.');
     } finally {
       setIsSubmitting(false);
     }
   };
 
   if (isLoading) {
     return (
       <div className="max-w-3xl mx-auto space-y-6">
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
 
   return (
     <div className="max-w-3xl mx-auto space-y-6 pb-20">
       <div className="flex items-center gap-4">
         <Link href="/admin/products">
           <Button variant="ghost" size="icon">
             <ArrowLeft size={20} />
           </Button>
         </Link>
         <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thêm sản phẩm mới</h1>
           <p className="text-sm text-slate-500">Điền thông tin để tạo sản phẩm</p>
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
                   onChange={(e) => handleNameChange(e.target.value)}
                 />
               </div>
             </div>

            <div className="space-y-2">
              <Label>Ảnh đại diện</Label>
              <div className="flex items-center gap-4">
                {coverImageUrl ? (
                  <div className="relative group">
                    <img
                      src={coverImageUrl.startsWith('/') ? `${API_BASE_URL.replace('/api', '')}${coverImageUrl}` : coverImageUrl}
                      alt="Cover"
                      className="w-24 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => { setCoverImageUrl(null); setCoverImagePath(null); }}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      disabled={isUploadingImage}
                    />
                    {isUploadingImage ? (
                      <Loader2 size={24} className="animate-spin text-slate-400" />
                    ) : (
                      <>
                        <ImageIcon size={24} className="text-slate-400 mb-1" />
                        <span className="text-xs text-slate-400">Upload</span>
                      </>
                    )}
                  </label>
                )}
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
                      {slug || generateSlug(name) || 'ten-san-pham'}
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
                   type="number"
                   placeholder="0"
                   value={price}
                   onChange={(e) => setPrice(e.target.value)}
                 />
               </div>
               <div className="space-y-2">
                 <Label>Giá gốc (VND)</Label>
                 <Input
                   type="number"
                   placeholder="0"
                   value={originalPrice}
                   onChange={(e) => setOriginalPrice(e.target.value)}
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

            {/* Attribute Groups - show when type is selected */}
            {attributeFilters.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Label className="text-base font-medium">Thuộc tính sản phẩm</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attributeFilters.map(group => (
                    <div key={group.code} className="space-y-2">
                      <Label className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        {group.icon_url && (
                          <img src={group.icon_url} alt="" className="w-4 h-4" />
                        )}
                        {group.name}
                        {group.filter_type === 'chon_don' && (
                          <span className="text-xs text-slate-400">(chọn 1)</span>
                        )}
                      </Label>
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
                    </div>
                  ))}
                </div>
              </div>
            )}
 
             <div className="space-y-2">
               <Label>Mô tả</Label>
              <LexicalEditor
                onChange={setDescription}
                initialContent={description}
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
               Tạo sản phẩm
             </Button>
           </div>
        </Card>
      </form>
     </div>
   );
 }
