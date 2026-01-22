 'use client';
 
 import React, { useState, useEffect, useCallback } from 'react';
 import Link from 'next/link';
 import { useRouter, useParams } from 'next/navigation';
 import { Loader2, ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
 import { Button, Card, Input, Label, Badge, Skeleton } from '../../../components/ui';
 import {
   fetchAdminMenu,
   updateMenu,
   createMenuBlock,
   deleteMenuBlock,
   createMenuBlockItem,
   deleteMenuBlockItem,
   type AdminMenuDetail,
 } from '@/lib/api/admin';
 import { toast } from 'sonner';
 
 export default function MenuEditPage() {
   const router = useRouter();
   const params = useParams();
   const menuId = parseInt(params.id as string);
 
   const [isLoading, setIsLoading] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [menu, setMenu] = useState<AdminMenuDetail | null>(null);
 
   const [title, setTitle] = useState('');
   const [type, setType] = useState('');
   const [href, setHref] = useState('');
   const [order, setOrder] = useState('');
   const [active, setActive] = useState(true);
 
   const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
 
   const loadMenu = useCallback(async () => {
     setIsLoading(true);
     try {
       const res = await fetchAdminMenu(menuId);
       const data = res.data;
       setMenu(data);
 
       setTitle(data.title);
       setType(data.type || '');
       setHref(data.href || '');
       setOrder(String(data.order));
       setActive(data.active);
 
       setExpandedBlocks(new Set(data.blocks.map(b => b.id)));
     } catch (error) {
       console.error('Failed to load menu:', error);
       toast.error('Không thể tải menu');
       router.push('/admin/menus');
     } finally {
       setIsLoading(false);
     }
   }, [menuId, router]);
 
   useEffect(() => {
     loadMenu();
   }, [loadMenu]);
 
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
         type: type.trim() || null,
         href: href.trim() || null,
         order: parseInt(order) || 0,
         active,
       };
 
       const result = await updateMenu(menuId, data);
       if (result.success) {
         toast.success(result.message || 'Cập nhật thành công');
       }
     } catch (error) {
       console.error('Failed to update menu:', error);
       toast.error('Không thể cập nhật menu');
     } finally {
       setIsSubmitting(false);
     }
   };
 
   const toggleBlock = (blockId: number) => {
     setExpandedBlocks(prev => {
       const next = new Set(prev);
       if (next.has(blockId)) {
         next.delete(blockId);
       } else {
         next.add(blockId);
       }
       return next;
     });
   };
 
   const handleAddBlock = async () => {
     const blockTitle = prompt('Nhập tên block:');
     if (!blockTitle?.trim()) return;
 
     try {
       const result = await createMenuBlock(menuId, { title: blockTitle.trim() });
       if (result.success) {
         toast.success('Thêm block thành công');
         loadMenu();
       }
     } catch (error) {
       console.error('Failed to create block:', error);
       toast.error('Không thể thêm block');
     }
   };
 
   const handleDeleteBlock = async (blockId: number) => {
     if (!confirm('Xóa block này và tất cả items bên trong?')) return;
 
     try {
       await deleteMenuBlock(menuId, blockId);
       toast.success('Xóa block thành công');
       loadMenu();
     } catch (error) {
       console.error('Failed to delete block:', error);
       toast.error('Không thể xóa block');
     }
   };
 
   const handleAddItem = async (blockId: number) => {
     const label = prompt('Nhập tên item:');
     if (!label?.trim()) return;
 
     const itemHref = prompt('Nhập URL (có thể để trống):') || '';
 
     try {
       const result = await createMenuBlockItem(blockId, {
         label: label.trim(),
         href: itemHref.trim() || null,
       });
       if (result.success) {
         toast.success('Thêm item thành công');
         loadMenu();
       }
     } catch (error) {
       console.error('Failed to create item:', error);
       toast.error('Không thể thêm item');
     }
   };
 
   const handleDeleteItem = async (blockId: number, itemId: number) => {
     if (!confirm('Xóa item này?')) return;
 
     try {
       await deleteMenuBlockItem(blockId, itemId);
       toast.success('Xóa item thành công');
       loadMenu();
     } catch (error) {
       console.error('Failed to delete item:', error);
       toast.error('Không thể xóa item');
     }
   };
 
   if (isLoading) {
     return (
       <div className="space-y-4">
         <div className="flex items-center gap-4">
           <Skeleton className="h-10 w-10" />
           <div>
             <Skeleton className="h-8 w-48 mb-2" />
             <Skeleton className="h-4 w-32" />
           </div>
         </div>
         <Card>
           <div className="p-6 space-y-4">
             {[1, 2, 3].map(i => (
               <Skeleton key={i} className="h-12 w-full" />
             ))}
           </div>
         </Card>
       </div>
     );
   }
 
   return (
     <div className="space-y-4">
       <div className="flex items-center gap-4">
         <Link href="/admin/menus">
           <Button variant="outline" size="icon">
             <ArrowLeft size={18} />
           </Button>
         </Link>
         <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa menu</h1>
           <p className="text-sm text-slate-500 dark:text-slate-400">{menu?.title}</p>
         </div>
       </div>
 
       {/* Menu Info Form */}
       <form onSubmit={handleSubmit}>
         <Card>
           <div className="p-4 border-b border-slate-100 dark:border-slate-800">
             <h2 className="font-semibold text-slate-900 dark:text-slate-100">Thông tin menu</h2>
           </div>
           <div className="p-6 space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="title">
                   Tiêu đề <span className="text-red-500">*</span>
                 </Label>
                 <Input
                   id="title"
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   required
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="type">Loại menu</Label>
                 <Input
                   id="type"
                   value={type}
                   onChange={(e) => setType(e.target.value)}
                   placeholder="header, footer, ..."
                 />
               </div>
             </div>
 
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="href">URL</Label>
                 <Input
                   id="href"
                   value={href}
                   onChange={(e) => setHref(e.target.value)}
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="order">Thứ tự</Label>
                 <Input
                   id="order"
                   type="number"
                   value={order}
                   onChange={(e) => setOrder(e.target.value)}
                   min="0"
                 />
               </div>
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
           <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
             <Button type="submit" disabled={isSubmitting} className="gap-2">
               {isSubmitting ? (
                 <>
                   <Loader2 size={16} className="animate-spin" />
                   Đang lưu...
                 </>
               ) : (
                 <>
                   <Save size={16} />
                   Lưu thay đổi
                 </>
               )}
             </Button>
           </div>
         </Card>
       </form>
 
       {/* Blocks & Items */}
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <div>
             <h2 className="font-semibold text-slate-900 dark:text-slate-100">Menu Blocks</h2>
             <p className="text-sm text-slate-500">Quản lý các nhóm và liên kết trong menu</p>
           </div>
           <Button variant="outline" size="sm" onClick={handleAddBlock} className="gap-2">
             <Plus size={14} />
             Thêm block
           </Button>
         </div>
 
         <div className="divide-y divide-slate-100 dark:divide-slate-800">
           {menu?.blocks.length === 0 && (
             <div className="p-8 text-center text-slate-500">
               Chưa có block nào. Nhấn &quot;Thêm block&quot; để bắt đầu.
             </div>
           )}
 
           {menu?.blocks.map((block) => (
             <div key={block.id} className="bg-white dark:bg-slate-900">
               {/* Block Header */}
               <div
                 className="p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                 onClick={() => toggleBlock(block.id)}
               >
                 <GripVertical size={16} className="text-slate-400" />
                 {expandedBlocks.has(block.id) ? (
                   <ChevronDown size={16} className="text-slate-400" />
                 ) : (
                   <ChevronRight size={16} className="text-slate-400" />
                 )}
                 <div className="flex-1">
                   <span className="font-medium text-slate-900 dark:text-slate-100">{block.title}</span>
                   <span className="ml-2 text-sm text-slate-500">({block.items.length} items)</span>
                 </div>
                 <Badge variant={block.active ? 'success' : 'secondary'} className="text-xs">
                   {block.active ? 'Hiển thị' : 'Ẩn'}
                 </Badge>
                 <Button
                   variant="ghost"
                   size="icon"
                   className="text-red-600 hover:text-red-700 h-8 w-8"
                   onClick={(e) => {
                     e.stopPropagation();
                     handleDeleteBlock(block.id);
                   }}
                 >
                   <Trash2 size={14} />
                 </Button>
               </div>
 
               {/* Block Items */}
               {expandedBlocks.has(block.id) && (
                 <div className="pl-12 pr-4 pb-4 space-y-2">
                   {block.items.map((item) => (
                     <div
                       key={item.id}
                       className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                     >
                       <GripVertical size={14} className="text-slate-400" />
                       <div className="flex-1 min-w-0">
                         <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                           {item.label}
                         </p>
                         {item.href && (
                           <p className="text-xs text-slate-500 truncate">{item.href}</p>
                         )}
                       </div>
                       {item.badge && (
                         <Badge variant="warning" className="text-xs">{item.badge}</Badge>
                       )}
                       <Button
                         variant="ghost"
                         size="icon"
                         className="text-red-600 hover:text-red-700 h-7 w-7"
                         onClick={() => handleDeleteItem(block.id, item.id)}
                       >
                         <Trash2 size={12} />
                       </Button>
                     </div>
                   ))}
 
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => handleAddItem(block.id)}
                     className="gap-2 w-full mt-2"
                   >
                     <Plus size={14} />
                     Thêm item
                   </Button>
                 </div>
               )}
             </div>
           ))}
         </div>
       </Card>
     </div>
   );
 }
