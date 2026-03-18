import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  bulkDeleteArticles,
  deleteArticle,
  fetchAdminArticles,
  updateArticle,
  type AdminArticle,
} from "../api/articles.api";

const DEFAULT_COLUMNS = [
  { key: "title", label: "Tiêu đề", required: true },
  { key: "excerpt", label: "Mô tả ngắn" },
  { key: "published_at", label: "Ngày xuất bản" },
  { key: "active", label: "Trạng thái" },
];

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export type ArticleDeleteConfirm = { type: "single" | "bulk"; id?: number } | null;

export const useArticlesList = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" }>({
    key: "published_at",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_articles_perPage");
      if (saved) return Number(saved);
    }
    return 25;
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<ArticleDeleteConfirm>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState<number | null>(null);
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

  const loadArticles = useCallback(
    async (isInitial = false) => {
      if (isInitial) {
        setIsInitialLoading(true);
      } else {
        setIsSearching(true);
      }

      try {
        setError(null);
        const params: Record<string, string | number> = {
          per_page: perPage,
          page: currentPage,
        };

        if (debouncedSearchTerm) params.q = debouncedSearchTerm;
        if (sortConfig.key) {
          params.sort_by = sortConfig.key;
          params.sort_dir = sortConfig.direction;
        }

        const articlesRes = await fetchAdminArticles(params);
        setArticles(articlesRes.data);
        setTotalArticles(articlesRes.meta.total);
        setTotalPages(articlesRes.meta.last_page);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
        setError("Không tải được danh sách bài viết. Vui lòng thử lại.");
      } finally {
        setIsInitialLoading(false);
        setIsSearching(false);
      }
    },
    [currentPage, debouncedSearchTerm, perPage, sortConfig]
  );

  useEffect(() => {
    void loadArticles(true);
  }, []);

  useEffect(() => {
    if (!isInitialLoading) {
      void loadArticles(false);
    }
  }, [currentPage, debouncedSearchTerm, perPage, sortConfig]);

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

  const sortedData = articles;

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map((article) => article.id));
  };

  const toggleSelectItem = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      if (deleteConfirm.type === "single" && deleteConfirm.id) {
        await deleteArticle(deleteConfirm.id);
        toast.success("Xóa bài viết thành công");
      } else if (deleteConfirm.type === "bulk") {
        await bulkDeleteArticles(selectedIds);
        toast.success(`Đã xóa ${selectedIds.length} bài viết`);
        setSelectedIds([]);
      }
      setDeleteConfirm(null);
      void loadArticles(false);
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Xóa bài viết thất bại. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    setTogglingStatus(id);
    try {
      await updateArticle(id, { active: !currentStatus });
      setArticles((prev) => prev.map((article) => (article.id === id ? { ...article, active: !currentStatus } : article)));
      toast.success(!currentStatus ? "Đã bật hiển thị bài viết" : "Đã tắt hiển thị bài viết", { duration: 2000 });
    } catch (error) {
      console.error("Failed to toggle status:", error);
      toast.error("Cập nhật trạng thái thất bại. Vui lòng thử lại.");
    } finally {
      setTogglingStatus(null);
    }
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
      isDeleting,
      togglingStatus,
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
