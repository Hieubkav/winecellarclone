'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button, Card, Input, Label, Skeleton } from '../../../components/ui';
import { fetchAdminSocialLink, updateSocialLink } from '@/lib/api/admin';
import { toast } from 'sonner';

export default function SocialLinkEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkId, setLinkId] = useState<number | null>(null);
  
  const [platform, setPlatform] = useState('');
  const [url, setUrl] = useState('');
  const [order, setOrder] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    params.then(p => {
      const id = parseInt(p.id);
      setLinkId(id);
      loadLink(id);
    });
  }, []);

  const loadLink = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const result = await fetchAdminSocialLink(id);
      const link = result.data;
      
      setPlatform(link.platform);
      setUrl(link.url);
      setOrder(link.order.toString());
      setActive(link.active);
    } catch (error) {
      console.error('Failed to load link:', error);
      toast.error('Không thể tải liên kết');
      router.push('/admin/social-links');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!linkId) return;
    
    if (!platform.trim() || !url.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsSubmitting(true);
    try {
      const data: Record<string, unknown> = {
        platform: platform.trim(),
        url: url.trim(),
        order: parseInt(order),
        active,
      };

      const result = await updateSocialLink(linkId, data);
      
      if (result.success) {
        toast.success(result.message || 'Cập nhật liên kết thành công');
        router.push('/admin/social-links');
      }
    } catch (error) {
      console.error('Failed to update link:', error);
      toast.error('Không thể cập nhật liên kết. Vui lòng thử lại.');
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
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/admin/social-links">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa liên kết</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Cập nhật thông tin liên kết mạng xã hội</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="platform">
                Tên nền tảng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="Facebook, Instagram, YouTube, ..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">
                URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://facebook.com/yourpage"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Thứ tự hiển thị</Label>
              <Input
                id="order"
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="0, 1, 2, ..."
                min="0"
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
          <Link href="/admin/social-links">
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
