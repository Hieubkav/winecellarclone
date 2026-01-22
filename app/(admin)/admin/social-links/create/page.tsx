'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button, Card, Input, Label } from '../../components/ui';
import { createSocialLink } from '@/lib/api/admin';
import { toast } from 'sonner';

export default function SocialLinkCreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [platform, setPlatform] = useState('');
  const [url, setUrl] = useState('');
  const [order, setOrder] = useState('');
  const [active, setActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!platform.trim() || !url.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsSubmitting(true);
    try {
      const data: Record<string, unknown> = {
        platform: platform.trim(),
        url: url.trim(),
        active,
      };

      if (order) {
        data.order = parseInt(order);
      }

      const result = await createSocialLink(data);
      
      if (result.success) {
        toast.success(result.message || 'Tạo liên kết thành công');
        router.push('/admin/social-links');
      }
    } catch (error) {
      console.error('Failed to create social link:', error);
      toast.error('Không thể tạo liên kết. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/admin/social-links">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thêm liên kết mạng xã hội</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tạo liên kết mới cho footer/contact</p>
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
                placeholder="0, 1, 2, ... (để trống để tự động)"
                min="0"
              />
              <p className="text-xs text-slate-500">
                Số nhỏ hơn sẽ hiển thị trước. Để trống để tự động xếp cuối.
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
                Đang tạo...
              </>
            ) : (
              'Tạo liên kết'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
