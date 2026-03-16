import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { fetchProductFilters, type ProductFilterOption } from "@/lib/api/products";
import { useProductExcel } from "@/lib/hooks/useProductExcel";
import {
  bulkDeleteProducts,
  deleteProduct,
  downloadAdminProductsExport,
  fetchAdminProducts,
  updateProduct,
  type AdminProduct,
} from "../api/products.api";

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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [togglingStatus, setTogglingStatus] = useState<number | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState<ProductFilterOption[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [types, setTypes] = useState<ProductFilterOption[]>([]);
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
  const [isDeleting, setIsDeleting] = useState(false);
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

  const loadProducts = useCallback(
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
        if (filterCategory) params.category_id = filterCategory;
        if (filterType) params.type_id = filterType;
        if (sortConfig.key) {
          params.sort_by = sortConfig.key;
          params.sort_dir = sortConfig.direction;
        }

        const productsRes = await fetchAdminProducts(params);

        setProducts(productsRes.data);
        setTotalProducts(productsRes.meta.total);
        setTotalPages(productsRes.meta.last_page);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        if (error instanceof ApiError) {
          console.error("Admin products API payload:", error.payload);
        }
      } finally {
        setIsInitialLoading(false);
        setIsSearching(false);
      }
    },
    [currentPage, filterCategory, filterType, debouncedSearchTerm, perPage, sortConfig]
  );

  const loadFilters = useCallback(async () => {
    try {
      const filtersRes = await fetchProductFilters(filterType ? Number(filterType) : undefined);
      setCategories(filtersRes.categories);
      setTypes(filtersRes.types);
    } catch (error) {
      console.error("Failed to fetch product filters:", error);
    }
  }, [filterType]);

  useEffect(() => {
    loadProducts(true);
  }, []);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    if (!isInitialLoading) {
      loadProducts(false);
    }
  }, [currentPage, filterCategory, filterType, debouncedSearchTerm, perPage, sortConfig]);

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

  const sortedData = products;

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map((product) => product.id));
  };

  const toggleSelectItem = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      if (deleteConfirm.type === "single" && deleteConfirm.id) {
        await deleteProduct(deleteConfirm.id);
        toast.success("Xóa sản phẩm thành công");
      } else if (deleteConfirm.type === "bulk") {
        await bulkDeleteProducts(selectedIds);
        toast.success(`Đã xóa ${selectedIds.length} sản phẩm`);
        setSelectedIds([]);
      }
      setDeleteConfirm(null);
      loadProducts();
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Xóa sản phẩm thất bại. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    setTogglingStatus(id);
    try {
      await updateProduct(id, { active: !currentStatus });
      setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, active: !currentStatus } : product)));
      toast.success(!currentStatus ? "Đã bật hiển thị sản phẩm" : "Đã tắt hiển thị sản phẩm", { duration: 2000 });
    } catch (error) {
      console.error("Failed to toggle status:", error);
      toast.error("Cập nhật trạng thái thất bại. Vui lòng thử lại.");
    } finally {
      setTogglingStatus(null);
    }
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

  const handleImportSuccess = () => {
    loadProducts(false);
  };

  return {
    columns: DEFAULT_COLUMNS,
    perPageOptions: PER_PAGE_OPTIONS,
    isExporting,
    sortedData,
    state: {
      isInitialLoading,
      isSearching,
      products,
      togglingStatus,
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
      isDeleting,
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
