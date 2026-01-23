'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button, Card, Input, Label, Skeleton } from '../../components/ui';
import { createArticle } from '@/lib/api/admin';
import { LexicalEditor } from '../../components/LexicalEditor';
import { toast } from 'sonner';

export default function ArticleCreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [active, setActive] = useState(true);

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
        excerpt: excerpt || null,
        content: content || null,
        active,
      };

      if (slug.trim()) {
        data.slug = slug;
      }

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
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề bài viết"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL thân thiện)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="vd: bai-viet-moi (để trống để tự động tạo)"
              />
              <p className="text-xs text-slate-500">
                Để trống để tự động tạo slug từ tiêu đề
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Mô tả ngắn</Label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Nhập mô tả ngắn (hiển thị trong danh sách)"
                className="w-full min-h-[80px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-y"
                maxLength={500}
              />
              <p className="text-xs text-slate-500">
                {excerpt.length}/500 ký tự
              </p>
            </div>

            <div className="space-y-2">
              <Label>Nội dung</Label>
              <LexicalEditor 
                initialContent={content}
                onChange={setContent}
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
