'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Pencil, X, ImageIcon, Trash2, Sparkles } from 'lucide-react';
import { Button, Card, Input, Label } from '../../components/ui';
import { createArticle } from '@/lib/api/admin';
import { API_BASE_URL } from '@/lib/api/client';
import { LexicalEditor } from '../../components/LexicalEditor';
import { toast } from 'sonner';

export default function ArticleCreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [active, setActive] = useState(true);
  const [showSlugEditor, setShowSlugEditor] = useState(false);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [galleryImages, setGalleryImages] = useState<{ url: string; path: string }[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);

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

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
  };

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
    formData.append('folder', 'articles');

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
        body: JSON.stringify({ url, folder: 'articles' }),
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
        body: JSON.stringify({ url, folder: 'articles' }),
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

  const handleAIWriting = () => {
    const prompt = encodeURIComponent(`Viết ngay bài viết tiếng Việt về chủ đề rượu vang trending (có thể là: review giống nho mới, xu hướng rượu vang 2026, cách chọn rượu vang theo phong cách, food pairing, vùng rượu nổi bật...).

Yêu cầu:
- Mở bài: thu hút, nêu vấn đề/lợi ích, tạo tò mò
- Thân bài: 3-5 phần với heading rõ ràng (H2/H3), có storytelling, số liệu cụ thể, ví dụ thực tế
- Kết bài: tóm tắt + kêu gọi hành động
- Tối ưu SEO: từ khóa tự nhiên, dễ đọc, có internal linking suggestions
- Độ dài: 800-1200 từ
- Giọng văn: conversational, thân thiện, chuyên môn vừa phải
- Thêm: 3-5 tips thực tế, 1-2 case study/câu chuyện, FAQ (nếu phù hợp)

Trả lời trực tiếp nội dung bài viết theo format markdown, có cấu trúc heading rõ ràng, không hỏi lại.`);

    const chatGPTUrl = `https://chatgpt.com/?model=auto&prompt=${prompt}`;
    window.open(chatGPTUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }

    setIsSubmitting(true);
    try {
      const data: Record<string, unknown> = {
        title,
        slug: slug.trim() || generateSlug(title),
        content: content || null,
        active,
        image_paths: galleryImages.map(image => image.path),
      };

      const result = await createArticle(data);

      if (result.success) {
        toast.success(result.message || 'Tạo bài viết thành công');
        router.push('/admin/articles');
      }
    } catch (error) {
      console.error('Failed to create article:', error);
      toast.error('Không thể tạo bài viết. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/articles">
            <Button variant="outline" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thêm bài viết mới</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Tạo bài viết mới cho website</p>
          </div>
        </div>
        <Button
          type="button"
          onClick={handleAIWriting}
          variant="default"
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          <Sparkles size={16} className="mr-2" />
          Tạo bài viết bằng AI
        </Button>
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
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Nhập tiêu đề bài viết"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Ảnh bài viết</Label>
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

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-slate-500 text-xs">Slug:</Label>
                {showSlugEditor ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      className="h-8 text-sm flex-1"
                      placeholder="ten-bai-viet"
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
              <LexicalEditor
                initialContent={content}
                onChange={setContent}
                folder="articles"
              />
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
          <Link href="/admin/articles">
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
              'Tạo bài viết'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
