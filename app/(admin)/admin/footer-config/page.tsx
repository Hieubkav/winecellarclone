'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Save, Download, Eye, EyeOff, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button, Card, Input, Label, Skeleton } from '../components/ui';
import { fetchAdminSettings, updateSettings, fetchAdminSocialLinks, type AdminSocialLink } from '@/lib/api/admin';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface FooterColumn {
  id: string;
  title: string;
  type: 'info' | 'contact' | 'social' | 'custom';
  active: boolean;
  items: FooterItem[];
}

interface FooterItem {
  id: string;
  label: string;
  value: string;
  href?: string;
  type: 'text' | 'link' | 'phone' | 'email' | 'address';
}

interface FooterConfig {
  columns: FooterColumn[];
  copyright: string;
  tagline: string;
  showBackToTop: boolean;
}

const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  columns: [
    {
      id: 'col-1',
      title: 'Hotline',
      type: 'contact',
      active: true,
      items: [{ id: 'item-1', label: 'Hotline', value: '', type: 'phone' }],
    },
    {
      id: 'col-2',
      title: 'Địa chỉ',
      type: 'info',
      active: true,
      items: [
        { id: 'item-2', label: 'Địa chỉ', value: '', type: 'address' },
        { id: 'item-3', label: 'Giờ làm việc', value: '', type: 'text' },
      ],
    },
    {
      id: 'col-3',
      title: 'Mạng xã hội',
      type: 'social',
      active: true,
      items: [],
    },
  ],
  copyright: '© {year} {siteName}. All rights reserved.',
  tagline: 'Crafted with đam mê & tinh tế khẩu vị.',
  showBackToTop: true,
};

function generateId() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface SortableColumnProps {
  column: FooterColumn;
  onUpdate: (column: FooterColumn) => void;
  onDelete: () => void;
}

function SortableColumn({ column, onUpdate, onDelete }: SortableColumnProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const addItem = () => {
    const newItem: FooterItem = {
      id: generateId(),
      label: 'Mục mới',
      value: '',
      type: 'text',
    };
    onUpdate({ ...column, items: [...column.items, newItem] });
  };

  const updateItem = (itemId: string, updates: Partial<FooterItem>) => {
    onUpdate({
      ...column,
      items: column.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
    });
  };

  const deleteItem = (itemId: string) => {
    onUpdate({ ...column, items: column.items.filter((item) => item.id !== itemId) });
  };

  return (
    <Card ref={setNodeRef} style={style} className={cn('p-4', !column.active && 'opacity-50')}>
      <div className="flex items-center gap-2 mb-4">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
          <GripVertical size={18} className="text-slate-400" />
        </button>
        <Input
          value={column.title}
          onChange={(e) => onUpdate({ ...column, title: e.target.value })}
          className="flex-1 font-semibold"
          placeholder="Tiêu đề cột"
        />
        <button
          onClick={() => onUpdate({ ...column, active: !column.active })}
          className={cn('p-2 rounded-md transition-colors', column.active ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100')}
          title={column.active ? 'Đang hiển thị' : 'Đang ẩn'}
        >
          {column.active ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
        <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Xóa cột">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {column.items.map((item) => (
          <div key={item.id} className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={item.label}
                  onChange={(e) => updateItem(item.id, { label: e.target.value })}
                  placeholder="Nhãn"
                  className="flex-1"
                />
                <select
                  value={item.type}
                  onChange={(e) => updateItem(item.id, { type: e.target.value as FooterItem['type'] })}
                  className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                >
                  <option value="text">Văn bản</option>
                  <option value="phone">Điện thoại</option>
                  <option value="email">Email</option>
                  <option value="address">Địa chỉ</option>
                  <option value="link">Liên kết</option>
                </select>
              </div>
              <Input
                value={item.value}
                onChange={(e) => updateItem(item.id, { value: e.target.value })}
                placeholder={item.type === 'phone' ? '0909 123 456' : item.type === 'email' ? 'email@example.com' : 'Nội dung'}
              />
              {item.type === 'link' && (
                <Input
                  value={item.href || ''}
                  onChange={(e) => updateItem(item.id, { href: e.target.value })}
                  placeholder="URL (https://...)"
                />
              )}
            </div>
            <button onClick={() => deleteItem(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {column.type !== 'social' && (
          <Button variant="outline" size="sm" onClick={addItem} className="w-full gap-2">
            <Plus size={16} />
            Thêm mục
          </Button>
        )}

        {column.type === 'social' && (
          <p className="text-xs text-slate-500 text-center py-2">
            Mạng xã hội được tải từ cấu hình riêng
          </p>
        )}
      </div>
    </Card>
  );
}

export default function FooterConfigPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [config, setConfig] = useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);
  const [showPreview, setShowPreview] = useState(false);
  const [siteName, setSiteName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminSettings();
      const data = res.data;
      setSiteName(data.site_name || 'Wine Cellar');
      if (data.footer_config) {
        setConfig(data.footer_config as FooterConfig);
      }
    } catch (error) {
      console.error('Failed to load footer config:', error);
      toast.error('Không thể tải cấu hình footer');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const loadFromSettings = async () => {
    setIsLoadingData(true);
    try {
      const [settingsRes, socialRes] = await Promise.all([
        fetchAdminSettings(),
        fetchAdminSocialLinks({ per_page: 100 }),
      ]);
      const settings = settingsRes.data;
      const socialLinks = socialRes.data;

      const newColumns = [...config.columns];

      // Update contact column
      const contactCol = newColumns.find((c) => c.type === 'contact');
      if (contactCol && settings.hotline) {
        const phoneItem = contactCol.items.find((i) => i.type === 'phone');
        if (phoneItem) {
          phoneItem.value = settings.hotline;
        }
      }

      // Update info column
      const infoCol = newColumns.find((c) => c.type === 'info');
      if (infoCol) {
        const addressItem = infoCol.items.find((i) => i.type === 'address');
        if (addressItem && settings.address) {
          addressItem.value = settings.address;
        }
        const hoursItem = infoCol.items.find((i) => i.label.toLowerCase().includes('giờ'));
        if (hoursItem && settings.hours) {
          hoursItem.value = `Giờ mở cửa: ${settings.hours}`;
        }
      }

      // Update social column
      const socialCol = newColumns.find((c) => c.type === 'social');
      if (socialCol) {
        socialCol.items = socialLinks
          .filter((link: AdminSocialLink) => link.active)
          .map((link: AdminSocialLink) => ({
            id: `social-${link.id}`,
            label: link.platform,
            value: link.platform,
            href: link.url,
            type: 'link' as const,
          }));
      }

      setConfig({ ...config, columns: newColumns });
      toast.success('Đã tải dữ liệu từ cấu hình hệ thống');
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = config.columns.findIndex((c) => c.id === active.id);
    const newIndex = config.columns.findIndex((c) => c.id === over.id);
    setConfig({ ...config, columns: arrayMove(config.columns, oldIndex, newIndex) });
  };

  const addColumn = () => {
    const newColumn: FooterColumn = {
      id: generateId(),
      title: 'Cột mới',
      type: 'custom',
      active: true,
      items: [],
    };
    setConfig({ ...config, columns: [...config.columns, newColumn] });
  };

  const updateColumn = (columnId: string, updates: FooterColumn) => {
    setConfig({
      ...config,
      columns: config.columns.map((c) => (c.id === columnId ? updates : c)),
    });
  };

  const deleteColumn = (columnId: string) => {
    setConfig({ ...config, columns: config.columns.filter((c) => c.id !== columnId) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateSettings({ footer_config: config });
      toast.success('Lưu cấu hình footer thành công');
    } catch (error) {
      console.error('Failed to save footer config:', error);
      toast.error('Không thể lưu cấu hình');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Cấu hình Footer</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tùy chỉnh nội dung và bố cục footer trang web</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadFromSettings} disabled={isLoadingData} className="gap-2">
            {isLoadingData ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Tải từ Settings
          </Button>
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className="gap-2">
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            {showPreview ? 'Ẩn preview' : 'Xem preview'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Columns */}
        <Card className="p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Các cột Footer</h2>
            <Button type="button" variant="outline" size="sm" onClick={addColumn} className="gap-2">
              <Plus size={16} />
              Thêm cột
            </Button>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={config.columns.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {config.columns.map((column) => (
                  <SortableColumn
                    key={column.id}
                    column={column}
                    onUpdate={(updated) => updateColumn(column.id, updated)}
                    onDelete={() => deleteColumn(column.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </Card>

        {/* Copyright & Tagline */}
        <Card className="p-4 mb-6">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Copyright & Tagline</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="copyright">Copyright</Label>
              <Input
                id="copyright"
                value={config.copyright}
                onChange={(e) => setConfig({ ...config, copyright: e.target.value })}
                placeholder="© {year} {siteName}. All rights reserved."
              />
              <p className="text-xs text-slate-500">Dùng {'{year}'} và {'{siteName}'} làm placeholder</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={config.tagline}
                onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                placeholder="Slogan hoặc câu nói hay"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showBackToTop}
                onChange={(e) => setConfig({ ...config, showBackToTop: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Hiển thị nút &quot;Quay lại đầu trang&quot;</span>
            </label>
          </div>
        </Card>

        {/* Preview */}
        {showPreview && (
          <Card className="mb-6 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Preview Footer</h2>
            </div>
            <FooterPreview config={config} siteName={siteName} />
          </Card>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save size={16} />
                Lưu cấu hình
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function FooterPreview({ config, siteName }: { config: FooterConfig; siteName: string }) {
  const currentYear = new Date().getFullYear();
  const parsedCopyright = config.copyright.replace('{year}', String(currentYear)).replace('{siteName}', siteName);

  const activeColumns = config.columns.filter((c) => c.active);

  if (activeColumns.length === 0) {
    return (
      <div className="bg-[#1a1a1a] text-amber-100 p-8 text-center">
        <p className="text-sm">{parsedCopyright}</p>
        {config.tagline && <p className="text-xs mt-1 opacity-60">{config.tagline}</p>}
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] text-amber-100 p-6">
      <div className={cn('grid gap-6', activeColumns.length === 1 && 'grid-cols-1', activeColumns.length === 2 && 'grid-cols-1 sm:grid-cols-2', activeColumns.length >= 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')}>
        {activeColumns.map((column) => (
          <div key={column.id} className={cn('text-center', activeColumns.length === 1 ? 'text-center' : 'sm:text-left last:sm:text-right')}>
            <p className="text-sm font-semibold text-amber-200 mb-2">{column.title}</p>
            {column.type === 'social' ? (
              <div className="flex gap-2 justify-center sm:justify-start last:sm:justify-end">
                {column.items.length > 0 ? (
                  column.items.map((item) => (
                    <span key={item.id} className="w-10 h-10 flex items-center justify-center rounded-full border border-red-400 text-red-400 text-xs">
                      {item.value.slice(0, 2)}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-white/50">Đang cập nhật</span>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {column.items.map((item) => (
                  <div key={item.id}>
                    {item.type === 'phone' ? (
                      <span className="text-lg font-bold text-red-400">{item.value || 'Chưa có số'}</span>
                    ) : item.type === 'link' ? (
                      <a href={item.href} className="text-sm text-white/80 hover:text-white">{item.value}</a>
                    ) : (
                      <p className="text-sm text-white/80">{item.value || item.label}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/60">
        <span>{parsedCopyright}</span>
        {config.tagline && <span>{config.tagline}</span>}
      </div>
    </div>
  );
}
