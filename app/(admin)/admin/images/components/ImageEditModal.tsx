'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Loader2, X, Upload, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Button, Input, Label } from '../../components/ui';
import { fetchAdminImage, updateImage, type AdminImageDetail } from '@/lib/api/admin';
import { API_BASE_URL } from '@/lib/api/client';
import { getImageUrl } from '@/lib/utils/image';
import { toast } from 'sonner';

interface ImageEditModalProps {
  imageId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImageEditModal({ imageId, onClose, onSuccess }: ImageEditModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [image, setImage] = useState<AdminImageDetail | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [newImagePath, setNewImagePath] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [alt, setAlt] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    loadImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageId]);

  const loadImage = async () => {
    setIsLoading(true);
    try {
      const result = await fetchAdminImage(imageId);
      const imageData = result.data;
      
      setImage(imageData);
      setImageUrl(imageData.url || '');
      setAlt(imageData.alt || '');
      setActive(imageData.active);
    } catch (error) {
      console.error('Failed to load image:', error);
      toast.error('Không thể tải hình ảnh');
    } finally {
      setIsLoading(false);
    }
  };

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
        setNewImagePath(result.data.path);
        setNewImageUrl(result.data.url);
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
        setNewImagePath(result.data.path);
        setNewImageUrl(result.data.url);
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
    
    setIsSubmitting(true);
    try {
      const data: Record<string, unknown> = {
        alt: alt.trim() || null,
        active,
      };

      // Nếu có ảnh mới, cập nhật file_path
      if (newImagePath) {
        data.file_path = newImagePath;
      }

      const result = await updateImage(imageId, data);
      
      if (result.success) {
        toast.success(result.message || 'Cập nhật hình ảnh thành công');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Failed to update image:', error);
      toast.error('Không thể cập nhật hình ảnh. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDisplayUrl = newImageUrl || imageUrl;
  const usedBy = image?.used_by;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Chỉnh sửa hình ảnh
            </h2>
            {usedBy && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-500">Đang dùng tại:</span>
                <a
                  href={usedBy.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  {usedBy.label}: {usedBy.name}
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Current/New Image Preview */}
            <div className="space-y-2">
              <Label>{newImageUrl ? 'Ảnh mới' : 'Ảnh hiện tại'}</Label>
              <div className="relative inline-block">
                <Image
                  src={getImageUrl(currentDisplayUrl)}
                  alt={alt || 'Preview'}
                  width={600}
                  height={400}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 max-w-full h-auto"
                />
                {newImageUrl && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setNewImagePath(null);
                      setNewImageUrl(null);
                    }}
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>
            </div>

            {/* Upload New Image Section */}
            {!newImageUrl && (
              <>
                <div className="space-y-2">
                  <Label>Đổi ảnh mới (tùy chọn)</Label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      className="hidden"
                      id="file-upload-modal"
                      disabled={isUploading}
                    />
                    <label htmlFor="file-upload-modal" className="cursor-pointer">
                      <Upload size={32} className="mx-auto mb-2 text-slate-400" />
                      <p className="text-sm font-medium">Click để chọn ảnh mới</p>
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
                  <Label htmlFor="url-input-modal">Tải ảnh từ URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="url-input-modal"
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
            )}

            {isUploading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={24} className="animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-slate-500">Đang tải ảnh lên...</span>
              </div>
            )}

            {/* Alt Text */}
            <div className="space-y-2">
              <Label htmlFor="alt-modal">Mô tả ảnh (Alt text)</Label>
              <Input
                id="alt-modal"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Mô tả ngắn gọn về ảnh (tốt cho SEO)"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active-modal"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300"
              />
              <Label htmlFor="active-modal" className="cursor-pointer">
                Kích hoạt
              </Label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isUploading}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Đang lưu...
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
