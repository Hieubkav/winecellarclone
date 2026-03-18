'use client';

import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Loader2, Save, Settings as SettingsIcon, Globe, MapPin, ShieldCheck, Search, Type, X } from 'lucide-react';
import { Button, Card, Input, Label, Skeleton } from '@/app/(admin)/admin/components/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { Checkbox } from '@/components/ui/checkbox';
import { useSettingsForm } from '../hooks/useSettingsForm';
import { FontSettingsTab } from '../components/FontSettingsTab';

export const SettingsScreen = () => {
  const { state, actions } = useSettingsForm();

  const {
    activeTab,
    isLoading,
    isSubmitting,
    siteName,
    hotline,
    email,
    address,
    hours,
    googleMapEmbed,
    metaTitle,
    metaDescription,
    metaKeywords,
    keywordInput,
    siteTagline,
    organizationLegalName,
    organizationShortName,
    primaryPhone,
    primaryEmail,
    priceRange,
    socialLinksInput,
    defaultMetaTitleTemplate,
    defaultOgTitle,
    defaultOgDescription,
    indexingEnabled,
    productContactCtaMode,
    productContactCtaFacebook,
    productContactCtaZalo,
    productContactCtaPhone,
    productContactCtaTiktok,
    logoImageId,
    logoImageUrl,
    faviconImageId,
    faviconImageUrl,
    ogImageId,
    ogImageUrl,
    watermarkType,
    watermarkImageId,
    watermarkImageUrl,
    watermarkPosition,
    watermarkSize,
    watermarkText,
    watermarkTextSize,
    watermarkTextPositionY,
    watermarkTextOpacity,
    watermarkTextRepeat,
    globalFontKey,
    homeFontKey,
    productListFontKey,
    productDetailFontKey,
    articleListFontKey,
    articleDetailFontKey,
  } = state;

  const {
    setSiteName,
    setHotline,
    setEmail,
    setAddress,
    setHours,
    setGoogleMapEmbed,
    setMetaTitle,
    setMetaDescription,
    setKeywordInput,
    setSiteTagline,
    setOrganizationLegalName,
    setOrganizationShortName,
    setPrimaryPhone,
    setPrimaryEmail,
    setPriceRange,
    setSocialLinksInput,
    setDefaultMetaTitleTemplate,
    setDefaultOgTitle,
    setDefaultOgDescription,
    setIndexingEnabled,
    setProductContactCtaMode,
    setProductContactCtaFacebook,
    setProductContactCtaZalo,
    setProductContactCtaPhone,
    setProductContactCtaTiktok,
    setLogoImageId,
    setLogoImageUrl,
    setFaviconImageId,
    setFaviconImageUrl,
    setOgImageId,
    setOgImageUrl,
    setWatermarkType,
    setWatermarkImageId,
    setWatermarkImageUrl,
    setWatermarkPosition,
    setWatermarkSize,
    setWatermarkText,
    setWatermarkTextSize,
    setWatermarkTextPositionY,
    setWatermarkTextOpacity,
    setWatermarkTextRepeat,
    setGlobalFontKey,
    setHomeFontKey,
    setProductListFontKey,
    setProductDetailFontKey,
    setArticleListFontKey,
    setArticleDetailFontKey,
    handleTabChange,
    handleKeywordAdd,
    handleKeywordRemove,
    handleSubmit,
  } = actions;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Card>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const previewText = watermarkText.trim() || "Watermark";
  const previewOpacity = Math.max(5, Math.min(100, watermarkTextOpacity));
  const previewPositionY = Math.max(0, Math.min(100, watermarkTextPositionY));
  const previewFontSizeMap: Record<string, number> = {
    xxsmall: 12,
    xsmall: 14,
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 28,
    xxlarge: 32,
  };
  const previewFontSize = previewFontSizeMap[watermarkTextSize] ?? 20;
  const previewPadding = Math.max(12, Math.round(previewFontSize * 1.3));
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const previewBottleSvg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="none" />
      <g opacity="0.45" stroke="#94a3b8" stroke-width="4" fill="none">
        <path d="M92 18h16v30c0 8 20 12 20 26v90c0 18-14 32-28 32s-28-14-28-32V74c0-14 20-18 20-26V18z" />
        <path d="M82 60h36" />
      </g>
    </svg>`
  );

  const updatePreviewPosition = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;
    const usableHeight = Math.max(1, rect.height - previewPadding * 2);
    const relativeY = event.clientY - rect.top - previewPadding;
    const nextPosition = Math.max(0, Math.min(100, Math.round((relativeY / usableHeight) * 100)));
    setWatermarkTextPositionY(nextPosition);
  };

  const handlePreviewPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    updatePreviewPosition(event);
  };

  const handlePreviewPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePreviewPosition(event);
  };

  const handlePreviewPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDragging(false);
  };

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

      <form onSubmit={handleSubmit} noValidate>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2 mb-6 h-auto bg-transparent p-0">
            <TabsTrigger value="info" className="flex w-full min-h-10 items-center justify-center gap-2 px-2 sm:px-3">
              <Globe size={16} />
              <span className="hidden sm:inline">Thông tin</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex w-full min-h-10 items-center justify-center gap-2 px-2 sm:px-3">
              <MapPin size={16} />
              <span className="hidden sm:inline">Bản đồ</span>
            </TabsTrigger>
            <TabsTrigger value="watermark" className="flex w-full min-h-10 items-center justify-center gap-2 px-2 sm:px-3">
              <ShieldCheck size={16} />
              <span className="hidden sm:inline">Watermark</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex w-full min-h-10 items-center justify-center gap-2 px-2 sm:px-3">
              <Search size={16} />
              <span className="hidden sm:inline">SEO</span>
            </TabsTrigger>
            <TabsTrigger value="fonts" className="flex w-full min-h-10 items-center justify-center gap-2 px-2 sm:px-3">
              <Type size={16} />
              <span className="hidden sm:inline">Font chữ</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="space-y-6">
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
                        onChange={(event) => setSiteName(event.target.value)}
                        placeholder="Wine Cellar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hotline">Hotline</Label>
                      <Input
                        id="hotline"
                        value={hotline}
                        onChange={(event) => setHotline(event.target.value)}
                        placeholder="0909 123 456"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="info@winecellar.vn"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hours">Giờ làm việc</Label>
                      <Input
                        id="hours"
                        value={hours}
                        onChange={(event) => setHours(event.target.value)}
                        placeholder="8:00 - 22:00, T2 - CN"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <textarea
                      id="address"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder="123 Nguyen Hue, Quan 1, TP.HCM"
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">CTA liên hệ trang sản phẩm</h2>
                  <p className="text-sm text-slate-500">Chọn cách hiển thị nút liên hệ trên trang chi tiết sản phẩm</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productContactCtaMode">Chế độ hiển thị</Label>
                    <select
                      id="productContactCtaMode"
                      value={productContactCtaMode}
                      onChange={(event) => setProductContactCtaMode(event.target.value as typeof productContactCtaMode)}
                      className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                    >
                      <option value="contact_page">Nút liên hệ (mở trang /contact)</option>
                      <option value="social_4_buttons">4 nút FB / Zalo / SĐT / TikTok</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="productContactFacebook">Facebook URL</Label>
                      <Input
                        id="productContactFacebook"
                        value={productContactCtaFacebook}
                        onChange={(event) => setProductContactCtaFacebook(event.target.value)}
                        placeholder="https://facebook.com/..."
                        disabled={productContactCtaMode !== "social_4_buttons"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productContactZalo">Zalo URL</Label>
                      <Input
                        id="productContactZalo"
                        value={productContactCtaZalo}
                        onChange={(event) => setProductContactCtaZalo(event.target.value)}
                        placeholder="https://zalo.me/..."
                        disabled={productContactCtaMode !== "social_4_buttons"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productContactPhone">Số điện thoại</Label>
                      <Input
                        id="productContactPhone"
                        value={productContactCtaPhone}
                        onChange={(event) => setProductContactCtaPhone(event.target.value)}
                        placeholder="0909 123 456 hoặc tel:+84909123456"
                        disabled={productContactCtaMode !== "social_4_buttons"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productContactTiktok">TikTok URL</Label>
                      <Input
                        id="productContactTiktok"
                        value={productContactCtaTiktok}
                        onChange={(event) => setProductContactCtaTiktok(event.target.value)}
                        placeholder="https://tiktok.com/@..."
                        disabled={productContactCtaMode !== "social_4_buttons"}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

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
                    onChange={(event) => setGoogleMapEmbed(event.target.value)}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500">URL iframe embed từ Google Maps</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="watermark">
            <Card>
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Watermark sản phẩm</h2>
                <p className="text-sm text-slate-500">Thiết lập watermark dán lên ảnh sản phẩm</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <Label>Loại watermark</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="watermarkType"
                        value="image"
                        checked={watermarkType === 'image'}
                        onChange={(event) => setWatermarkType(event.target.value)}
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
                        onChange={(event) => setWatermarkType(event.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Chữ</span>
                    </label>
                  </div>
                </div>

                {watermarkType === 'image' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-4">
                    <h3 className="font-medium text-slate-700 dark:text-slate-300">Cài đặt watermark hình ảnh</h3>

                    <ImageUploadField
                      label="Ảnh watermark"
                      value={watermarkImageUrl}
                      imageId={watermarkImageId}
                      onChange={(id, url) => {
                        setWatermarkImageId(id);
                        setWatermarkImageUrl(url);
                      }}
                      description="Ảnh PNG trong suốt được khuyến nghị"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="watermarkPosition">Vị trí</Label>
                        <select
                          id="watermarkPosition"
                          value={watermarkPosition}
                          onChange={(event) => setWatermarkPosition(event.target.value)}
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
                          onChange={(event) => setWatermarkSize(event.target.value)}
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

                {watermarkType === 'text' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-4">
                    <h3 className="font-medium text-slate-700 dark:text-slate-300">Cài đặt watermark chữ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="watermarkText">Nội dung chữ</Label>
                        <Input
                          id="watermarkText"
                          value={watermarkText}
                          onChange={(event) => setWatermarkText(event.target.value)}
                          placeholder="VD: Wine Cellar"
                          maxLength={100}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="watermarkTextSize">Kích thước chữ</Label>
                        <select
                          id="watermarkTextSize"
                          value={watermarkTextSize}
                          onChange={(event) => setWatermarkTextSize(event.target.value)}
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
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <Label>Vị trí dọc · {previewPositionY}%</Label>
                          <span className="text-xs text-slate-500">Kéo watermark trên ảnh để đổi vị trí</span>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
                          <div
                            ref={previewRef}
                            onPointerDown={handlePreviewPointerDown}
                            onPointerMove={handlePreviewPointerMove}
                            onPointerUp={handlePreviewPointerUp}
                            onPointerCancel={handlePreviewPointerUp}
                            className={`relative aspect-square w-full rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-900/40 ${
                              isDragging ? "ring-2 ring-blue-400" : ""
                            }`}
                            style={{
                              backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.6), rgba(148,163,184,0.05)), url("data:image/svg+xml;utf8,${previewBottleSvg}")`,
                              backgroundPosition: "center",
                              backgroundRepeat: "no-repeat",
                              backgroundSize: "cover",
                              touchAction: "none",
                            }}
                            role="slider"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={previewPositionY}
                            aria-label="Vị trí watermark chữ"
                          >
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/30 via-white/10 to-slate-900/10" />
                            <div
                              className="absolute left-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 px-4"
                              style={{ top: `${previewPositionY}%` }}
                            >
                              <div
                                className={`flex w-full items-center ${watermarkTextRepeat ? "gap-6" : "justify-center"} cursor-grab active:cursor-grabbing`}
                                style={{
                                  fontSize: `${previewFontSize}px`,
                                  color: `rgba(255, 255, 255, ${previewOpacity / 100})`,
                                  textShadow: `0 2px 6px rgba(15, 23, 42, ${previewOpacity / 100})`,
                                  padding: `${Math.round(previewPadding * 0.35)}px 0`,
                                }}
                              >
                                {watermarkTextRepeat ? (
                                  Array.from({ length: 4 }).map((_, index) => (
                                    <span key={index} className="whitespace-nowrap">
                                      {previewText}
                                    </span>
                                  ))
                                ) : (
                                  <span className="whitespace-nowrap">{previewText}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col justify-center gap-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              value={previewPositionY}
                              onChange={(event) => setWatermarkTextPositionY(Number(event.target.value))}
                              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                              aria-label="Tinh chỉnh vị trí watermark"
                            />
                            <span className="text-xs text-slate-500">Tinh chỉnh chính xác khi cần</span>
                          </div>
                        </div>
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
                          onChange={(event) => setWatermarkTextOpacity(Number(event.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <Checkbox
                            checked={watermarkTextRepeat}
                            onCheckedChange={(value) => setWatermarkTextRepeat(Boolean(value))}
                          />
                          <span>Lặp watermark chữ theo hàng ngang</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Khi bật, watermark chữ sẽ lặp theo hàng ngang từ trái sang phải đến hết ảnh. Vị trí Trên/Giữa/Dưới chỉ quyết định hàng này nằm ở đâu, không lặp theo chiều dọc.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

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
                    onChange={(event) => setMetaTitle(event.target.value)}
                    placeholder="Wine Cellar - Rượu vang cao cấp"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Mô tả mặc định</Label>
                  <textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={(event) => setMetaDescription(event.target.value)}
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
                      onChange={(event) => setKeywordInput(event.target.value)}
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

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4"></div>
                <div className="space-y-2">
                  <Label htmlFor="siteTagline">Tagline thương hiệu</Label>
                  <Input
                    id="siteTagline"
                    value={siteTagline}
                    onChange={(event) => setSiteTagline(event.target.value)}
                    placeholder="VD: Rượu vang chính hãng, tư vấn chuẩn gu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultMetaTitleTemplate">Template tiêu đề mặc định</Label>
                  <Input
                    id="defaultMetaTitleTemplate"
                    value={defaultMetaTitleTemplate}
                    onChange={(event) => setDefaultMetaTitleTemplate(event.target.value)}
                    placeholder="%s | Thiên Kim Wine"
                  />
                  <p className="text-xs text-slate-500">Dùng %s cho tiêu đề trang con</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultOgTitle">Tiêu đề OG mặc định</Label>
                  <Input
                    id="defaultOgTitle"
                    value={defaultOgTitle}
                    onChange={(event) => setDefaultOgTitle(event.target.value)}
                    placeholder="Thiên Kim Wine - Rượu vang cao cấp"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultOgDescription">Mô tả OG mặc định</Label>
                  <textarea
                    id="defaultOgDescription"
                    value={defaultOgDescription}
                    onChange={(event) => setDefaultOgDescription(event.target.value)}
                    placeholder="Mô tả ngắn cho ảnh chia sẻ mạng xã hội"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Checkbox
                    checked={indexingEnabled}
                    onCheckedChange={(value) => setIndexingEnabled(Boolean(value))}
                  />
                  <span>Cho phép index website trên Google/Bing</span>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizationLegalName">Tên pháp lý doanh nghiệp</Label>
                    <Input
                      id="organizationLegalName"
                      value={organizationLegalName}
                      onChange={(event) => setOrganizationLegalName(event.target.value)}
                      placeholder="Công ty TNHH Thiên Kim Wine"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organizationShortName">Tên viết tắt</Label>
                    <Input
                      id="organizationShortName"
                      value={organizationShortName}
                      onChange={(event) => setOrganizationShortName(event.target.value)}
                      placeholder="Thiên Kim Wine"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryPhone">SĐT hiển thị schema</Label>
                    <Input
                      id="primaryPhone"
                      value={primaryPhone}
                      onChange={(event) => setPrimaryPhone(event.target.value)}
                      placeholder="0938 110 888"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryEmail">Email hiển thị schema</Label>
                    <Input
                      id="primaryEmail"
                      type="email"
                      value={primaryEmail}
                      onChange={(event) => setPrimaryEmail(event.target.value)}
                      placeholder="info@thienkimwine.vn"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priceRange">Khoảng giá</Label>
                    <Input
                      id="priceRange"
                      value={priceRange}
                      onChange={(event) => setPriceRange(event.target.value)}
                      placeholder="₫₫₫"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="socialLinks">Liên kết mạng xã hội (mỗi dòng 1 URL)</Label>
                  <textarea
                    id="socialLinks"
                    value={socialLinksInput}
                    onChange={(event) => setSocialLinksInput(event.target.value)}
                    placeholder="https://facebook.com/...
https://instagram.com/..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="fonts">
            <FontSettingsTab
              globalFontKey={globalFontKey}
              homeFontKey={homeFontKey}
              productListFontKey={productListFontKey}
              productDetailFontKey={productDetailFontKey}
              articleListFontKey={articleListFontKey}
              articleDetailFontKey={articleDetailFontKey}
              onGlobalFontChange={(value) => setGlobalFontKey(value as typeof globalFontKey)}
              onHomeFontChange={(value) => setHomeFontKey(value as typeof homeFontKey)}
              onProductListFontChange={(value) => setProductListFontKey(value as typeof productListFontKey)}
              onProductDetailFontChange={(value) => setProductDetailFontKey(value as typeof productDetailFontKey)}
              onArticleListFontChange={(value) => setArticleListFontKey(value as typeof articleListFontKey)}
              onArticleDetailFontChange={(value) => setArticleDetailFontKey(value as typeof articleDetailFontKey)}
            />
          </TabsContent>
        </Tabs>

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
};
