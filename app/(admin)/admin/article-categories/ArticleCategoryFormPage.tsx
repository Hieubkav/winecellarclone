"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button, Card, CardContent, Input, Label, Skeleton } from "@/app/(admin)/admin/components/ui";
import { ApiError, apiFetch } from "@/lib/api/client";

type ArticleCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  position: number;
};

type ArticleCategoryForm = {
  name: string;
  slug: string;
  description: string;
  position: string;
  active: string;
};

const emptyForm: ArticleCategoryForm = {
  name: "",
  slug: "",
  description: "",
  position: "0",
  active: "true",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

export function ArticleCategoryFormPage({ categoryId }: { categoryId?: number }) {
  const router = useRouter();
  const isEdit = Boolean(categoryId);
  const [form, setForm] = useState<ArticleCategoryForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!categoryId) return;

    async function loadCategory() {
      setIsLoading(true);
      try {
        const response = await apiFetch<{ data: ArticleCategory }>(`v1/admin/article-categories/${categoryId}`);
        const category = response.data;
        setForm({
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          position: String(category.position ?? 0),
          active: category.active ? "true" : "false",
        });
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
        } else {
          console.error("Failed to load article category:", error);
          toast.error("Không thể tải danh mục bài viết.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadCategory();
  }, [categoryId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        description: form.description.trim() || null,
        position: form.position ? Number(form.position) : 0,
        active: form.active === "true",
      };

      await apiFetch(categoryId ? `v1/admin/article-categories/${categoryId}` : "v1/admin/article-categories", {
        method: categoryId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      toast.success(isEdit ? "Đã lưu danh mục bài viết" : "Đã tạo danh mục bài viết");
      router.push("/admin/article-categories");
    } catch (error) {
      console.error("Failed to save article category:", error);
      if (error instanceof ApiError && error.payload && typeof error.payload === "object" && "message" in error.payload) {
        toast.error(String((error.payload as { message?: string }).message ?? "Lưu danh mục thất bại."));
      } else {
        toast.error("Lưu danh mục thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-52" />
        <Card>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">Không tìm thấy danh mục bài viết</h2>
        <p className="text-slate-500 mb-4">Danh mục này có thể đã bị xóa hoặc không tồn tại.</p>
        <Link href="/admin/article-categories">
          <Button>Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/article-categories">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isEdit ? "Cập nhật danh mục bài viết" : "Thêm danh mục bài viết"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isEdit ? "Chỉnh sửa thông tin danh mục bài viết" : "Tạo mới danh mục phân loại bài viết"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên danh mục <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                    slug: prev.slug || slugify(event.target.value),
                  }))
                }
                placeholder="Ví dụ: Kiến thức rượu vang"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: slugify(event.target.value) }))}
                placeholder="kien-thuc-ruou-vang"
              />
              <p className="text-xs text-slate-500">Để trống để tự tạo từ tên danh mục.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Mô tả ngắn cho danh mục"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="position">Thứ tự</Label>
                <Input
                  id="position"
                  type="number"
                  min={0}
                  value={form.position}
                  onChange={(event) => setForm((prev) => ({ ...prev, position: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="active">Trạng thái</Label>
                <select
                  id="active"
                  className="h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  value={form.active}
                  onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.value }))}
                >
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Tạm ẩn</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Link href="/admin/article-categories">
                <Button type="button" variant="outline">
                  Hủy bỏ
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo danh mục"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
