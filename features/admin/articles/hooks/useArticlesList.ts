import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSortableData } from "@/app/(admin)/admin/components/TableUtilities";
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
        const params: Record<string, string | number> = {
          per_page: perPage,
          page: currentPage,
        };

        if (debouncedSearchTerm) params.q = debouncedSearchTerm;

        const articlesRes = await fetchAdminArticles(params);
        setArticles(articlesRes.data);
        setTotalArticles(articlesRes.meta.total);
        setTotalPages(articlesRes.meta.last_page);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setIsInitialLoading(false);
        setIsSearching(false);
      }
    },
    [currentPage, debouncedSearchTerm, perPage]
  );

  useEffect(() => {
    loadArticles(true);
  }, []);

  useEffect(() => {
    if (!isInitialLoading) {
      loadArticles(false);
    }
  }, [currentPage, debouncedSearchTerm, perPage]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  const sortedData = useSortableData(articles, sortConfig);

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
      } else if (deleteConfirm.type === "bulk") {
        await bulkDeleteArticles(selectedIds);
        setSelectedIds([]);
      }
      setDeleteConfirm(null);
      loadArticles(false);
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Xóa thất bại. Vui lòng thử lại.");
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
