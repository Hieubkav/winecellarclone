"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button, Card, Input, Label } from "@/app/(admin)/admin/components/ui";
import { apiFetch } from "@/lib/api/client";

type ArticleCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  position: number;
  articles_count: number;
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
    .trim();

export default function ArticleCategoriesPage() {
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | "new" | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", position: 0, active: true });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<{ data: ArticleCategory[] }>("v1/admin/article-categories?per_page=100");
      setCategories(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const createCategory = async () => {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    setSaving("new");
    try {
      await apiFetch("v1/admin/article-categories", {
        method: "POST",
        body: JSON.stringify({ ...form, slug: form.slug || slugify(form.name) }),
      });
      setForm({ name: "", slug: "", description: "", position: 0, active: true });
      await loadCategories();
      toast.success("Đã tạo danh mục bài viết");
    } finally {
      setSaving(null);
    }
  };

  const updateCategory = async (category: ArticleCategory) => {
    setSaving(category.id);
    try {
      await apiFetch(`v1/admin/article-categories/${category.id}`, {
        method: "PUT",
        body: JSON.stringify(category),
      });
      await loadCategories();
      toast.success("Đã lưu danh mục");
    } finally {
      setSaving(null);
    }
  };

  const deleteCategory = async (category: ArticleCategory) => {
    if (!window.confirm(`Xóa danh mục "${category.name}"?`)) return;

    setSaving(category.id);
    try {
      await apiFetch(`v1/admin/article-categories/${category.id}`, { method: "DELETE" });
      await loadCategories();
      toast.success("Đã xóa danh mục");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Danh mục bài viết</h1>
        <p className="text-sm text-slate-500">Quản lý route dạng /danh-muc-bai-viet/ten-bai-viet.</p>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.5fr_120px_auto] md:items-end">
          <div className="space-y-1">
            <Label>Tên</Label>
            <Input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value, slug: prev.slug || slugify(event.target.value) }))}
              placeholder="Kiến thức"
            />
          </div>
          <div className="space-y-1">
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))} placeholder="kien-thuc" />
          </div>
          <div className="space-y-1">
            <Label>Mô tả</Label>
            <Input value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>Thứ tự</Label>
            <Input type="number" value={form.position} onChange={(event) => setForm((prev) => ({ ...prev, position: Number(event.target.value) }))} />
          </div>
          <Button type="button" onClick={createCategory} disabled={saving === "new"} className="gap-2">
            <Plus size={16} />
            Thêm
          </Button>
        </div>
      </Card>

      <Card>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <div className="p-4 text-sm text-slate-500">Đang tải...</div>
          ) : categories.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">Chưa có danh mục bài viết.</div>
          ) : categories.map((category, index) => (
            <div key={category.id} className="grid gap-3 p-4 md:grid-cols-[1fr_1fr_1.5fr_120px_90px_auto] md:items-center">
              <Input
                value={category.name}
                onChange={(event) => setCategories((prev) => prev.map((item, i) => i === index ? { ...item, name: event.target.value } : item))}
              />
              <Input
                value={category.slug}
                onChange={(event) => setCategories((prev) => prev.map((item, i) => i === index ? { ...item, slug: event.target.value } : item))}
              />
              <Input
                value={category.description ?? ""}
                onChange={(event) => setCategories((prev) => prev.map((item, i) => i === index ? { ...item, description: event.target.value } : item))}
              />
              <Input
                type="number"
                value={category.position}
                onChange={(event) => setCategories((prev) => prev.map((item, i) => i === index ? { ...item, position: Number(event.target.value) } : item))}
              />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={category.active}
                  onChange={(event) => setCategories((prev) => prev.map((item, i) => i === index ? { ...item, active: event.target.checked } : item))}
                />
                Hiện
              </label>
              <div className="flex justify-end gap-2">
                <span className="self-center text-xs text-slate-500">{category.articles_count} bài</span>
                <Button type="button" size="icon" variant="outline" onClick={() => updateCategory(category)} disabled={saving === category.id}>
                  <Save size={15} />
                </Button>
                <Button type="button" size="icon" variant="destructive" onClick={() => deleteCategory(category)} disabled={saving === category.id || category.articles_count > 0}>
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
