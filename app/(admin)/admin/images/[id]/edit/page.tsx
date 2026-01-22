'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button, Card, Input, Label, Skeleton } from '../../../components/ui';
import { fetchAdminImage, updateImage } from '@/lib/api/admin';
import { toast } from 'sonner';

export default function ImageEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageId, setImageId] = useState<number | null>(null);
  
  const [imageUrl, setImageUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    params.then(p => {
      const id = parseInt(p.id);
      setImageId(id);
      loadImage(id);
    });
  }, []);

  const loadImage = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const result = await fetchAdminImage(id);
      const image = result.data;
      
      setImageUrl(image.url || '');
      setAlt(image.alt || '');
      setActive(image.active);
    } catch (error) {
      console.error('Failed to load image:', error);
      toast.error('Không thể tải hình ảnh');
      router.push('/admin/images');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageId) return;

    setIsSubmitting(true);
    try {
      const data: Record<string, unknown> = {
        alt: alt.trim() || null,
        active,
      };

      const result = await updateImage(imageId, data);
      
      if (result.success) {
        toast.success(result.message || 'Cập nhật hình ảnh thành công');
        router.push('/admin/images');
      }
    } catch (error) {
      console.error('Failed to update image:', error);
      toast.error('Không thể cập nhật hình ảnh. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <div className="p-6 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/admin/images">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa hình ảnh</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Cập nhật thông tin hình ảnh</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="p-6 space-y-6">
            {imageUrl && (
              <div className="space-y-2">
                <Label>Xem trước</Label>
                <div className="relative inline-block">
                  <Image
                    src={imageUrl}
                    alt={alt || 'Preview'}
                    width={600}
                    height={400}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 max-w-full h-auto"
                  />
                </div>
              </div>
            )}

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
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/admin/images">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Hủy
            </Button>
          </Link>
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
    </div>
  );
}
