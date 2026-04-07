'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Upload, Link as LinkIcon, X } from 'lucide-react';
import { Button, Card, Input, Label } from '../../components/ui';
import { createImage } from '@/lib/api/admin';
import { API_BASE_URL } from '@/lib/api/client';
import { getImageUrl } from '@/lib/utils/image';
import { toast } from 'sonner';

export default function ImageCreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [uploadedPath, setUploadedPath] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [alt, setAlt] = useState('');
  const [active, setActive] = useState(true);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'library');

      const response = await fetch(`${API_BASE_URL}/v1/admin/upload/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      if (result.success && result.data) {
        setUploadedPath(result.data.path);
        setUploadedUrl(result.data.url);
        toast.success('Tải ảnh lên thành công');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Không thể tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleUrlUpload = useCallback(async () => {
    const url = urlInput.trim();
    if (!url) return;

    setIsUploading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/admin/upload/image-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, folder: 'library' }),
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      if (result.success && result.data) {
        setUploadedPath(result.data.path);
        setUploadedUrl(result.data.url);
        setUrlInput('');
        toast.success('Tải ảnh từ URL thành công');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Không thể tải ảnh từ URL');
    } finally {
      setIsUploading(false);
    }
  }, [urlInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedPath) {
      toast.error('Vui lòng tải ảnh lên trước');
      return;
    }

    setIsSubmitting(true);
    try {
      const data: Record<string, unknown> = {
        file_path: uploadedPath,
        alt: alt.trim() || null,
        active,
      };

      const result = await createImage(data);
      
      if (result.success) {
        toast.success(result.message || 'Thêm ảnh vào thư viện thành công');
        router.push('/admin/images');
      }
    } catch (error) {
      console.error('Failed to create image:', error);
      toast.error('Không thể lưu ảnh. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/admin/images">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tải ảnh lên</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Thêm hình ảnh mới vào thư viện</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="p-6 space-y-6">
            {/* Upload Section */}
            {!uploadedUrl ? (
              <>
                <div className="space-y-2">
                  <Label>Tải ảnh lên từ máy tính</Label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      className="hidden"
                      id="file-upload"
                      disabled={isUploading}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload size={48} className="mx-auto mb-4 text-slate-400" />
                      <p className="text-sm font-medium">Click để chọn ảnh</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF, WebP (max 5MB)</p>
                    </label>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Hoặc</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url-input">Tải ảnh từ URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="url-input"
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      disabled={isUploading}
                    />
                    <Button
                      type="button"
                      onClick={handleUrlUpload}
                      disabled={isUploading || !urlInput.trim()}
                    >
                      <LinkIcon size={16} className="mr-2" />
                      Tải
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <Label>Ảnh đã tải lên</Label>
                <div className="relative inline-block">
                  <Image
                    src={getImageUrl(uploadedUrl)}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 max-w-full h-auto"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setUploadedPath('');
                      setUploadedUrl('');
                    }}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            )}

            {uploadedUrl && (
              <div className="space-y-2">
                <Label htmlFor="alt">Mô tả ảnh (Alt text)</Label>
                <Input
                  id="alt"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Mô tả ngắn gọn về ảnh (tốt cho SEO)"
                />
              </div>
            )}

            {uploadedUrl && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Kích hoạt
                </Label>
              </div>
            )}

            {isUploading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-slate-500">Đang tải ảnh lên...</span>
              </div>
            )}
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/admin/images">
            <Button type="button" variant="outline" disabled={isSubmitting || isUploading}>
              Hủy
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || isUploading || !uploadedPath}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Đang lưu...
              </>
            ) : (
              'Lưu vào thư viện'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
