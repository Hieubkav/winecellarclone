'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Tag, Search, AlertTriangle, RotateCcw, Filter, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from '../components/ui';
import { SortableHeader, useSortableData, ColumnToggle } from '../components/TableUtilities';
import { 
  deleteProductType, 
  fetchAdminProductTypes, 
  fetchAdminCatalogAttributeGroups,
  seedCatalogBaseline, 
  type AdminProductType,
  type AdminCatalogAttributeGroup
} from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';

type ViewMode = 'types' | 'attributes' | 'all';

export default function ProductTypesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [types, setTypes] = useState<AdminProductType[]>([]);
  const [attributes, setAttributes] = useState<AdminCatalogAttributeGroup[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [filterFilterable, setFilterFilterable] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'type' | 'attribute'; id: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [seedConfirm, setSeedConfirm] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: 'order', direction: 'asc' });
  const [expandedTypes, setExpandedTypes] = useState<Set<number>>(new Set());
  
  // Column visibility state
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
  
  const attributeColumnsConfig = [
    { key: 'name', label: 'Tên thuộc tính', required: true },
    { key: 'code', label: 'Mã' },
    { key: 'filter_type', label: 'Loại filter', required: true },
    { key: 'input_type', label: 'Kiểu nhập' },
    { key: 'terms_count', label: 'Số giá trị', required: true },
    { key: 'products_count', label: 'Số SP' },
    { key: 'product_types', label: 'Phân loại' },
    { key: 'is_filterable', label: 'Trạng thái', required: true },
    { key: 'position', label: 'Vị trí' },
    { key: 'created_at', label: 'Ngày tạo' },
    { key: 'updated_at', label: 'Cập nhật' },
    { key: 'actions', label: 'Hành động', required: true },
  ];
  
  const [visibleTypeColumns, setVisibleTypeColumns] = useState<string[]>(
    typeColumnsConfig.filter(c => c.required || ['expand', 'name', 'products_count', 'active', 'actions'].includes(c.key)).map(c => c.key)
  );
  
  const [visibleAttributeColumns, setVisibleAttributeColumns] = useState<string[]>(
    attributeColumnsConfig.filter(c => c.required || ['name', 'filter_type', 'terms_count', 'is_filterable', 'actions'].includes(c.key)).map(c => c.key)
  );
  
  const toggleTypeColumn = (key: string) => {
    setVisibleTypeColumns(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };
  
  const toggleAttributeColumn = (key: string) => {
    setVisibleAttributeColumns(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, filterActive, filterFilterable]);

  async function loadData() {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { per_page: 100 };
      if (searchTerm) params.q = searchTerm;
      
      const promises: Promise<any>[] = [
        fetchAdminProductTypes({ ...params, ...(filterActive ? { active: filterActive } : {}) })
      ];
      
      if (viewMode === 'attributes' || viewMode === 'all') {
        promises.push(
          fetchAdminCatalogAttributeGroups({ 
            ...params, 
            ...(filterFilterable ? { is_filterable: filterFilterable } : {}) 
          })
        );
      }

      const results = await Promise.all(promises);
      setTypes(results[0].data);
      if (results[1]) {
        setAttributes(results[1].data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
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

  const filteredAttributes = React.useMemo(() => {
    if (!searchTerm) return attributes;
    const lower = searchTerm.toLowerCase();
    return attributes.filter(a => a.name.toLowerCase().includes(lower) || a.code.toLowerCase().includes(lower));
  }, [attributes, searchTerm]);

  const sortedTypes = useSortableData(filteredTypes, sortConfig);
  const sortedAttributes = useSortableData(filteredAttributes, sortConfig);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      if (deleteConfirm.type === 'type') {
        await deleteProductType(deleteConfirm.id);
      }
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

  if (isLoading) {
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Quản lý nhóm & thuộc tính</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {types.length} nhóm • {attributes.length} nhóm thuộc tính
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setSeedConfirm(true)}>
            <RotateCcw size={16} />
            Khôi phục mặc định
          </Button>
          <Link href="/admin/types/create">
            <Button className="gap-2">
              <Plus size={16} />
              Thêm mới
            </Button>
          </Link>
        </div>
      </div>

      <Card className="p-1">
        <div className="flex gap-1">
          <Button
            variant={viewMode === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('all')}
            className="flex-1"
          >
            <Layers size={16} className="mr-2" />
            Tất cả
          </Button>
          <Button
            variant={viewMode === 'types' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('types')}
            className="flex-1"
          >
            <Tag size={16} className="mr-2" />
            Nhóm SP ({types.length})
          </Button>
          <Button
            variant={viewMode === 'attributes' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('attributes')}
            className="flex-1"
          >
            <Filter size={16} className="mr-2" />
            Thuộc tính ({attributes.length})
          </Button>
        </div>
      </Card>

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-9 w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {(viewMode === 'types' || viewMode === 'all') && (
            <select
              className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Tạm ẩn</option>
            </select>
          )}
          {(viewMode === 'attributes' || viewMode === 'all') && (
            <select
              className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              value={filterFilterable}
              onChange={(e) => setFilterFilterable(e.target.value)}
            >
              <option value="">Tất cả thuộc tính</option>
              <option value="true">Có thể lọc</option>
              <option value="false">Không lọc</option>
            </select>
          )}
        </div>

        {(viewMode === 'types' || viewMode === 'all') && (
          <div className="mb-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Tag size={20} className="text-red-600" />
                Nhóm sản phẩm
              </h2>
              <ColumnToggle 
                columns={typeColumnsConfig} 
                visibleColumns={visibleTypeColumns} 
                onToggle={toggleTypeColumn} 
              />
            </div>
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
                              <Link href={`/admin/types/${type.id}/edit`}>
                                <Button variant="ghost" size="icon" aria-label="Edit">
                                  <Edit size={16} />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700"
                                aria-label="Delete"
                                onClick={() => setDeleteConfirm({ type: 'type', id: type.id })}
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
                                    : Filter;
                                  
                                  return (
                                    <div key={attr.id} className="flex items-center gap-2 text-sm p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                                      <IconComponent size={14} className="text-red-600" />
                                      <span className="font-medium">{attr.name}</span>
                                      <span className="text-xs text-slate-500">({attr.terms_count} giá trị)</span>
                                      {getFilterTypeBadge(attr.filter_type)}
                                    </div>
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
        )}

        {(viewMode === 'attributes' || viewMode === 'all') && (
          <div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Filter size={20} className="text-red-600" />
                Nhóm thuộc tính
              </h2>
              <ColumnToggle 
                columns={attributeColumnsConfig} 
                visibleColumns={visibleAttributeColumns} 
                onToggle={toggleAttributeColumn} 
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleAttributeColumns.includes('name') && <SortableHeader label="Tên thuộc tính" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />}
                  {visibleAttributeColumns.includes('code') && <SortableHeader label="Mã" sortKey="code" sortConfig={sortConfig} onSort={handleSort} />}
                  {visibleAttributeColumns.includes('filter_type') && <SortableHeader label="Loại filter" sortKey="filter_type" sortConfig={sortConfig} onSort={handleSort} />}
                  {visibleAttributeColumns.includes('input_type') && <TableHead>Kiểu nhập</TableHead>}
                  {visibleAttributeColumns.includes('terms_count') && <SortableHeader label="Số giá trị" sortKey="terms_count" sortConfig={sortConfig} onSort={handleSort} />}
                  {visibleAttributeColumns.includes('products_count') && <TableHead>Số SP</TableHead>}
                  {visibleAttributeColumns.includes('product_types') && <TableHead>Phân loại</TableHead>}
                  {visibleAttributeColumns.includes('is_filterable') && <TableHead>Trạng thái</TableHead>}
                  {visibleAttributeColumns.includes('position') && <SortableHeader label="Vị trí" sortKey="position" sortConfig={sortConfig} onSort={handleSort} />}
                  {visibleAttributeColumns.includes('created_at') && <SortableHeader label="Ngày tạo" sortKey="created_at" sortConfig={sortConfig} onSort={handleSort} />}
                  {visibleAttributeColumns.includes('updated_at') && <SortableHeader label="Cập nhật" sortKey="updated_at" sortConfig={sortConfig} onSort={handleSort} />}
                  {visibleAttributeColumns.includes('actions') && <TableHead className="text-right">Hành động</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAttributes.map(attr => {
                  const IconComponent = attr.icon_path && (LucideIcons as any)[attr.icon_path]
                    ? (LucideIcons as any)[attr.icon_path]
                    : Filter;
                  
                  return (
                    <TableRow key={attr.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      {visibleAttributeColumns.includes('name') && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                              <IconComponent size={16} className="text-red-600 dark:text-red-400" />
                            </div>
                            <span className="font-medium">{attr.name}</span>
                          </div>
                        </TableCell>
                      )}
                      {visibleAttributeColumns.includes('code') && (
                        <TableCell>
                          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{attr.code}</code>
                        </TableCell>
                      )}
                      {visibleAttributeColumns.includes('filter_type') && <TableCell>{getFilterTypeBadge(attr.filter_type)}</TableCell>}
                      {visibleAttributeColumns.includes('input_type') && (
                        <TableCell>
                          {attr.input_type ? (
                            <Badge variant="secondary">{attr.input_type}</Badge>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </TableCell>
                      )}
                      {visibleAttributeColumns.includes('terms_count') && (
                        <TableCell>
                          <Badge variant="secondary">{attr.terms_count}</Badge>
                        </TableCell>
                      )}
                      {visibleAttributeColumns.includes('products_count') && (
                        <TableCell>
                          <Badge variant="secondary">{attr.products_count || 0}</Badge>
                        </TableCell>
                      )}
                      {visibleAttributeColumns.includes('product_types') && (
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {attr.product_types.length > 0 ? (
                              attr.product_types.map(pt => (
                                <Badge key={pt.id} variant="info" className="text-xs">
                                  {pt.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">Chung</span>
                            )}
                          </div>
                        </TableCell>
                      )}
                      {visibleAttributeColumns.includes('is_filterable') && (
                        <TableCell>
                          <Badge variant={attr.is_filterable ? 'success' : 'secondary'}>
                            {attr.is_filterable ? 'Có thể lọc' : 'Không lọc'}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleAttributeColumns.includes('position') && (
                        <TableCell>
                          <Badge variant="secondary">{attr.position ?? '-'}</Badge>
                        </TableCell>
                      )}
                      {visibleAttributeColumns.includes('created_at') && (
                        <TableCell>
                          <span className="text-xs text-slate-500">
                            {attr.created_at ? new Date(attr.created_at).toLocaleDateString('vi-VN') : '-'}
                          </span>
                        </TableCell>
                      )}
                      {visibleAttributeColumns.includes('updated_at') && (
                        <TableCell>
                          <span className="text-xs text-slate-500">
                            {attr.updated_at ? new Date(attr.updated_at).toLocaleDateString('vi-VN') : '-'}
                          </span>
                        </TableCell>
                      )}
                      {visibleAttributeColumns.includes('actions') && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/attributes/${attr.id}/edit`}>
                              <Button variant="ghost" size="icon" aria-label="Edit">
                                <Edit size={16} />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                              aria-label="Delete"
                              onClick={() => setDeleteConfirm({ type: 'attribute', id: attr.id })}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
                {sortedAttributes.length === 0 && (
                  <TableRow>
                    <TableCell 
                      colSpan={visibleAttributeColumns.length} 
                      className="text-center py-8 text-slate-500"
                    >
                      {searchTerm ? 'Không tìm thấy thuộc tính phù hợp' : 'Chưa có thuộc tính nào'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
                  Bạn có chắc chắn muốn xóa {deleteConfirm.type === 'type' ? 'phân loại' : 'thuộc tính'} này?
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
                <p className="text-sm text-slate-500 mt-1">Thao tác này sẽ khôi phục nhóm thuộc tính và phân loại mặc định.</p>
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
