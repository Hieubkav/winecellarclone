'use client';

import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Edit, Plus, Trash2 } from 'lucide-react';
import { Button, Card, Input, Label, Badge } from '../components/ui';
import {
  createProductFilterGroup,
  createProductFilterPreset,
  deleteProductFilterGroup,
  deleteProductFilterPreset,
  fetchAdminProductFilterGroups,
  reorderProductFilterPresets,
  updateProductFilterGroup,
  updateProductFilterPreset,
  type AdminProductFilterGroup,
  type AdminProductFilterPreset,
} from '@/lib/api/admin';
import { toast } from 'sonner';

const buildPresetPath = (presetSlug?: string) => `/san-pham/{loai-ruou}${presetSlug ? `/${presetSlug}` : ''}`;

const readNumberField = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildFilterPayload = (priceMin: string, priceMax: string) => {
  const payload: Record<string, number> = {};
  const min = readNumberField(priceMin);
  const max = readNumberField(priceMax);
  if (min !== undefined) payload.price_min = min;
  if (max !== undefined) payload.price_max = max;
  return payload;
};

const readPayloadNumber = (payload: Record<string, unknown>, key: 'price_min' | 'price_max') => {
  const value = payload[key];
  return typeof value === 'number' ? String(value) : '';
};

export default function FilterPresetsPage() {
  const [groups, setGroups] = useState<AdminProductFilterGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupSlug, setGroupSlug] = useState('');
  const [showInFilters, setShowInFilters] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [editingPreset, setEditingPreset] = useState<{ groupId: number; presetId: number } | null>(null);
  const [presetName, setPresetName] = useState('');
  const [presetSlug, setPresetSlug] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [reorderingPresetId, setReorderingPresetId] = useState<number | null>(null);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const response = await fetchAdminProductFilterGroups();
      setGroups(response.data);
      setSelectedGroupId((current) => current ?? response.data[0]?.id ?? null);
    } catch (error) {
      console.error('Load filter presets failed:', error);
      toast.error('Không tải được bộ lọc SEO');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadGroups();
  }, []);

  const handleCreateGroup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!groupName.trim()) return;
    const payload = {
      name: groupName.trim(),
      slug: groupSlug.trim() || undefined,
      route_prefix: 'san-pham',
      active: true,
      show_in_filters: showInFilters,
    };
    if (editingGroupId) {
      await updateProductFilterGroup(editingGroupId, payload);
      toast.success('Đã cập nhật nhóm bộ lọc');
    } else {
      await createProductFilterGroup(payload);
      toast.success('Đã tạo nhóm bộ lọc');
    }
    setEditingGroupId(null);
    setGroupName('');
    setGroupSlug('');
    setShowInFilters(false);
    await loadGroups();
  };

  const handleCreatePreset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedGroupId || !presetName.trim()) return;
    const filterPayload = buildFilterPayload(priceMin, priceMax);
    if (Object.keys(filterPayload).length === 0) {
      toast.error('Nhập ít nhất một khoảng giá.');
      return;
    }

    const payload = {
      name: presetName.trim(),
      slug: presetSlug.trim() || undefined,
      filter_payload: filterPayload,
      active: true,
    };
    if (editingPreset) {
      await updateProductFilterPreset(editingPreset.groupId, editingPreset.presetId, payload);
      toast.success('Đã cập nhật preset');
    } else {
      await createProductFilterPreset(selectedGroupId, payload);
      toast.success('Đã tạo preset');
    }
    setEditingPreset(null);
    setPresetName('');
    setPresetSlug('');
    setPriceMin('');
    setPriceMax('');
    await loadGroups();
  };

  const startEditGroup = (group: AdminProductFilterGroup) => {
    setEditingGroupId(group.id);
    setGroupName(group.name);
    setGroupSlug(group.slug);
    setShowInFilters(Boolean(group.show_in_filters));
  };

  const startEditPreset = (group: AdminProductFilterGroup, preset: AdminProductFilterPreset) => {
    setEditingPreset({ groupId: group.id, presetId: preset.id });
    setSelectedGroupId(group.id);
    setPresetName(preset.name);
    setPresetSlug(preset.slug);
    setPriceMin(readPayloadNumber(preset.filter_payload, 'price_min'));
    setPriceMax(readPayloadNumber(preset.filter_payload, 'price_max'));
  };

  const cancelGroupEdit = () => {
    setEditingGroupId(null);
    setGroupName('');
    setGroupSlug('');
    setShowInFilters(false);
  };

  const cancelPresetEdit = () => {
    setEditingPreset(null);
    setPresetName('');
    setPresetSlug('');
    setPriceMin('');
    setPriceMax('');
  };

  const movePreset = async (group: AdminProductFilterGroup, presetId: number, direction: -1 | 1) => {
    const currentIndex = group.presets.findIndex((preset) => preset.id === presetId);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= group.presets.length) return;

    const nextPresets = [...group.presets];
    const [movedPreset] = nextPresets.splice(currentIndex, 1);
    if (!movedPreset) return;
    nextPresets.splice(nextIndex, 0, movedPreset);

    setReorderingPresetId(presetId);
    setGroups((currentGroups) => currentGroups.map((item) => (
      item.id === group.id ? { ...item, presets: nextPresets } : item
    )));

    try {
      await reorderProductFilterPresets(
        group.id,
        nextPresets.map((preset, index) => ({ id: preset.id, position: index }))
      );
      toast.success('Đã đổi vị trí preset');
      await loadGroups();
    } catch (error) {
      console.error('Reorder filter presets failed:', error);
      toast.error('Không đổi được vị trí preset');
      await loadGroups();
    } finally {
      setReorderingPresetId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bộ lọc SEO</h1>
        <p className="text-sm text-slate-500">Tạo preset như “Trên 5 triệu”; khi chọn loại rượu sẽ ra route sạch /san-pham/ruou-vang/tren-5-trieu.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <form onSubmit={handleCreateGroup} className="space-y-3">
            <h2 className="font-semibold">{editingGroupId ? 'Sửa nhóm bộ lọc' : 'Tạo nhóm bộ lọc'}</h2>
            <div className="space-y-1">
              <Label>Tên nhóm</Label>
              <Input value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="Mức giá" />
            </div>
            <div className="space-y-1">
              <Label>Mã nhóm</Label>
              <Input value={groupSlug} onChange={(event) => setGroupSlug(event.target.value)} placeholder="muc-gia" />
              <p className="text-xs text-slate-500">Mã này chỉ dùng để gom preset, không xuất hiện trong URL public.</p>
            </div>
            <div className="flex items-start gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-700">
              <input
                id="show-in-filters"
                type="checkbox"
                checked={showInFilters}
                onChange={(event) => setShowInFilters(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-blue-500"
              />
              <div className="space-y-1">
                <Label htmlFor="show-in-filters">Hiện trong bộ lọc sản phẩm</Label>
                <p className="text-xs text-slate-500">Bật để nhóm này hiện thành dropdown sau khi khách chọn loại rượu.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="gap-2"><Plus size={16} /> {editingGroupId ? 'Lưu nhóm' : 'Tạo nhóm'}</Button>
              {editingGroupId ? <Button type="button" variant="outline" onClick={cancelGroupEdit}>Hủy</Button> : null}
            </div>
          </form>
        </Card>

        <Card className="p-4">
          <form onSubmit={handleCreatePreset} className="space-y-3">
            <h2 className="font-semibold">{editingPreset ? 'Sửa preset' : 'Tạo preset'}</h2>
            <div className="space-y-1">
              <Label>Nhóm</Label>
              <select
                value={selectedGroupId ?? ''}
                onChange={(event) => setSelectedGroupId(Number(event.target.value) || null)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="">Chọn nhóm</option>
                {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
              </select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Tên preset</Label>
                <Input value={presetName} onChange={(event) => setPresetName(event.target.value)} placeholder="Dưới 500k" />
              </div>
              <div className="space-y-1">
                <Label>Slug preset</Label>
                <Input value={presetSlug} onChange={(event) => setPresetSlug(event.target.value)} placeholder="duoi-500k" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Khoảng giá</Label>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  value={priceMin}
                  onChange={(event) => setPriceMin(event.target.value)}
                  inputMode="numeric"
                  placeholder="Giá từ, ví dụ: 1000000"
                />
                <Input
                  value={priceMax}
                  onChange={(event) => setPriceMax(event.target.value)}
                  inputMode="numeric"
                  placeholder="Giá đến, ví dụ: 3000000"
                />
              </div>
              <p className="text-xs text-slate-500">Để trống một đầu nếu chỉ cần “dưới” hoặc “trên” một mức giá.</p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="gap-2"><Plus size={16} /> {editingPreset ? 'Lưu preset' : 'Tạo preset'}</Button>
              {editingPreset ? <Button type="button" variant="outline" onClick={cancelPresetEdit}>Hủy</Button> : null}
            </div>
          </form>
        </Card>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-4 text-sm text-slate-500">Đang tải...</Card>
        ) : groups.length === 0 ? (
          <Card className="p-4 text-sm text-slate-500">Chưa có nhóm bộ lọc.</Card>
        ) : groups.map((group) => (
          <Card key={group.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold">{group.name}</div>
                <div className="text-xs text-slate-500">{buildPresetPath('{slug-gia}')}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={group.active ? 'success' : 'secondary'}>{group.active ? 'Bật' : 'Tắt'}</Badge>
                <Badge variant={group.show_in_filters ? 'info' : 'outline'}>{group.show_in_filters ? 'Hiện filter' : 'Ẩn filter'}</Badge>
                <Button variant="ghost" size="icon" aria-label="Sửa nhóm" onClick={() => startEditGroup(group)}>
                  <Edit size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={async () => { await deleteProductFilterGroup(group.id); await loadGroups(); }}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              {group.presets.map((preset, index) => (
                <div key={preset.id} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                  <span>{preset.name} <code className="text-xs text-slate-500">{buildPresetPath(preset.slug)}</code></span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Đưa preset lên"
                      disabled={index === 0 || reorderingPresetId !== null}
                      onClick={() => movePreset(group, preset.id, -1)}
                    >
                      <ArrowUp size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Đưa preset xuống"
                      disabled={index === group.presets.length - 1 || reorderingPresetId !== null}
                      onClick={() => movePreset(group, preset.id, 1)}
                    >
                      <ArrowDown size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Sửa preset" onClick={() => startEditPreset(group, preset)}>
                      <Edit size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={async () => { await deleteProductFilterPreset(group.id, preset.id); await loadGroups(); }}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
