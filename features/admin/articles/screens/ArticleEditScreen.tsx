'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Loader2, ArrowLeft, Pencil, X, ImageIcon, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button, Card, Input, Label } from '@/app/(admin)/admin/components/ui';
import { AdminStickyActionBar } from '@/app/(admin)/admin/components/AdminStickyActionBar';
import { getImageUrl } from '@/lib/utils/image';
import { stripHtmlTags } from '@/lib/utils/article-content';
import { useArticleForm } from '../hooks/useArticleForm';

const truncateText = (value: string, maxLength: number) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength).trim();
};

interface ArticleEditScreenProps {
  articleId: number;
}

const LexicalEditor = dynamic(
  () => import('@/app/(admin)/admin/components/LexicalEditor').then((mod) => mod.LexicalEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
    ),
  }
);

export const ArticleEditScreen = ({ articleId }: ArticleEditScreenProps) => {
  const { state, actions } = useArticleForm({ articleId });
  const [isEditorReady, setIsEditorReady] = useState(false);

  const {
    isLoading,
    isSubmitting,
    title,
    slug,
    content,
    metaTitle,
    metaDescription,
    active,
    showSlugEditor,
    isUploadingImage,
    galleryImages,
    imageUrlInput,
  } = state;

  const {
    setTitle,
    setSlug,
    setContent,
    setMetaTitle,
    setMetaDescription,
    setActive,
    setShowSlugEditor,
    setImageUrlInput,
    handleGalleryUpload,
    handleUrlUpload,
    handleReplaceFromUrl,
    handleReplaceFile,
    handleDropFiles,
    handleReorder,
    handleSubmit,
    generateSlug,
  } = actions;

  useEffect(() => {
    if (isLoading) return;
    const timer = window.setTimeout(() => setIsEditorReady(true), 300);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin" />
          <span>Đang tải bài viết...</span>
        </div>
      </Card>
    );
  }

  if (!title) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle size={20} />
          <span>Không tìm thấy bài viết</span>
        </div>
        <Link href="/admin/articles" className="mt-4 inline-block">
          <Button variant="outline">Quay lại danh sách</Button>
        </Link>
      </Card>
    );
  }

  const publicSlug = slug || generateSlug(title);

  return (
    <div className="space-y-4 pb-28">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/articles">
            <Button variant="outline" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa bài viết</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Cập nhật nội dung bài viết</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Tiêu đề <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Nhập tiêu đề bài viết"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Ảnh bài viết</Label>
              <p className="text-xs text-slate-500">Kéo thả để sắp xếp. Ảnh đầu tiên là ảnh chính.</p>
              <div
                onDrop={handleDropFiles}
                onDragOver={(event) => event.preventDefault()}
                className="rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 p-3"
              >
                <div className="flex flex-wrap gap-3">
                  {galleryImages.map((image, index) => (
                    <div
                      key={`${image.path}-${index}`}
                      draggable
                      onDragStart={() => actions.setDragIndex(index)}
                      onDragEnd={() => actions.setDragIndex(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        handleReorder(index);
                      }}
                      className="relative group cursor-move"
                    >
                      <Image
                        src={getImageUrl(image.url)}
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
                            onChange={(event) => handleReplaceFile(index, event.target.files?.[0] || null)}
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
                        onClick={() => actions.setGalleryImages((prev) => prev.filter((_, i) => i !== index))}
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
                      onChange={(event) => handleGalleryUpload(event.target.files)}
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
                  onChange={(event) => setImageUrlInput(event.target.value)}
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

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-slate-500 text-xs">Slug:</Label>
                {showSlugEditor ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      className="h-8 text-sm flex-1"
                      placeholder="ten-bai-viet"
                      value={slug}
                      onChange={(event) => setSlug(event.target.value)}
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
                      {slug || generateSlug(title) || 'ten-bai-viet'}
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

            <div className="space-y-2">
              <Label>Nội dung</Label>
              {isEditorReady ? (
                <LexicalEditor initialContent={content} onChange={setContent} folder="articles" />
              ) : (
                <div className="h-40 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              )}
            </div>

          </div>
        </Card>

        <Card>
          <div className="p-6 space-y-4">
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
                onChange={(event) => setMetaTitle(event.target.value)}
                placeholder="Lấy theo tiêu đề bài viết nếu để trống"
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
                onChange={(event) => setMetaDescription(event.target.value)}
                className="w-full min-h-[90px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                placeholder="Lấy theo nội dung bài viết nếu để trống"
              />
            </div>
            <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm">
              <div className="text-blue-600 font-medium truncate">
                {metaTitle.trim() || title || 'Tiêu đề bài viết'}
              </div>
              <div className="text-emerald-600 text-xs">
                /bai-viet/{publicSlug || 'bai-viet'}
              </div>
              <div className="text-slate-600 text-xs mt-1 line-clamp-2">
                {metaDescription.trim()
                  || truncateText(stripHtmlTags(content || ''), 160)
                  || 'Mô tả ngắn sẽ hiển thị tại đây.'}
              </div>
            </div>
          </div>
        </Card>

        <AdminStickyActionBar
          leftActions={
            <>
              <Link href="/admin/articles">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Hủy
                </Button>
              </Link>
              {publicSlug ? (
                <Link href={`/bai-viet/${publicSlug}`} target="_blank" rel="noopener noreferrer">
                  <Button type="button" variant="outline" size="icon" aria-label="Xem trên web" disabled={isSubmitting}>
                    <ExternalLink size={16} />
                  </Button>
                </Link>
              ) : (
                <Button type="button" variant="outline" size="icon" aria-label="Xem trên web" disabled>
                  <ExternalLink size={16} />
                </Button>
              )}
            </>
          }
          rightActions={
            <>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={active}
                  onChange={(event) => setActive(event.target.checked)}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Hiển thị công khai
                </Label>
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Đang lưu...
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </Button>
            </>
          }
        />
      </form>
    </div>
  );
};
