import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  bulkDeleteArticles,
  deleteArticle,
  fetchAdminArticles,
  updateArticle,
  type AdminArticle,
} from "../api/articles.api";
import { articleQueryKeys } from "../api/articles.query-keys";

const DEFAULT_COLUMNS = [
  { key: "title", label: "Tiêu đề", required: true },
  { key: "excerpt", label: "Mô tả ngắn" },
  { key: "published_at", label: "Ngày xuất bản" },
  { key: "active", label: "Trạng thái" },
];

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export type ArticleDeleteConfirm = { type: "single" | "bulk"; id?: number } | null;

export const useArticlesList = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" }>({
    key: "published_at",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_articles_perPage");
      if (saved) return Number(saved);
    }
    return 25;
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<ArticleDeleteConfirm>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_articles_columns");
      if (saved) return JSON.parse(saved);
    }
    return ["title", "published_at", "active"];
  });

  useEffect(() => {
    localStorage.setItem("admin_articles_columns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    localStorage.setItem("admin_articles_perPage", String(perPage));
  }, [perPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const queryParams = useMemo<Record<string, string | number>>(() => {
    const params: Record<string, string | number> = {
      per_page: perPage,
      page: currentPage,
    };

    if (debouncedSearchTerm) params.q = debouncedSearchTerm;
    if (sortConfig.key) {
      params.sort_by = sortConfig.key;
      params.sort_dir = sortConfig.direction;
    }

    return params;
  }, [currentPage, debouncedSearchTerm, perPage, sortConfig]);

  const articlesQuery = useQuery({
    queryKey: articleQueryKeys.list(queryParams),
    queryFn: () => fetchAdminArticles(queryParams),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (!articlesQuery.error) {
      setError(null);
      return;
    }

    console.error("Failed to fetch articles:", articlesQuery.error);
    setError("Không tải được danh sách bài viết. Vui lòng thử lại.");
  }, [articlesQuery.error]);

  const handleSort = (key: string) => {
    setCurrentPage(1);
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  const sortedData = articlesQuery.data?.data ?? [];
  const totalArticles = articlesQuery.data?.meta.total ?? 0;
  const totalPages = articlesQuery.data?.meta.last_page ?? 1;
  const isInitialLoading = articlesQuery.isLoading;
  const isSearching = articlesQuery.isFetching && !articlesQuery.isLoading;

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map((article) => article.id));
  };

  const toggleSelectItem = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const deleteMutation = useMutation({
    mutationFn: async (target: ArticleDeleteConfirm) => {
      if (!target) {
        return { type: 'none' as const };
      }

      if (target.type === "single" && target.id) {
        await deleteArticle(target.id);
        return { type: "single" as const };
      }

      if (target.type === "bulk") {
        const count = selectedIds.length;
        await bulkDeleteArticles(selectedIds);
        return { type: "bulk" as const, count };
      }

      return { type: 'none' as const };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: articleQueryKeys.lists() });
      setDeleteConfirm(null);

      if (result.type === "single") {
        toast.success("Xóa bài viết thành công");
        return;
      }

      if (result.type === "bulk") {
        setSelectedIds([]);
        toast.success(`Đã xóa ${result.count} bài viết`);
      }
    },
    onError: (error) => {
      console.error("Failed to delete:", error);
      toast.error("Xóa bài viết thất bại. Vui lòng thử lại.");
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: number; currentStatus: boolean }) => {
      await updateArticle(id, { active: !currentStatus });
      return { id, nextStatus: !currentStatus };
    },
    onSuccess: async ({ nextStatus }) => {
      await queryClient.invalidateQueries({ queryKey: articleQueryKeys.lists() });
      toast.success(nextStatus ? "Đã bật hiển thị bài viết" : "Đã tắt hiển thị bài viết", { duration: 2000 });
    },
    onError: (error) => {
      console.error("Failed to toggle status:", error);
      toast.error("Cập nhật trạng thái thất bại. Vui lòng thử lại.");
    },
  });

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteMutation.mutateAsync(deleteConfirm);
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    await statusMutation.mutateAsync({ id, currentStatus });
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return {
    columns: DEFAULT_COLUMNS,
    perPageOptions: PER_PAGE_OPTIONS,
    sortedData,
    state: {
      isInitialLoading,
      isSearching,
      totalArticles,
      error,
      searchTerm,
      sortConfig,
      currentPage,
      totalPages,
      perPage,
      selectedIds,
      deleteConfirm,
      isDeleting: deleteMutation.isPending,
      togglingStatus: statusMutation.isPending ? statusMutation.variables?.id ?? null : null,
      visibleColumns,
    },
    actions: {
      setSearchTerm,
      setCurrentPage,
      setPerPage,
      setSelectedIds,
      setDeleteConfirm,
      handleSort,
      toggleColumn,
      toggleSelectAll,
      toggleSelectItem,
      handleDelete,
      handleToggleStatus,
      formatDate,
    },
  };
};
