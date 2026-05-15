'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, Input, Label, Badge } from '../components/ui';
import {
  createProductFilterGroup,
  createProductFilterPreset,
  deleteProductFilterGroup,
  deleteProductFilterPreset,
  fetchAdminProductFilterGroups,
  type AdminProductFilterGroup,
} from '@/lib/api/admin';
import { toast } from 'sonner';

const emptyPayload = '{\n  "price_min": 0,\n  "price_max": 500000\n}';

export default function FilterPresetsPage() {
  const [groups, setGroups] = useState<AdminProductFilterGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupName, setGroupName] = useState('');
  const [groupSlug, setGroupSlug] = useState('');
  const [routePrefix, setRoutePrefix] = useState('san-pham');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [presetName, setPresetName] = useState('');
  const [presetSlug, setPresetSlug] = useState('');
  const [payload, setPayload] = useState(emptyPayload);

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
    await createProductFilterGroup({
      name: groupName.trim(),
      slug: groupSlug.trim() || undefined,
      route_prefix: routePrefix.trim() || 'san-pham',
      active: true,
    });
    setGroupName('');
    setGroupSlug('');
    toast.success('Đã tạo nhóm bộ lọc');
    await loadGroups();
  };

  const handleCreatePreset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedGroupId || !presetName.trim()) return;
    let parsed: Record<string, unknown> = {};
    try {
      parsed = payload.trim() ? JSON.parse(payload) : {};
    } catch {
      toast.error('Filter payload không đúng JSON');
      return;
    }

    await createProductFilterPreset(selectedGroupId, {
      name: presetName.trim(),
      slug: presetSlug.trim() || undefined,
      filter_payload: parsed,
      active: true,
    });
    setPresetName('');
    setPresetSlug('');
    setPayload(emptyPayload);
    toast.success('Đã tạo preset');
    await loadGroups();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bộ lọc SEO</h1>
        <p className="text-sm text-slate-500">Tạo route động như /san-pham/muc-gia/duoi-500k hoặc /bo-suu-tap/ban-chay từ dữ liệu thật.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <form onSubmit={handleCreateGroup} className="space-y-3">
            <h2 className="font-semibold">Tạo nhóm bộ lọc</h2>
            <div className="space-y-1">
              <Label>Tên nhóm</Label>
              <Input value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="Mức giá" />
            </div>
            <div className="space-y-1">
              <Label>Slug nhóm</Label>
              <Input value={groupSlug} onChange={(event) => setGroupSlug(event.target.value)} placeholder="muc-gia" />
            </div>
            <div className="space-y-1">
              <Label>Route prefix</Label>
              <Input value={routePrefix} onChange={(event) => setRoutePrefix(event.target.value)} placeholder="san-pham" />
            </div>
            <Button type="submit" className="gap-2"><Plus size={16} /> Tạo nhóm</Button>
          </form>
        </Card>

        <Card className="p-4">
          <form onSubmit={handleCreatePreset} className="space-y-3">
            <h2 className="font-semibold">Tạo preset</h2>
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
              <Label>Filter payload JSON</Label>
              <textarea
                value={payload}
                onChange={(event) => setPayload(event.target.value)}
                className="min-h-28 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-mono dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <Button type="submit" className="gap-2"><Plus size={16} /> Tạo preset</Button>
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
                <div className="text-xs text-slate-500">/{group.route_prefix}/{group.slug}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={group.active ? 'success' : 'secondary'}>{group.active ? 'Bật' : 'Tắt'}</Badge>
                <Button variant="ghost" size="icon" onClick={async () => { await deleteProductFilterGroup(group.id); await loadGroups(); }}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              {group.presets.map((preset) => (
                <div key={preset.id} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                  <span>{preset.name} <code className="text-xs text-slate-500">/{group.route_prefix}/{group.slug}/{preset.slug}</code></span>
                  <Button variant="ghost" size="icon" onClick={async () => { await deleteProductFilterPreset(group.id, preset.id); await loadGroups(); }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
