"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Edit, ExternalLink, FolderTree, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Badge,
  Button,
  Card,
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/(admin)/admin/components/ui";
import { ColumnToggle, SelectCheckbox, SortableHeader } from "@/app/(admin)/admin/components/TableUtilities";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type ArticleCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  position: number;
  articles_count: number;
  created_at?: string | null;
  updated_at?: string | null;
};

type ArticleCategoryResponse = {
  data: ArticleCategory[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

const columns = [
  { key: "select", label: "Chọn" },
  { key: "name", label: "Tên danh mục", required: true },
  { key: "slug", label: "Slug" },
  { key: "description", label: "Mô tả" },
  { key: "articles_count", label: "Số bài", required: true },
  { key: "position", label: "Thứ tự" },
  { key: "active", label: "Trạng thái", required: true },
  { key: "updated_at", label: "Cập nhật" },
  { key: "actions", label: "Hành động", required: true },
];

export default function ArticleCategoriesPage() {
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [totalCategories, setTotalCategories] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_article_categories_perPage");
      if (saved) return Number(saved);
    }
    return 25;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" }>({
    key: "position",
    direction: "asc",
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.filter((column) => column.required || ["select", "name", "slug", "articles_count", "active", "actions"].includes(column.key)).map((column) => column.key)
  );
  const [deleteConfirm, setDeleteConfirm] = useState<ArticleCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState<number | null>(null);
  const perPageOptions = [10, 25, 50, 100];

  useEffect(() => {
    localStorage.setItem("admin_article_categories_perPage", String(perPage));
  }, [perPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadCategories = async (isInitial = false) => {
    if (isInitial) {
      setIsInitialLoading(true);
    } else {
      setIsSearching(true);
    }

    try {
      const params = new URLSearchParams({
        per_page: String(perPage),
        page: String(currentPage),
      });

      if (debouncedSearchTerm) params.set("q", debouncedSearchTerm);
      if (filterActive) params.set("active", filterActive);

      const response = await apiFetch<ArticleCategoryResponse>(`v1/admin/article-categories?${params.toString()}`);
      setCategories(response.data);
      setTotalCategories(response.meta?.total ?? response.data.length);
      setTotalPages(response.meta?.last_page ?? 1);
    } finally {
      setIsInitialLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    void loadCategories(true);
  }, []);

  useEffect(() => {
    if (!isInitialLoading) {
      void loadCategories(false);
    }
  }, [debouncedSearchTerm, filterActive, currentPage, perPage]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return categories;

    return [...categories].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof ArticleCategory];
      const bValue = b[sortConfig.key as keyof ArticleCategory];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        const result = aValue.localeCompare(bValue, "vi");
        return sortConfig.direction === "asc" ? result : -result;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [categories, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map((category) => category.id));
  };

  const toggleSelectItem = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleToggleStatus = async (category: ArticleCategory) => {
    setTogglingStatus(category.id);
    try {
      await apiFetch(`v1/admin/article-categories/${category.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...category, active: !category.active }),
      });
      setCategories((prev) => prev.map((item) => (item.id === category.id ? { ...item, active: !category.active } : item)));
      toast.success(!category.active ? "Đã bật hiển thị danh mục" : "Đã tắt hiển thị danh mục", { duration: 2000 });
    } finally {
      setTogglingStatus(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      await apiFetch(`v1/admin/article-categories/${deleteConfirm.id}`, { method: "DELETE" });
      setDeleteConfirm(null);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteConfirm.id));
      await loadCategories();
      toast.success("Đã xóa danh mục");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString("vi-VN") : "—");

  if (isInitialLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <Card>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} className="h-14 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Danh mục bài viết</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý danh mục và route bài viết • {totalCategories} danh mục
          </p>
        </div>
        <Link href="/admin/article-categories/create">
          <Button type="button" className="gap-2">
            <Plus size={16} />
            Thêm danh mục
          </Button>
        </Link>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                </div>
              )}
              <Input
                placeholder="Tìm danh mục..."
                className={cn("pl-9 w-48", isSearching && "pr-9")}
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <select
              className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              value={filterActive}
              onChange={(event) => {
                setFilterActive(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Tạm ẩn</option>
            </select>
          </div>
          <ColumnToggle columns={columns} visibleColumns={visibleColumns} onToggle={toggleColumn} />
        </div>

        <div className="relative">
          {isSearching && (
            <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] z-10 pointer-events-none rounded-lg" />
          )}
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.includes("select") && (
                  <TableHead className="w-[40px]">
                    <SelectCheckbox
                      checked={selectedIds.length === sortedData.length && sortedData.length > 0}
                      onChange={toggleSelectAll}
                      indeterminate={selectedIds.length > 0 && selectedIds.length < sortedData.length}
                    />
                  </TableHead>
                )}
                {visibleColumns.includes("name") && (
                  <SortableHeader label="Tên danh mục" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />
                )}
                {visibleColumns.includes("slug") && (
                  <SortableHeader label="Slug" sortKey="slug" sortConfig={sortConfig} onSort={handleSort} />
                )}
                {visibleColumns.includes("description") && <TableHead>Mô tả</TableHead>}
                {visibleColumns.includes("articles_count") && (
                  <SortableHeader label="Số bài" sortKey="articles_count" sortConfig={sortConfig} onSort={handleSort} />
                )}
                {visibleColumns.includes("position") && (
                  <SortableHeader label="Thứ tự" sortKey="position" sortConfig={sortConfig} onSort={handleSort} />
                )}
                {visibleColumns.includes("active") && <TableHead>Trạng thái</TableHead>}
                {visibleColumns.includes("updated_at") && <TableHead>Cập nhật</TableHead>}
                {visibleColumns.includes("actions") && <TableHead className="text-right">Hành động</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((category) => (
                <TableRow key={category.id} className={selectedIds.includes(category.id) ? "bg-blue-500/5" : ""}>
                  {visibleColumns.includes("select") && (
                    <TableCell>
                      <SelectCheckbox checked={selectedIds.includes(category.id)} onChange={() => toggleSelectItem(category.id)} />
                    </TableCell>
                  )}
                  {visibleColumns.includes("name") && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded flex items-center justify-center">
                          <FolderTree size={16} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{category.name}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes("slug") && (
                    <TableCell>
                      <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{category.slug}</code>
                    </TableCell>
                  )}
                  {visibleColumns.includes("description") && (
                    <TableCell>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[300px]">{category.description || "—"}</p>
                    </TableCell>
                  )}
                  {visibleColumns.includes("articles_count") && (
                    <TableCell>
                      <Badge variant="secondary">{category.articles_count || 0}</Badge>
                    </TableCell>
                  )}
                  {visibleColumns.includes("position") && (
                    <TableCell>
                      <Badge variant="secondary">{category.position ?? "—"}</Badge>
                    </TableCell>
                  )}
                  {visibleColumns.includes("active") && (
                    <TableCell>
                      <div
                        className={cn(
                          "cursor-pointer inline-flex items-center justify-center rounded-full w-8 h-4 transition-colors",
                          togglingStatus === category.id ? "opacity-50 cursor-wait" : "",
                          category.active ? "bg-green-500" : "bg-slate-300"
                        )}
                        onClick={() => handleToggleStatus(category)}
                        title={`Click để ${category.active ? "ẩn" : "hiển thị"}`}
                      >
                        <div
                          className={cn(
                            "w-3 h-3 bg-white rounded-full transition-transform",
                            category.active ? "translate-x-2" : "-translate-x-2"
                          )}
                        />
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes("updated_at") && (
                    <TableCell>
                      <span className="text-xs text-slate-500">{formatDate(category.updated_at)}</span>
                    </TableCell>
                  )}
                  {visibleColumns.includes("actions") && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/${category.slug}`} target="_blank">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-blue-600 hover:text-blue-700"
                            title="Mở danh mục trên web"
                            aria-label="Mở danh mục trên web"
                          >
                            <ExternalLink size={16} />
                          </Button>
                        </Link>
                        <Link href={`/admin/article-categories/${category.id}/edit`}>
                          <Button type="button" variant="ghost" size="icon" aria-label="Edit">
                            <Edit size={16} />
                          </Button>
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setDeleteConfirm(category)}
                          disabled={category.articles_count > 0}
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {sortedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} className="text-center py-8 text-slate-500">
                    {searchTerm || filterActive ? "Không tìm thấy kết quả phù hợp" : "Chưa có danh mục bài viết nào"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {sortedData.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">
                Hiển thị {sortedData.length} / {totalCategories} danh mục
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Hiển thị:</span>
                <select
                  className="h-8 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm"
                  value={perPage}
                  onChange={(event) => {
                    setPerPage(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {perPageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option} / trang
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                  Trước
                </Button>
                <span className="text-sm text-slate-500">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Xác nhận xóa</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Bạn có chắc chắn muốn xóa danh mục “{deleteConfirm.name}”?
                </p>
                <p className="text-xs text-red-500 mt-2">Hành động này không thể hoàn tác.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setDeleteConfirm(null)} disabled={isDeleting}>
                Hủy
              </Button>
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
