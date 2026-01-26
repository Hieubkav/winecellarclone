'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Save, Settings as SettingsIcon, Globe, MapPin, ShieldCheck, Search, X } from 'lucide-react';
import { Button, Card, Input, Label, Skeleton } from '../components/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { fetchAdminSettings, updateSettings } from '@/lib/api/admin';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
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
  const [metaKeywords, setMetaKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  
  // Image states
  const [logoImageId, setLogoImageId] = useState<number | null>(null);
  const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);
  const [faviconImageId, setFaviconImageId] = useState<number | null>(null);
  const [faviconImageUrl, setFaviconImageUrl] = useState<string | null>(null);
  const [ogImageId, setOgImageId] = useState<number | null>(null);
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(null);
  
  // Watermark states
  const [watermarkType, setWatermarkType] = useState('image');
  const [watermarkPosition, setWatermarkPosition] = useState('none');
  const [watermarkSize, setWatermarkSize] = useState('128x128');
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkTextSize, setWatermarkTextSize] = useState('medium');
  const [watermarkTextPosition, setWatermarkTextPosition] = useState('center');
  const [watermarkTextOpacity, setWatermarkTextOpacity] = useState(50);

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
      
      // Images - prepend backend base URL (without /api) for storage paths
      const backendUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api').replace('/api', '');
      setLogoImageId(data.logo_image_id || null);
      setLogoImageUrl(data.logo_image_url ? `${backendUrl}${data.logo_image_url}` : null);
      setFaviconImageId(data.favicon_image_id || null);
      setFaviconImageUrl(data.favicon_image_url ? `${backendUrl}${data.favicon_image_url}` : null);
      setOgImageId(data.og_image_id || null);
      setOgImageUrl(data.og_image_url ? `${backendUrl}${data.og_image_url}` : null);
      
      // Parse keywords
      let keywords: string[] = [];
      if (Array.isArray(data.meta_default_keywords)) {
        keywords = data.meta_default_keywords;
      } else if (typeof data.meta_default_keywords === 'string' && data.meta_default_keywords) {
        keywords = data.meta_default_keywords.split(',').map(k => k.trim()).filter(Boolean);
      }
      setMetaKeywords(keywords);
      // Watermark
      setWatermarkType(data.product_watermark_type || 'image');
      setWatermarkPosition(data.product_watermark_position || 'none');
      setWatermarkSize(data.product_watermark_size || '128x128');
      setWatermarkText(data.product_watermark_text || '');
      setWatermarkTextSize(data.product_watermark_text_size || 'medium');
      setWatermarkTextPosition(data.product_watermark_text_position || 'center');
      setWatermarkTextOpacity(data.product_watermark_text_opacity || 50);
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

  const handleKeywordAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = keywordInput.trim();
      if (trimmed && !metaKeywords.includes(trimmed)) {
        setMetaKeywords([...metaKeywords, trimmed]);
        setKeywordInput('');
      }
    }
  };

  const handleKeywordRemove = (keyword: string) => {
    setMetaKeywords(metaKeywords.filter(k => k !== keyword));
  };

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
        meta_default_keywords: metaKeywords.length > 0 ? metaKeywords : null,
        // Images
        logo_image_id: logoImageId,
        favicon_image_id: faviconImageId,
        og_image_id: ogImageId,
        // Watermark
        product_watermark_type: watermarkType,
        product_watermark_position: watermarkPosition,
        product_watermark_size: watermarkSize,
        product_watermark_text: watermarkText || null,
        product_watermark_text_size: watermarkTextSize,
        product_watermark_text_position: watermarkTextPosition,
        product_watermark_text_opacity: watermarkTextOpacity,
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

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Globe size={16} />
              <span className="hidden sm:inline">Thông tin</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin size={16} />
              <span className="hidden sm:inline">Bản đồ</span>
            </TabsTrigger>
            <TabsTrigger value="watermark" className="flex items-center gap-2">
              <ShieldCheck size={16} />
              <span className="hidden sm:inline">Watermark</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Search size={16} />
              <span className="hidden sm:inline">SEO</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Thông tin */}
          <TabsContent value="info">
            <Card>
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Thông tin cơ bản</h2>
                <p className="text-sm text-slate-500">Cấu hình logo, favicon và thông tin liên hệ</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImageUploadField
                    label="Logo"
                    value={logoImageUrl}
                    imageId={logoImageId}
                    onChange={(id, url) => {
                      setLogoImageId(id);
                      setLogoImageUrl(url);
                    }}
                    description="Hiển thị trên header trang chủ"
                  />
                  <ImageUploadField
                    label="Favicon"
                    value={faviconImageUrl}
                    imageId={faviconImageId}
                    onChange={(id, url) => {
                      setFaviconImageId(id);
                      setFaviconImageUrl(url);
                    }}
                    description="Icon hiển thị trên browser tab"
                  />
                </div>
                
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4"></div>
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
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Bản đồ */}
          <TabsContent value="map">
            <Card>
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Google Map</h2>
                <p className="text-sm text-slate-500">Nhúng bản đồ Google Maps vào website</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="googleMapEmbed">Google Map Embed URL</Label>
                  <textarea
                    id="googleMapEmbed"
                    value={googleMapEmbed}
                    onChange={(e) => setGoogleMapEmbed(e.target.value)}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500">URL iframe embed từ Google Maps</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Watermark */}
          <TabsContent value="watermark">
            <Card>
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Watermark sản phẩm</h2>
                <p className="text-sm text-slate-500">Thiết lập watermark dán lên ảnh sản phẩm</p>
              </div>
              <div className="p-6 space-y-6">
                {/* Loại watermark */}
                <div className="space-y-3">
                  <Label>Loại watermark</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="watermarkType"
                        value="image"
                        checked={watermarkType === 'image'}
                        onChange={(e) => setWatermarkType(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Hình ảnh</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="watermarkType"
                        value="text"
                        checked={watermarkType === 'text'}
                        onChange={(e) => setWatermarkType(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Chữ</span>
                    </label>
                  </div>
                </div>

                {/* Watermark hình ảnh */}
                {watermarkType === 'image' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-4">
                    <h3 className="font-medium text-slate-700 dark:text-slate-300">Cài đặt watermark hình ảnh</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="watermarkPosition">Vị trí</Label>
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
                        <Label htmlFor="watermarkSize">Kích thước</Label>
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
                )}

                {/* Watermark chữ */}
                {watermarkType === 'text' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-4">
                    <h3 className="font-medium text-slate-700 dark:text-slate-300">Cài đặt watermark chữ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="watermarkText">Nội dung chữ</Label>
                        <Input
                          id="watermarkText"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          placeholder="VD: Wine Cellar"
                          maxLength={100}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="watermarkTextSize">Kích thước chữ</Label>
                        <select
                          id="watermarkTextSize"
                          value={watermarkTextSize}
                          onChange={(e) => setWatermarkTextSize(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="xxsmall">Rất nhỏ</option>
                          <option value="xsmall">Nhỏ hơn</option>
                          <option value="small">Nhỏ</option>
                          <option value="medium">Vừa</option>
                          <option value="large">Lớn</option>
                          <option value="xlarge">Rất lớn</option>
                          <option value="xxlarge">Cực lớn</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="watermarkTextPosition">Vị trí</Label>
                        <select
                          id="watermarkTextPosition"
                          value={watermarkTextPosition}
                          onChange={(e) => setWatermarkTextPosition(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="top">Trên</option>
                          <option value="center">Giữa</option>
                          <option value="bottom">Dưới</option>
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="watermarkTextOpacity">Độ trong suốt: {watermarkTextOpacity}%</Label>
                        <input
                          type="range"
                          id="watermarkTextOpacity"
                          min="5"
                          max="100"
                          step="5"
                          value={watermarkTextOpacity}
                          onChange={(e) => setWatermarkTextOpacity(Number(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Tab: SEO */}
          <TabsContent value="seo">
            <Card>
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">SEO mặc định</h2>
                <p className="text-sm text-slate-500">Meta tags và OG Image cho toàn bộ website</p>
              </div>
              <div className="p-6 space-y-6">
                <ImageUploadField
                  label="Open Graph Image (OG Image)"
                  value={ogImageUrl}
                  imageId={ogImageId}
                  onChange={(id, url) => {
                    setOgImageId(id);
                    setOgImageUrl(url);
                  }}
                  description="Ảnh hiển thị khi share link trên Facebook, Twitter, v.v."
                />
                
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4"></div>
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
                  <div className="space-y-2">
                    <Input
                      id="metaKeywords"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={handleKeywordAdd}
                      placeholder="Nhập từ khóa và nhấn Enter"
                    />
                    {metaKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-900/50">
                        {metaKeywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                          >
                            {keyword}
                            <button
                              type="button"
                              onClick={() => handleKeywordRemove(keyword)}
                              className="hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full p-0.5 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">Nhấn Enter để thêm từ khóa mới</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit */}
        <div className="flex justify-end mt-6">
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
