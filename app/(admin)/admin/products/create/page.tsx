 'use client';
 
 import React, { useState, useEffect } from 'react';
 import Link from 'next/link';
 import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Pencil, X } from 'lucide-react';
 import { Button, Card, CardContent, Input, Label, Skeleton } from '../../components/ui';
 import { createProduct } from '@/lib/api/admin';
 import { fetchProductFilters, type ProductFilterOption } from '@/lib/api/products';
import { LexicalEditor } from '../../components/LexicalEditor';
 
 export default function ProductCreatePage() {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [types, setTypes] = useState<ProductFilterOption[]>([]);
   const [categories, setCategories] = useState<ProductFilterOption[]>([]);
 
   const [name, setName] = useState('');
   const [slug, setSlug] = useState('');
   const [price, setPrice] = useState('');
   const [originalPrice, setOriginalPrice] = useState('');
   const [typeId, setTypeId] = useState('');
   const [categoryIds, setCategoryIds] = useState<number[]>([]);
   const [description, setDescription] = useState('');
   const [active, setActive] = useState(true);
  const [showSlugEditor, setShowSlugEditor] = useState(false);
 
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
       });
     }
   }, [typeId]);
 
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
