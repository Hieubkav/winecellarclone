 'use client';
 
 import React, { useState, useEffect, useCallback } from 'react';
 import { Loader2, Save, Settings as SettingsIcon } from 'lucide-react';
 import { Button, Card, Input, Label, Skeleton } from '../components/ui';
import { fetchAdminSettings, updateSettings } from '@/lib/api/admin';
 import { toast } from 'sonner';
 
 export default function SettingsPage() {
   const [isLoading, setIsLoading] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);
 
   const [siteName, setSiteName] = useState('');
   const [hotline, setHotline] = useState('');
   const [email, setEmail] = useState('');
   const [address, setAddress] = useState('');
   const [hours, setHours] = useState('');
   const [googleMapEmbed, setGoogleMapEmbed] = useState('');
   const [metaTitle, setMetaTitle] = useState('');
   const [metaDescription, setMetaDescription] = useState('');
   const [metaKeywords, setMetaKeywords] = useState('');
   const [watermarkPosition, setWatermarkPosition] = useState('none');
   const [watermarkSize, setWatermarkSize] = useState('128x128');
 
   const loadSettings = useCallback(async () => {
     setIsLoading(true);
     try {
       const res = await fetchAdminSettings();
       const data = res.data;
       
       setSiteName(data.site_name || '');
       setHotline(data.hotline || '');
       setEmail(data.email || '');
       setAddress(data.address || '');
       setHours(data.hours || '');
       setGoogleMapEmbed(data.google_map_embed || '');
       setMetaTitle(data.meta_default_title || '');
       setMetaDescription(data.meta_default_description || '');
       setMetaKeywords(
         Array.isArray(data.meta_default_keywords) 
           ? data.meta_default_keywords.join(', ') 
           : (data.meta_default_keywords || '')
       );
       setWatermarkPosition(data.product_watermark_position || 'none');
       setWatermarkSize(data.product_watermark_size || '128x128');
     } catch (error) {
       console.error('Failed to load settings:', error);
       toast.error('Không thể tải cấu hình');
     } finally {
       setIsLoading(false);
     }
   }, []);
 
   useEffect(() => {
     loadSettings();
   }, [loadSettings]);
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsSubmitting(true);
 
     try {
       const data: Record<string, unknown> = {
         site_name: siteName || null,
         hotline: hotline || null,
         email: email || null,
         address: address || null,
         hours: hours || null,
         google_map_embed: googleMapEmbed || null,
         meta_default_title: metaTitle || null,
         meta_default_description: metaDescription || null,
         meta_default_keywords: metaKeywords || null,
         product_watermark_position: watermarkPosition,
         product_watermark_size: watermarkSize,
       };
 
       const result = await updateSettings(data);
       if (result.success) {
         toast.success(result.message || 'Cập nhật thành công');
       }
     } catch (error) {
       console.error('Failed to update settings:', error);
       toast.error('Không thể cập nhật cấu hình');
     } finally {
       setIsSubmitting(false);
     }
   };
 
   if (isLoading) {
     return (
       <div className="space-y-4">
         <div>
           <Skeleton className="h-8 w-48 mb-2" />
           <Skeleton className="h-4 w-64" />
         </div>
         <Card>
           <div className="p-6 space-y-4">
             {[1, 2, 3, 4, 5].map(i => (
               <Skeleton key={i} className="h-12 w-full" />
             ))}
           </div>
         </Card>
       </div>
     );
   }
 
   return (
     <div className="space-y-4">
       <div className="flex items-center gap-3">
         <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
           <SettingsIcon size={24} className="text-blue-600 dark:text-blue-400" />
         </div>
         <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Cấu hình chung</h1>
           <p className="text-sm text-slate-500 dark:text-slate-400">
             Thiết lập thông tin website, SEO và watermark
           </p>
         </div>
       </div>
 
       <form onSubmit={handleSubmit} className="space-y-6">
         {/* Thong tin lien he */}
         <Card>
           <div className="p-4 border-b border-slate-100 dark:border-slate-800">
             <h2 className="font-semibold text-slate-900 dark:text-slate-100">Thông tin liên hệ</h2>
             <p className="text-sm text-slate-500">Thông tin cơ bản của website</p>
           </div>
           <div className="p-6 space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="siteName">Tên website</Label>
                 <Input
                   id="siteName"
                   value={siteName}
                   onChange={(e) => setSiteName(e.target.value)}
                   placeholder="Wine Cellar"
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="hotline">Hotline</Label>
                 <Input
                   id="hotline"
                   value={hotline}
                   onChange={(e) => setHotline(e.target.value)}
                   placeholder="0909 123 456"
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="email">Email</Label>
                 <Input
                   id="email"
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="info@winecellar.vn"
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="hours">Giờ làm việc</Label>
                 <Input
                   id="hours"
                   value={hours}
                   onChange={(e) => setHours(e.target.value)}
                   placeholder="8:00 - 22:00, T2 - CN"
                 />
               </div>
             </div>
             <div className="space-y-2">
               <Label htmlFor="address">Địa chỉ</Label>
               <textarea
                 id="address"
                 value={address}
                 onChange={(e) => setAddress(e.target.value)}
                 placeholder="123 Nguyen Hue, Quan 1, TP.HCM"
                 rows={2}
                 className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="googleMapEmbed">Google Map Embed URL</Label>
               <textarea
                 id="googleMapEmbed"
                 value={googleMapEmbed}
                 onChange={(e) => setGoogleMapEmbed(e.target.value)}
                 placeholder="https://www.google.com/maps/embed?pb=..."
                 rows={2}
                 className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               />
               <p className="text-xs text-slate-500">URL iframe embed từ Google Maps</p>
             </div>
           </div>
         </Card>
 
         {/* SEO */}
         <Card>
           <div className="p-4 border-b border-slate-100 dark:border-slate-800">
             <h2 className="font-semibold text-slate-900 dark:text-slate-100">SEO mặc định</h2>
             <p className="text-sm text-slate-500">Meta tags mặc định cho toàn bộ website</p>
           </div>
           <div className="p-6 space-y-4">
             <div className="space-y-2">
               <Label htmlFor="metaTitle">Tiêu đề mặc định</Label>
               <Input
                 id="metaTitle"
                 value={metaTitle}
                 onChange={(e) => setMetaTitle(e.target.value)}
                 placeholder="Wine Cellar - Rượu vang cao cấp"
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="metaDescription">Mô tả mặc định</Label>
               <textarea
                 id="metaDescription"
                 value={metaDescription}
                 onChange={(e) => setMetaDescription(e.target.value)}
                 placeholder="Cửa hàng rượu vang cao cấp hàng đầu Việt Nam..."
                 rows={3}
                 className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="metaKeywords">Từ khóa mặc định</Label>
               <Input
                 id="metaKeywords"
                 value={metaKeywords}
                 onChange={(e) => setMetaKeywords(e.target.value)}
                 placeholder="rượu vang, wine, rượu ngoại, whisky"
               />
               <p className="text-xs text-slate-500">Các từ khóa cách nhau bằng dấu phẩy</p>
             </div>
           </div>
         </Card>
 
         {/* Watermark */}
         <Card>
           <div className="p-4 border-b border-slate-100 dark:border-slate-800">
             <h2 className="font-semibold text-slate-900 dark:text-slate-100">Watermark sản phẩm</h2>
             <p className="text-sm text-slate-500">Thiết lập watermark dán lên ảnh sản phẩm</p>
           </div>
           <div className="p-6 space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="watermarkPosition">Vị trí watermark</Label>
                 <select
                   id="watermarkPosition"
                   value={watermarkPosition}
                   onChange={(e) => setWatermarkPosition(e.target.value)}
                   className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 >
                   <option value="none">Không hiển thị</option>
                   <option value="top_left">Góc trên trái</option>
                   <option value="top_right">Góc trên phải</option>
                   <option value="bottom_left">Góc dưới trái</option>
                   <option value="bottom_right">Góc dưới phải</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <Label htmlFor="watermarkSize">Kích thước watermark</Label>
                 <select
                   id="watermarkSize"
                   value={watermarkSize}
                   onChange={(e) => setWatermarkSize(e.target.value)}
                   className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 >
                   <option value="64x64">64 x 64 px (nhỏ)</option>
                   <option value="96x96">96 x 96 px</option>
                   <option value="128x128">128 x 128 px (mặc định)</option>
                   <option value="160x160">160 x 160 px</option>
                   <option value="192x192">192 x 192 px (to)</option>
                 </select>
               </div>
             </div>
           </div>
         </Card>
 
         {/* Submit */}
         <div className="flex justify-end">
           <Button type="submit" disabled={isSubmitting} className="gap-2">
             {isSubmitting ? (
               <>
                 <Loader2 size={16} className="animate-spin" />
                 Đang lưu...
               </>
             ) : (
               <>
                 <Save size={16} />
                 Lưu cấu hình
               </>
             )}
           </Button>
         </div>
       </form>
     </div>
   );
 }
