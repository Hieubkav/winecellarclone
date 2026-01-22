 'use client';
 
 import React, { useState } from 'react';
 import { Plus, Edit, Trash2, GripVertical, X } from 'lucide-react';
 import { Button, Card, CardContent, Input, Label } from '../../../components/ui';
 import {
   type AdminCatalogTerm,
   createCatalogTerm,
   updateCatalogTerm,
   deleteCatalogTerm,
   reorderCatalogTerms,
 } from '@/lib/api/admin';
 import { ApiError } from '@/lib/api/client';
 import { toast } from 'sonner';
 
 interface TermsManagerProps {
   groupId: number;
   terms: AdminCatalogTerm[];
   onTermsChange: () => void;
 }
 
 export function TermsManager({ groupId, terms, onTermsChange }: TermsManagerProps) {
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [editingTerm, setEditingTerm] = useState<AdminCatalogTerm | null>(null);
   const [termName, setTermName] = useState('');
   const [termSlug, setTermSlug] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
   const [localTerms, setLocalTerms] = useState(terms);
 
   React.useEffect(() => {
     setLocalTerms(terms);
   }, [terms]);
 
   const openCreateDialog = () => {
     setEditingTerm(null);
     setTermName('');
     setTermSlug('');
     setIsDialogOpen(true);
   };
 
   const openEditDialog = (term: AdminCatalogTerm) => {
     setEditingTerm(term);
     setTermName(term.name);
     setTermSlug(term.slug);
     setIsDialogOpen(true);
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!termName.trim()) {
       toast.error('Vui lòng nhập tên giá trị.');
       return;
     }
 
     setIsSubmitting(true);
     try {
       if (editingTerm) {
         await updateCatalogTerm(editingTerm.id, {
           name: termName.trim(),
           slug: termSlug.trim() || undefined,
         });
         toast.success('Cập nhật giá trị thành công');
       } else {
         await createCatalogTerm({
           group_id: groupId,
           name: termName.trim(),
           slug: termSlug.trim() || undefined,
         });
         toast.success('Tạo giá trị thành công');
       }
       setIsDialogOpen(false);
       onTermsChange();
     } catch (error) {
       console.error('Failed to save term:', error);
       if (error instanceof ApiError && error.payload && typeof error.payload === 'object' && 'message' in error.payload) {
         toast.error(String((error.payload as { message?: string }).message ?? 'Lưu giá trị thất bại.'));
       } else {
         toast.error('Lưu giá trị thất bại.');
       }
     } finally {
       setIsSubmitting(false);
     }
   };
 
   const handleDelete = async (term: AdminCatalogTerm) => {
     if (!confirm(`Bạn có chắc muốn xóa "${term.name}"?`)) return;
 
     try {
       await deleteCatalogTerm(term.id);
       toast.success('Xóa giá trị thành công');
       onTermsChange();
     } catch (error) {
       console.error('Failed to delete term:', error);
       if (error instanceof ApiError && error.payload && typeof error.payload === 'object' && 'message' in error.payload) {
         toast.error(String((error.payload as { message?: string }).message ?? 'Xóa giá trị thất bại.'));
       } else {
         toast.error('Xóa giá trị thất bại.');
       }
     }
   };
 
   const handleDragStart = (index: number) => {
     setDraggedIndex(index);
   };
 
   const handleDragOver = (e: React.DragEvent, index: number) => {
     e.preventDefault();
     if (draggedIndex === null || draggedIndex === index) return;
 
     const newTerms = [...localTerms];
     const draggedTerm = newTerms[draggedIndex];
     newTerms.splice(draggedIndex, 1);
     newTerms.splice(index, 0, draggedTerm);
 
     setLocalTerms(newTerms);
     setDraggedIndex(index);
   };
 
   const handleDragEnd = async () => {
     if (draggedIndex === null) return;
 
     const items = localTerms.map((term, index) => ({
       id: term.id,
       position: index + 1,
     }));
 
     try {
       await reorderCatalogTerms(items);
       toast.success('Cập nhật thứ tự thành công');
       onTermsChange();
     } catch (error) {
       console.error('Failed to reorder terms:', error);
       toast.error('Cập nhật thứ tự thất bại.');
       onTermsChange();
     } finally {
       setDraggedIndex(null);
     }
   };
 
   return (
     <>
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800">
           <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
             Giá trị thuộc tính
           </h2>
           <p className="text-sm text-slate-500 mt-1">
             {localTerms.length} giá trị - Kéo thả để sắp xếp lại
           </p>
         </div>
         <CardContent className="p-4 space-y-3">
           <Button onClick={openCreateDialog} className="w-full" variant="outline">
             <Plus size={16} className="mr-2" />
             Thêm giá trị mới
           </Button>
 
           {localTerms.length > 0 ? (
             <div className="space-y-2">
               {localTerms.map((term, index) => (
                 <div
                   key={term.id}
                   draggable
                   onDragStart={() => handleDragStart(index)}
                   onDragOver={(e) => handleDragOver(e, index)}
                   onDragEnd={handleDragEnd}
                   className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 cursor-move hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                 >
                   <GripVertical size={16} className="text-slate-400 flex-shrink-0" />
                   <div className="flex items-center gap-3 flex-1">
                     <span className="text-sm text-slate-400 font-mono w-8">#{index + 1}</span>
                     <div>
                       <div className="font-medium text-sm">{term.name}</div>
                       <code className="text-xs text-slate-500">{term.slug}</code>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <Button
                       size="sm"
                       variant="ghost"
                       onClick={() => openEditDialog(term)}
                       type="button"
                     >
                       <Edit size={14} />
                     </Button>
                     <Button
                       size="sm"
                       variant="ghost"
                       onClick={() => handleDelete(term)}
                       type="button"
                       className="text-red-600 hover:text-red-700 hover:bg-red-50"
                     >
                       <Trash2 size={14} />
                     </Button>
                   </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-center py-6 text-slate-500">
               <p className="text-sm">Chưa có giá trị nào</p>
               <p className="text-xs mt-1">Click nút "Thêm giá trị mới" để tạo</p>
             </div>
           )}
         </CardContent>
       </Card>
 
       {/* Simple Modal */}
       {isDialogOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsDialogOpen(false)}>
           <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
             <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
               <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                 {editingTerm ? 'Cập nhật giá trị' : 'Thêm giá trị mới'}
               </h3>
               <button
                 onClick={() => setIsDialogOpen(false)}
                 className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
               >
                 <X size={20} />
               </button>
             </div>
             <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="termName">Tên <span className="text-red-500">*</span></Label>
                 <Input
                   id="termName"
                   value={termName}
                   onChange={(e) => setTermName(e.target.value)}
                   placeholder="Ví dụ: Merlot"
                   required
                 />
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="termSlug">Slug</Label>
                 <Input
                   id="termSlug"
                   value={termSlug}
                   onChange={(e) => setTermSlug(e.target.value)}
                   placeholder="Tự động tạo nếu để trống"
                 />
               </div>
 
               <div className="flex justify-end gap-3 pt-4">
                 <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                   Hủy
                 </Button>
                 <Button type="submit" disabled={isSubmitting}>
                   {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                 </Button>
               </div>
             </form>
           </div>
         </div>
       )}
     </>
   );
 }
