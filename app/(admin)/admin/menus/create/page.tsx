 'use client';
 
 import React, { useState } from 'react';
 import Link from 'next/link';
 import { useRouter } from 'next/navigation';
 import { Loader2, ArrowLeft } from 'lucide-react';
 import { Button, Card, Input, Label } from '../../components/ui';
 import { createMenu } from '@/lib/api/admin';
 import { toast } from 'sonner';
 
 export default function MenuCreatePage() {
   const router = useRouter();
   const [isSubmitting, setIsSubmitting] = useState(false);
 
   const [title, setTitle] = useState('');
   const [type, setType] = useState('');
   const [href, setHref] = useState('');
   const [order, setOrder] = useState('');
   const [active, setActive] = useState(true);
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
 
     if (!title.trim()) {
       toast.error('Vui lòng nhập tiêu đề menu');
       return;
     }
 
     setIsSubmitting(true);
     try {
       const data: Record<string, unknown> = {
         title: title.trim(),
         active,
       };
 
       if (type.trim()) data.type = type.trim();
       if (href.trim()) data.href = href.trim();
       if (order) data.order = parseInt(order);
 
       const result = await createMenu(data);
 
       if (result.success) {
         toast.success(result.message || 'Tạo menu thành công');
         router.push(`/admin/menus/${result.data.id}/edit`);
       }
     } catch (error) {
       console.error('Failed to create menu:', error);
       toast.error('Không thể tạo menu. Vui lòng thử lại.');
     } finally {
       setIsSubmitting(false);
     }
   };
 
   return (
     <div className="space-y-4">
       <div className="flex items-center gap-4">
         <Link href="/admin/menus">
           <Button variant="outline" size="icon">
             <ArrowLeft size={18} />
           </Button>
         </Link>
         <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thêm menu</h1>
           <p className="text-sm text-slate-500 dark:text-slate-400">Tạo menu điều hướng mới</p>
         </div>
       </div>
 
       <form onSubmit={handleSubmit} className="space-y-6">
         <Card>
           <div className="p-6 space-y-6">
             <div className="space-y-2">
               <Label htmlFor="title">
                 Tiêu đề menu <span className="text-red-500">*</span>
               </Label>
               <Input
                 id="title"
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 placeholder="Menu chính, Footer menu, ..."
                 required
               />
             </div>
 
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="type">Loại menu</Label>
                 <Input
                   id="type"
                   value={type}
                   onChange={(e) => setType(e.target.value)}
                   placeholder="header, footer, sidebar, ..."
                 />
                 <p className="text-xs text-slate-500">Dùng để phân loại và lọc menu</p>
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="order">Thứ tự hiển thị</Label>
                 <Input
                   id="order"
                   type="number"
                   value={order}
                   onChange={(e) => setOrder(e.target.value)}
                   placeholder="0, 1, 2, ..."
                   min="0"
                 />
               </div>
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="href">URL (tùy chọn)</Label>
               <Input
                 id="href"
                 value={href}
                 onChange={(e) => setHref(e.target.value)}
                 placeholder="/san-pham, https://example.com"
               />
               <p className="text-xs text-slate-500">URL đích nếu menu có link trực tiếp</p>
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
                 Hiển thị công khai
               </Label>
             </div>
           </div>
         </Card>
 
         <div className="flex justify-end gap-3">
           <Link href="/admin/menus">
             <Button type="button" variant="outline" disabled={isSubmitting}>
               Hủy
             </Button>
           </Link>
           <Button type="submit" disabled={isSubmitting}>
             {isSubmitting ? (
               <>
                 <Loader2 size={16} className="animate-spin mr-2" />
                 Đang tạo...
               </>
             ) : (
               'Tạo menu'
             )}
           </Button>
         </div>
       </form>
     </div>
   );
 }
