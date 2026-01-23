'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button, Card, Input, Label, Skeleton } from '../../../components/ui';
import { fetchAdminArticle, updateArticle } from '@/lib/api/admin';
import { LexicalEditor } from '../../../components/LexicalEditor';
import { toast } from 'sonner';

export default function ArticleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [articleId, setArticleId] = useState<number | null>(null);
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    params.then(p => {
      const id = parseInt(p.id);
      setArticleId(id);
      loadArticle(id);
    });
  }, []);

  const loadArticle = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const result = await fetchAdminArticle(id);
      const article = result.data;
      
      setTitle(article.title);
      setSlug(article.slug);
      setExcerpt(article.excerpt || '');
      setContent(article.content || '');
      setActive(article.active);
    } catch (error) {
      console.error('Failed to load article:', error);
      toast.error('Không thể tải bài viết');
      router.push('/admin/articles');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!articleId) return;
    
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }

    setIsSubmitting(true);
    try {
      const data: Record<string, unknown> = {
        title,
        slug,
        excerpt: excerpt || null,
        content: content || null,
        active,
      };

      const result = await updateArticle(articleId, data);
      
      if (result.success) {
        toast.success(result.message || 'Cập nhật bài viết thành công');
        router.push('/admin/articles');
      }
    } catch (error) {
      console.error('Failed to update article:', error);
      toast.error('Không thể cập nhật bài viết. Vui lòng thử lại.');
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
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/admin/articles">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa bài viết</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Cập nhật thông tin bài viết</p>
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
                placeholder="vd: bai-viet-moi"
              />
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
