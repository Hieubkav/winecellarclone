import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { type ProductFilterOption } from "@/lib/api/products";
import { useProductExcel } from "@/lib/hooks/useProductExcel";
import {
  bulkDeleteProducts,
  deleteProduct,
  downloadAdminProductsExport,
  fetchAdminProductFilters,
  fetchAdminProducts,
  updateProduct,
} from "../api/products.api";
import { productQueryKeys } from "../api/products.query-keys";

const DEFAULT_COLUMNS = [
  { key: "select", label: "Chọn" },
  { key: "image", label: "Ảnh" },
  { key: "name", label: "Tên sản phẩm", required: true },
  { key: "type_name", label: "Phân loại" },
  { key: "category_name", label: "Danh mục" },
  { key: "price", label: "Giá bán" },
  { key: "active", label: "Trạng thái" },
  { key: "actions", label: "Hành động", required: true },
];

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export type ProductDeleteConfirm = { type: "single" | "bulk"; id?: number } | null;

export const useProductsList = () => {
  const queryClient = useQueryClient();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" }>({
    key: null,
    direction: "asc",
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_products_perPage");
      if (saved) return Number(saved);
    }
    return 25;
  });
  const [deleteConfirm, setDeleteConfirm] = useState<ProductDeleteConfirm>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_COLUMNS.map((column) => column.key));

  const { isExporting, exportProducts, exportTemplate } = useProductExcel();

  useEffect(() => {
    localStorage.setItem("admin_products_perPage", String(perPage));
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
    if (filterCategory) params.category_id = filterCategory;
    if (filterType) params.type_id = filterType;
    if (sortConfig.key) {
      params.sort_by = sortConfig.key;
      params.sort_dir = sortConfig.direction;
    }

    return params;
  }, [currentPage, filterCategory, filterType, debouncedSearchTerm, perPage, sortConfig]);

  const productsQuery = useQuery({
    queryKey: productQueryKeys.list(queryParams),
    queryFn: () => fetchAdminProducts(queryParams),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (!productsQuery.error) {
      return;
    }

    console.error("Failed to fetch products:", productsQuery.error);
    if (productsQuery.error instanceof ApiError) {
      console.error("Admin products API payload:", productsQuery.error.payload);
    }
  }, [productsQuery.error]);

  const filtersQuery = useQuery({
    queryKey: productQueryKeys.filters(filterType ? Number(filterType) : null),
    queryFn: () => fetchAdminProductFilters(filterType ? Number(filterType) : undefined),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showExportMenu && !target.closest(".export-menu-wrapper")) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showExportMenu]);

  const handleSort = (key: string) => {
    setCurrentPage(1);
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const sortedData = productsQuery.data?.data ?? [];
  const totalProducts = productsQuery.data?.meta.total ?? 0;
  const totalPages = productsQuery.data?.meta.last_page ?? 1;
  const isInitialLoading = productsQuery.isLoading;
  const isSearching = productsQuery.isFetching && !productsQuery.isLoading;
  const categories = filtersQuery.data?.categories ?? [];
  const types = filtersQuery.data?.types ?? [];

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map((product) => product.id));
  };

  const toggleSelectItem = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const deleteMutation = useMutation({
    mutationFn: async (target: ProductDeleteConfirm) => {
      if (!target) {
        return { type: 'none' as const };
      }

      if (target.type === "single" && target.id) {
        await deleteProduct(target.id);
        return { type: "single" as const };
      }

      if (target.type === "bulk") {
        const count = selectedIds.length;
        await bulkDeleteProducts(selectedIds);
        return { type: "bulk" as const, count };
      }

      return { type: 'none' as const };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      setDeleteConfirm(null);

      if (result.type === "single") {
        toast.success("Xóa sản phẩm thành công");
        return;
      }

      if (result.type === "bulk") {
        setSelectedIds([]);
        toast.success(`Đã xóa ${result.count} sản phẩm`);
      }
    },
    onError: (error) => {
      console.error("Failed to delete:", error);
      toast.error("Xóa sản phẩm thất bại. Vui lòng thử lại.");
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: number; currentStatus: boolean }) => {
      await updateProduct(id, { active: !currentStatus });
      return { id, nextStatus: !currentStatus };
    },
    onSuccess: async ({ nextStatus }) => {
      await queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      toast.success(nextStatus ? "Đã bật hiển thị sản phẩm" : "Đã tắt hiển thị sản phẩm", { duration: 2000 });
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

  const formatPrice = (price: number | null) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const handleExportCurrent = async () => {
    await exportProducts(sortedData, types, categories);
  };

  const handleExportAll = async () => {
    try {
      const params: Record<string, string | number> = {};
      if (debouncedSearchTerm) params.q = debouncedSearchTerm;
      if (filterCategory) params.category_id = filterCategory;
      if (filterType) params.type_id = filterType;
      if (sortConfig.key) {
        params.sort_by = sortConfig.key;
        params.sort_dir = sortConfig.direction;
      }

      const { blob, filename } = await downloadAdminProductsExport(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Đã tạo file xuất toàn bộ sản phẩm");
    } catch (error) {
      console.error("Failed to export all:", error);
      toast.error("Export toàn bộ thất bại. Vui lòng thử lại.");
    }
  };

  const handleExportTemplate = async () => {
    await exportTemplate(types, categories);
  };

  const handleImportSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
  };

  return {
    columns: DEFAULT_COLUMNS,
    perPageOptions: PER_PAGE_OPTIONS,
    isExporting,
    sortedData,
    state: {
      isInitialLoading,
      isSearching,
      togglingStatus: statusMutation.isPending ? statusMutation.variables?.id ?? null : null,
      showImportDialog,
      showExportMenu,
      totalProducts,
      categories,
      totalPages,
      types,
      searchTerm,
      filterCategory,
      filterType,
      sortConfig,
      selectedIds,
      currentPage,
      perPage,
      deleteConfirm,
      isDeleting: deleteMutation.isPending,
      visibleColumns,
    },
    actions: {
      setShowImportDialog,
      setShowExportMenu,
      setSearchTerm,
      setFilterCategory,
      setFilterType,
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
      formatPrice,
      handleExportCurrent,
      handleExportAll,
      handleExportTemplate,
      handleImportSuccess,
    },
  };
};
