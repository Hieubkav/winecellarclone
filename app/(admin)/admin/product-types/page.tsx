'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Tag, Search, AlertTriangle, RotateCcw, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from '../components/ui';
import { SortableHeader, useSortableData, ColumnToggle } from '../components/TableUtilities';
import { 
  deleteProductType, 
  fetchAdminProductTypes, 
  fetchAdminCatalogAttributeGroups,
  seedCatalogBaseline,
  updateProductType,
  type AdminProductType,
  type AdminCatalogAttributeGroup
} from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProductTypesPage() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [types, setTypes] = useState<AdminProductType[]>([]);
  const [totalTypes, setTotalTypes] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState<number | 'all'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_product_types_perPage');
      if (saved === 'all') return 'all';
      if (saved) return Number(saved);
    }
    return 25;
  });
  const [attributes, setAttributes] = useState<AdminCatalogAttributeGroup[]>([]);
  const [_togglingStatus, _setTogglingStatus] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [seedConfirm, setSeedConfirm] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: 'order', direction: 'asc' });
  const [expandedTypes, setExpandedTypes] = useState<Set<number>>(new Set());
  const perPageOptions = [10, 25, 50, 100];

  useEffect(() => {
    localStorage.setItem('admin_product_types_perPage', String(perPage));
  }, [perPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const typeColumnsConfig = [
    { key: 'expand', label: 'Mở rộng' },
    { key: 'name', label: 'Tên nhóm', required: true },
    { key: 'slug', label: 'Slug' },
    { key: 'order', label: 'Thứ tự' },
    { key: 'products_count', label: 'Số SP', required: true },
    { key: 'active', label: 'Trạng thái', required: true },
    { key: 'created_at', label: 'Ngày tạo' },
    { key: 'updated_at', label: 'Cập nhật' },
    { key: 'actions', label: 'Hành động', required: true },
  ];
  
  const [visibleTypeColumns, setVisibleTypeColumns] = useState<string[]>(
    typeColumnsConfig.filter(c => c.required || ['expand', 'name', 'products_count', 'active', 'actions'].includes(c.key)).map(c => c.key)
  );
  
  const toggleTypeColumn = (key: string) => {
    setVisibleTypeColumns(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  useEffect(() => {
    loadData(true);
  }, []);

  useEffect(() => {
    if (!isInitialLoading) {
      loadData(false);
    }
  }, [debouncedSearchTerm, filterActive, currentPage, perPage]);

  async function loadData(isInitial = false) {
    if (isInitial) {
      setIsInitialLoading(true);
    } else {
      setIsSearching(true);
    }
    
    try {
      const params: Record<string, string | number> = {
        per_page: perPage === 'all' ? 1000 : perPage,
        page: currentPage,
      };
      if (debouncedSearchTerm) params.q = debouncedSearchTerm;
      if (filterActive) params.active = filterActive;
      
      const [typesRes, attributesRes] = await Promise.all([
        fetchAdminProductTypes(params),
        fetchAdminCatalogAttributeGroups({ per_page: 100 })
      ]);
      
      setTypes(typesRes.data);
      setTotalTypes(typesRes.meta.total);
      setTotalPages(typesRes.meta.last_page);
      setAttributes(attributesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsInitialLoading(false);
      setIsSearching(false);
    }
  }

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredTypes = React.useMemo(() => {
    if (!searchTerm) return types;
    const lower = searchTerm.toLowerCase();
    return types.filter(t => t.name.toLowerCase().includes(lower) || t.slug.toLowerCase().includes(lower));
  }, [types, searchTerm]);

  const sortedTypes = useSortableData(filteredTypes, sortConfig);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      await deleteProductType(deleteConfirm);
      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Failed to delete:', error);
      if (error instanceof ApiError && error.payload && typeof error.payload === 'object' && 'message' in error.payload) {
        alert(String((error.payload as { message?: string }).message ?? 'Xóa thất bại.'));
      } else {
        alert('Xóa thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeedBaseline = async () => {
    setIsSeeding(true);
    try {
      const res = await seedCatalogBaseline();
      alert(res.message);
      loadData();
      setSeedConfirm(false);
    } catch (error) {
      console.error('Failed to seed baseline:', error);
      if (error instanceof ApiError && error.payload && typeof error.payload === 'object' && 'message' in error.payload) {
        alert(String((error.payload as { message?: string }).message ?? 'Khôi phục baseline thất bại.'));
      } else {
        alert('Khôi phục baseline thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsSeeding(false);
    }
  };

  const _handleToggleStatus = async (id: number, currentStatus: boolean) => {
    _setTogglingStatus(id);
    try {
      await updateProductType(id, { active: !currentStatus });
      setTypes(prev => prev.map(t => 
        t.id === id ? { ...t, active: !currentStatus } : t
      ));
      toast.success(
        !currentStatus ? 'Đã bật hiển thị nhóm sản phẩm' : 'Đã tắt hiển thị nhóm sản phẩm',
        { duration: 2000 }
      );
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Cập nhật trạng thái thất bại. Vui lòng thử lại.');
    } finally {
      _setTogglingStatus(null);
    }
  };

  const toggleExpandType = (typeId: number) => {
    setExpandedTypes(prev => {
      const next = new Set(prev);
      if (next.has(typeId)) {
        next.delete(typeId);
      } else {
        next.add(typeId);
      }
      return next;
    });
  };

  const getFilterTypeBadge = (filterType: string) => {
    const badges: Record<string, { label: string; variant: 'default' | 'secondary' | 'info' | 'success' }> = {
      checkbox: { label: 'Checkbox', variant: 'info' },
      radio: { label: 'Radio', variant: 'success' },
      range: { label: 'Range', variant: 'secondary' },
      color: { label: 'Color', variant: 'default' },
    };
    const config = badges[filterType] || { label: filterType, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isInitialLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Nhóm sản phẩm</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý các nhóm phân loại sản phẩm • {totalTypes} nhóm
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setSeedConfirm(true)}>
            <RotateCcw size={16} />
            Khôi phục mặc định
          </Button>
          <Link href="/admin/product-types/create">
            <Button className="gap-2">
              <Plus size={16} />
              Thêm mới
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              </div>
            )}
            <Input
              placeholder="Tìm kiếm..."
              className={cn("pl-9 w-48", isSearching && "pr-9")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex gap-2 items-center">
            <select
              className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Tạm ẩn</option>
            </select>
            <ColumnToggle 
              columns={typeColumnsConfig} 
              visibleColumns={visibleTypeColumns} 
              onToggle={toggleTypeColumn} 
            />
          </div>
        </div>

        <div className="relative">
          {isSearching && (
            <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] z-10 pointer-events-none rounded-lg" />
          )}
          <Table>
          <TableHeader>
            <TableRow>
              {visibleTypeColumns.includes('expand') && <TableHead className="w-[40px]"></TableHead>}
              {visibleTypeColumns.includes('name') && <SortableHeader label="Tên nhóm" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleTypeColumns.includes('slug') && <SortableHeader label="Slug" sortKey="slug" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleTypeColumns.includes('order') && <SortableHeader label="Thứ tự" sortKey="order" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleTypeColumns.includes('products_count') && <TableHead>Số SP</TableHead>}
              {visibleTypeColumns.includes('active') && <TableHead>Trạng thái</TableHead>}
              {visibleTypeColumns.includes('created_at') && <SortableHeader label="Ngày tạo" sortKey="created_at" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleTypeColumns.includes('updated_at') && <SortableHeader label="Cập nhật" sortKey="updated_at" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleTypeColumns.includes('actions') && <TableHead className="text-right">Hành động</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTypes.map(type => {
              const typeAttributes = attributes.filter(attr => 
                attr.product_types.some(pt => pt.id === type.id)
              );
              const isExpanded = expandedTypes.has(type.id);
              
              return (
                <React.Fragment key={type.id}>
                  <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    {visibleTypeColumns.includes('expand') && (
                      <TableCell>
                        {typeAttributes.length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleExpandType(type.id)}
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </Button>
                        )}
                      </TableCell>
                    )}
                    {visibleTypeColumns.includes('name') && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                            <Tag size={16} className="text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <span className="font-medium">{type.name}</span>
                            {typeAttributes.length > 0 && (
                              <span className="ml-2 text-xs text-slate-500">
                                ({typeAttributes.length} thuộc tính)
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    )}
                    {visibleTypeColumns.includes('slug') && (
                      <TableCell>
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{type.slug}</code>
                      </TableCell>
                    )}
                    {visibleTypeColumns.includes('order') && (
                      <TableCell>
                        <Badge variant="secondary">{type.order ?? '-'}</Badge>
                      </TableCell>
                    )}
                    {visibleTypeColumns.includes('products_count') && (
                      <TableCell>
                        <Badge variant="secondary">{type.products_count || 0}</Badge>
                      </TableCell>
                    )}
                    {visibleTypeColumns.includes('active') && (
                      <TableCell>
                        <Badge variant={type.active ? 'success' : 'secondary'}>
                          {type.active ? 'Hoạt động' : 'Tạm ẩn'}
                        </Badge>
                      </TableCell>
                    )}
                    {visibleTypeColumns.includes('created_at') && (
                      <TableCell>
                        <span className="text-xs text-slate-500">
                          {type.created_at ? new Date(type.created_at).toLocaleDateString('vi-VN') : '-'}
                        </span>
                      </TableCell>
                    )}
                    {visibleTypeColumns.includes('updated_at') && (
                      <TableCell>
                        <span className="text-xs text-slate-500">
                          {type.updated_at ? new Date(type.updated_at).toLocaleDateString('vi-VN') : '-'}
                        </span>
                      </TableCell>
                    )}
                    {visibleTypeColumns.includes('actions') && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/filter?type=${type.slug}`} target="_blank">
                            <Button variant="ghost" size="icon" aria-label="Xem sản phẩm">
                              <ExternalLink size={16} />
                            </Button>
                          </Link>
                          <Link href={`/admin/product-types/${type.id}/edit`}>
                            <Button variant="ghost" size="icon" aria-label="Edit">
                              <Edit size={16} />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            aria-label="Delete"
                            onClick={() => setDeleteConfirm(type.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                  {isExpanded && typeAttributes.length > 0 && (
                    <TableRow>
                      <TableCell 
                        colSpan={visibleTypeColumns.length} 
                        className="bg-slate-50/50 dark:bg-slate-900/30 p-0"
                      >
                        <div className="p-4 pl-12">
                          <div className="text-xs font-semibold text-slate-500 mb-2">Thuộc tính liên kết:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {typeAttributes.map(attr => {
                              const IconComponent = attr.icon_path && (LucideIcons as any)[attr.icon_path]
                                ? (LucideIcons as any)[attr.icon_path]
                                : Tag;
                              
                              return (
                                <Link key={attr.id} href={`/admin/attribute-groups/${attr.id}/edit`}>
                                  <div className="flex items-center gap-2 text-sm p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-800 transition-colors cursor-pointer">
                                    <IconComponent size={14} className="text-red-600" />
                                    <span className="font-medium">{attr.name}</span>
                                    <span className="text-xs text-slate-500">({attr.terms_count} giá trị)</span>
                                    {getFilterTypeBadge(attr.filter_type)}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
            {sortedTypes.length === 0 && (
              <TableRow>
                <TableCell 
                  colSpan={visibleTypeColumns.length} 
                  className="text-center py-8 text-slate-500"
                >
                  {searchTerm ? 'Không tìm thấy nhóm phù hợp' : 'Chưa có nhóm nào'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
        {sortedTypes.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">
                Hiển thị {sortedTypes.length} / {totalTypes} nhóm
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Hiển thị:</span>
                <select
                  className="h-8 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm"
                  value={perPage}
                  onChange={(e) => {
                    const value = e.target.value === 'all' ? 'all' : Number(e.target.value);
                    setPerPage(value);
                    setCurrentPage(1);
                  }}
                >
                  {perPageOptions.map(option => (
                    <option key={option} value={option}>{option} / trang</option>
                  ))}
                  <option value="all">Tất cả</option>
                </select>
              </div>
            </div>
            {totalPages > 1 && perPage !== 'all' && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                <span className="text-sm text-slate-500">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Xác nhận xóa</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Bạn có chắc chắn muốn xóa nhóm sản phẩm này?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={isDeleting}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {seedConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Khôi phục mặc định</h3>
                <p className="text-sm text-slate-500 mt-1">Thao tác này sẽ khôi phục nhóm sản phẩm và thuộc tính mặc định.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setSeedConfirm(false)} disabled={isSeeding}>
                Hủy
              </Button>
              <Button variant="secondary" onClick={handleSeedBaseline} disabled={isSeeding}>
                {isSeeding ? 'Đang khôi phục...' : 'Khôi phục'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
