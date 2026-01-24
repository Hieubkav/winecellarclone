'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Filter, Search } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from '../components/ui';
import { SortableHeader, useSortableData, ColumnToggle } from '../components/TableUtilities';
import { 
  fetchAdminCatalogAttributeGroups,
  type AdminCatalogAttributeGroup
} from '@/lib/api/admin';
import { cn } from '@/lib/utils';

export default function AttributeGroupsPage() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [attributes, setAttributes] = useState<AdminCatalogAttributeGroup[]>([]);
  const [totalAttributes, setTotalAttributes] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState<number | 'all'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_attribute_groups_perPage');
      if (saved === 'all') return 'all';
      if (saved) return Number(saved);
    }
    return 25;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterFilterable, setFilterFilterable] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: 'position', direction: 'asc' });
  const perPageOptions = [10, 25, 50, 100];

  useEffect(() => {
    localStorage.setItem('admin_attribute_groups_perPage', String(perPage));
  }, [perPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const attributeColumnsConfig = [
    { key: 'name', label: 'Tên thuộc tính', required: true },
    { key: 'code', label: 'Mã' },
    { key: 'filter_type', label: 'Loại filter', required: true },
    { key: 'input_type', label: 'Kiểu nhập' },
    { key: 'terms_count', label: 'Số giá trị', required: true },
    { key: 'products_count', label: 'Số SP' },
    { key: 'product_types', label: 'Nhóm SP' },
    { key: 'is_filterable', label: 'Trạng thái', required: true },
    { key: 'position', label: 'Vị trí' },
    { key: 'created_at', label: 'Ngày tạo' },
    { key: 'updated_at', label: 'Cập nhật' },
    { key: 'actions', label: 'Hành động', required: true },
  ];
  
  const [visibleAttributeColumns, setVisibleAttributeColumns] = useState<string[]>(
    attributeColumnsConfig.filter(c => c.required || ['name', 'filter_type', 'terms_count', 'is_filterable', 'actions'].includes(c.key)).map(c => c.key)
  );
  
  const toggleAttributeColumn = (key: string) => {
    setVisibleAttributeColumns(prev => 
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
  }, [debouncedSearchTerm, filterFilterable, currentPage, perPage]);

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
      if (filterFilterable) params.is_filterable = filterFilterable;
      
      const res = await fetchAdminCatalogAttributeGroups(params);
      setAttributes(res.data);
      setTotalAttributes(res.meta.total);
      setTotalPages(res.meta.last_page);
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

  const filteredAttributes = React.useMemo(() => {
    if (!searchTerm) return attributes;
    const lower = searchTerm.toLowerCase();
    return attributes.filter(a => a.name.toLowerCase().includes(lower) || a.code.toLowerCase().includes(lower));
  }, [attributes, searchTerm]);

  const sortedAttributes = useSortableData(filteredAttributes, sortConfig);

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Nhóm thuộc tính</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý các nhóm thuộc tính và giá trị filter • {totalAttributes} nhóm
          </p>
        </div>
        <Link href="/admin/attribute-groups/create">
          <Button className="gap-2">
            <Plus size={16} />
            Thêm mới
          </Button>
        </Link>
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
              value={filterFilterable}
              onChange={(e) => setFilterFilterable(e.target.value)}
            >
              <option value="">Tất cả thuộc tính</option>
              <option value="true">Có thể lọc</option>
              <option value="false">Không lọc</option>
            </select>
            <ColumnToggle 
              columns={attributeColumnsConfig} 
              visibleColumns={visibleAttributeColumns} 
              onToggle={toggleAttributeColumn} 
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
              {visibleAttributeColumns.includes('name') && <SortableHeader label="Tên thuộc tính" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleAttributeColumns.includes('code') && <SortableHeader label="Mã" sortKey="code" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleAttributeColumns.includes('filter_type') && <SortableHeader label="Loại filter" sortKey="filter_type" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleAttributeColumns.includes('input_type') && <TableHead>Kiểu nhập</TableHead>}
              {visibleAttributeColumns.includes('terms_count') && <SortableHeader label="Số giá trị" sortKey="terms_count" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleAttributeColumns.includes('products_count') && <TableHead>Số SP</TableHead>}
              {visibleAttributeColumns.includes('product_types') && <TableHead>Nhóm SP</TableHead>}
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
                            <Link key={pt.id} href={`/admin/product-types/${pt.id}/edit`}>
                              <Badge variant="info" className="text-xs cursor-pointer hover:bg-blue-600">
                                {pt.name}
                              </Badge>
                            </Link>
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
                        <Link href={`/admin/attribute-groups/${attr.id}/edit`}>
                          <Button variant="ghost" size="icon" aria-label="Edit">
                            <Edit size={16} />
                          </Button>
                        </Link>
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
        {sortedAttributes.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">
                Hiển thị {sortedAttributes.length} / {totalAttributes} thuộc tính
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
    </div>
  );
}
