'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Loader2, ImageIcon } from 'lucide-react';
import { Button, Card, Input, Label } from '../../components/ui';
import { fetchAdminImage, updateImage, type AdminImageDetail } from '@/lib/api/admin';
import { toast } from 'sonner';

interface ImageEditModalProps {
  imageId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImageEditModal({ imageId, isOpen, onClose, onSuccess }: ImageEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<AdminImageDetail | null>(null);
  const [alt, setAlt] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (isOpen && imageId) {
      loadImage(imageId);
    } else {
      setImage(null);
      setAlt('');
      setActive(true);
    }
  }, [isOpen, imageId]);

  const loadImage = async (id: number) => {
    setIsLoading(true);
    try {
      const result = await fetchAdminImage(id);
      setImage(result.data);
      setAlt(result.data.alt || '');
      setActive(result.data.active);
    } catch (error) {
      console.error('Failed to load image:', error);
      toast.error('Không thể tải hình ảnh');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageId) return;

    setIsSubmitting(true);
    try {
      const data = {
        alt: alt.trim() || null,
        active,
      };

      const result = await updateImage(imageId, data);

      if (result.success) {
        toast.success('Cập nhật hình ảnh thành công');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Failed to update image:', error);
      toast.error('Không thể cập nhật hình ảnh');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold">Chỉnh sửa hình ảnh</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </Button>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-slate-400" />
            </div>
          </div>
        ) : image ? (
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Xem trước</Label>
                <div className="relative w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                  {image.url ? (
                    <Image
                      src={image.url}
                      alt={alt || 'Preview'}
                      fill
                      sizes="(max-width: 768px) 100vw, 672px"
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={48} className="text-slate-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Tên file:</span>
                  <p className="font-medium truncate">{image.file_path}</p>
                </div>
                <div>
                  <span className="text-slate-500">Kích thước:</span>
                  <p className="font-medium">
                    {image.width && image.height ? `${image.width}×${image.height}` : '—'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alt">Mô tả ảnh (Alt text)</Label>
                <Input
                  id="alt"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Mô tả ngắn gọn về ảnh (tốt cho SEO)"
                />
                <p className="text-xs text-slate-500">
                  Alt text giúp tối ưu SEO và hỗ trợ người dùng khiếm thị
                </p>
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
                  Kích hoạt
                </Label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
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
            </div>
          </form>
        ) : null}
      </Card>
    </div>
  );
}
