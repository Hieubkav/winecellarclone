import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  createMenu,
  deleteMenu,
  fetchAdminMenuRouteSuggestions,
  saveMenuTreeItems,
  updateMenu,
  type AdminMenuDetail,
  type AdminMenuRouteSuggestion,
  type AdminMenuRouteSuggestionGroup,
  type AdminMenuTreeItem,
} from '@/lib/api/admin';
import { assignParents, MENU_MAX_LEVEL } from '@/lib/menus/menu-tree';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, cn } from '../components/ui';
import { BulkActionBar, SelectCheckbox } from '../components/TableUtilities';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MenuTreePreview } from './MenuTreePreview';

interface MenuTreeBuilderProps {
  menus: AdminMenuDetail[];
  onRefresh: () => Promise<void>;
}

interface DraftMenuItem extends Omit<AdminMenuTreeItem, 'id' | 'menu_id'> {
  id?: number;
  menu_id?: number;
  client_id: string;
  parent_client_id?: string | null;
  source: 'menu' | 'item';
}

const newClientId = () => `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function buildHeaderDraftItems(menus: AdminMenuDetail[]): DraftMenuItem[] {
  const rows: DraftMenuItem[] = [];

  menus
    .slice()
    .sort((a, b) => a.order - b.order || a.id - b.id)
    .forEach((menu) => {
      const menuClientId = `menu-${menu.id}`;
      rows.push({
        client_id: menuClientId,
        menu_id: menu.id,
        parent_id: null,
        parent_client_id: null,
        label: menu.title,
        href: menu.href ?? '#',
        semantic_type: menu.semantic_type ?? null,
        route_payload: menu.route_payload ?? null,
        badge: null,
        icon: null,
        depth: 0,
        order: rows.length,
        active: menu.active,
        open_in_new_tab: false,
        source: 'menu',
      });

      (menu.items ?? [])
        .slice()
        .sort((a, b) => a.order - b.order || a.id - b.id)
        .forEach((item) => {
          rows.push({
            ...toDraftItem(item),
            depth: Math.min(item.depth + 1, MENU_MAX_LEVEL - 1),
            order: rows.length,
            parent_client_id: item.parent_id ? String(item.parent_id) : menuClientId,
          });
        });
    });

  return assignParents(rows) as DraftMenuItem[];
}

export function MenuTreeBuilder({ menus, onRefresh }: MenuTreeBuilderProps) {
  const [items, setItems] = useState<DraftMenuItem[]>([]);
  const [originalJson, setOriginalJson] = useState('[]');
  const [isSaving, setIsSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AdminMenuRouteSuggestionGroup[]>([]);
  const [routePickerFor, setRoutePickerFor] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const nextItems = buildHeaderDraftItems(menus);
    setItems(nextItems);
    setOriginalJson(JSON.stringify(nextItems));
  }, [menus]);

  useEffect(() => {
    fetchAdminMenuRouteSuggestions()
      .then((res) => setSuggestions(res.data))
      .catch(() => setSuggestions([]));
  }, []);

  const hasChanges = JSON.stringify(items) !== originalJson;
  const flatSuggestions = useMemo(
    () => suggestions.flatMap((group) => group.items.map((item) => ({ ...item, groupKey: group.key, groupLabel: group.label }))),
    [suggestions]
  );

  const filteredSuggestions = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return suggestions;

    return suggestions
      .map((group) => {
        const groupMatched = `${group.label} ${group.key}`.toLowerCase().includes(keyword);

        return {
          ...group,
          items: groupMatched
            ? group.items
            : group.items.filter((item) =>
              `${group.label} ${group.key} ${item.label} ${item.path} ${item.source}`.toLowerCase().includes(keyword)
            ),
        };
      })
      .filter((group) => group.items.length > 0);
  }, [query, suggestions]);

  const allSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.client_id));
  const someSelected = items.some((item) => selectedIds.includes(item.client_id));
  const hasInvalidStructure = items.some((item, index) => index === 0 ? item.depth !== 0 : item.depth > items[index - 1].depth + 1);
  const stats = [
    { label: 'Tổng', value: items.length },
    { label: 'Hiện', value: items.filter((item) => item.active).length },
    { label: 'Ẩn', value: items.filter((item) => !item.active).length },
    { label: 'Tầng', value: MENU_MAX_LEVEL },
  ];

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => items.some((item) => item.client_id === id)));
  }, [items]);

  const updateItem = (clientId: string, patch: Partial<DraftMenuItem>) => {
    setItems((current) =>
      assignParents(current.map((item) => (item.client_id === clientId ? { ...item, ...patch } : item))) as DraftMenuItem[]
    );
  };

  const addItem = (afterIndex?: number) => {
    const baseDepth = afterIndex === undefined ? 0 : items[afterIndex]?.depth ?? 0;
    const item: DraftMenuItem = {
      client_id: newClientId(),
      parent_id: null,
      parent_client_id: null,
      label: 'Menu mới',
      href: '#',
      semantic_type: null,
      route_payload: null,
      badge: null,
      icon: null,
      depth: baseDepth,
      order: afterIndex === undefined ? items.length : afterIndex + 1,
      active: true,
      open_in_new_tab: false,
      source: 'item',
    };
    const next = [...items];
    next.splice(afterIndex === undefined ? next.length : afterIndex + 1, 0, item);
    setItems(assignParents(next) as DraftMenuItem[]);
  };

  const duplicateItem = (index: number) => {
    const source = items[index];
    if (!source) return;
    const copy = { ...source, id: undefined, client_id: newClientId(), label: `${source.label} copy` };
    const next = [...items];
    next.splice(index + 1, 0, copy);
    setItems(assignParents(next) as DraftMenuItem[]);
  };

  const removeItem = (clientId: string) => {
    const removingIndex = items.findIndex((item) => item.client_id === clientId);
    const removing = items[removingIndex];
    if (!removing) return;
    const next = items.filter((item, index) => {
      if (index < removingIndex) return true;
      if (index === removingIndex) return false;

      return !(index > removingIndex && item.depth > removing.depth);
    });
    setItems(assignParents(next) as DraftMenuItem[]);
  };

  const canMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return false;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    return !next.some((item, itemIndex) => itemIndex === 0 ? item.depth !== 0 : item.depth > next[itemIndex - 1].depth + 1);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    if (!canMove(index, direction)) return;
    const target = index + direction;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(assignParents(next) as DraftMenuItem[]);
  };

  const canChangeDepth = (index: number, direction: -1 | 1) => {
    const current = items[index];
    if (!current) return false;
    const previousDepth = index > 0 ? items[index - 1].depth : 0;
    const maxDepth = Math.min(previousDepth + 1, MENU_MAX_LEVEL - 1);
    const depth = Math.min(Math.max(current.depth + direction, 0), maxDepth);
    return depth !== current.depth;
  };

  const changeDepth = (index: number, direction: -1 | 1) => {
    const current = items[index];
    if (!current || !canChangeDepth(index, direction)) return;
    const previousDepth = index > 0 ? items[index - 1].depth : 0;
    const maxDepth = Math.min(previousDepth + 1, MENU_MAX_LEVEL - 1);
    const depth = Math.min(Math.max(current.depth + direction, 0), maxDepth);
    const next = items.map((item, itemIndex) => (itemIndex === index ? { ...item, depth } : item));
    setItems(assignParents(next) as DraftMenuItem[]);
  };

  const applySuggestion = (clientId: string, suggestion: AdminMenuRouteSuggestion) => {
    updateItem(clientId, {
      label: suggestion.label,
      href: suggestion.path,
      semantic_type: suggestion.source,
      route_payload: suggestion.route_payload ?? null,
    });
    setRoutePickerFor(null);
  };

  const save = async () => {
    setIsSaving(true);
    try {
      const normalized = assignParents(items).map((item, index) => ({
        ...item,
        order: index,
      })) as DraftMenuItem[];
      const topItems = normalized.filter((item) => item.depth === 0);
      const existingMenuIds = menus.map((menu) => menu.id);
      const keptMenuIds: number[] = [];

      for (let topIndex = 0; topIndex < topItems.length; topIndex++) {
        const topItem = topItems[topIndex];
        const descendants = collectDescendants(normalized, topItem);
        let menuId = topItem.source === 'menu' ? topItem.menu_id : undefined;

        const menuPayload = {
          title: topItem.label.trim() || 'Menu mới',
          type: 'mega',
          href: topItem.href?.trim() || '#',
          semantic_type: topItem.semantic_type ?? null,
          route_payload: topItem.route_payload ?? null,
          order: topIndex,
          active: Boolean(topItem.active),
        };

        if (menuId) {
          await updateMenu(menuId, menuPayload);
        } else {
          const created = await createMenu(menuPayload);
          menuId = created.data.id;
        }

        keptMenuIds.push(menuId);
        await saveMenuTreeItems(menuId, buildChildPayload(descendants));
      }

      await Promise.all(existingMenuIds.filter((id) => !keptMenuIds.includes(id)).map((id) => deleteMenu(id)));

      setItems(normalized);
      setOriginalJson(JSON.stringify(normalized));
      toast.success('Đã lưu menu 5 cấp');
      await onRefresh();
    } catch (error) {
      console.error(error);
      toast.error('Không thể lưu menu');
    } finally {
      setIsSaving(false);
    }
  };

  const onDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...items];
    const [dragged] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, dragged);
    const invalid = next.some((item, index) => index === 0 ? item.depth !== 0 : item.depth > next[index - 1].depth + 1);
    if (invalid) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setItems(assignParents(next) as DraftMenuItem[]);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const toggleSelectItem = (clientId: string) => {
    setSelectedIds((current) => current.includes(clientId) ? current.filter((id) => id !== clientId) : [...current, clientId]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : items.map((item) => item.client_id));
  };

  const bulkDelete = () => {
    if (selectedIds.length === 0) return;
    const selected = new Set(selectedIds);
    setItems(assignParents(items.filter((item) => !selected.has(item.client_id))) as DraftMenuItem[]);
    setSelectedIds([]);
    toast.success(`Đã xóa ${selectedIds.length} liên kết`);
  };

  const bulkToggleActive = (active: boolean) => {
    if (selectedIds.length === 0) return;
    const selected = new Set(selectedIds);
    setItems((current) => current.map((item) => selected.has(item.client_id) ? { ...item, active } : item));
  };

  const createHeaderMenu = () => {
    try {
      setItems(assignParents([
        ...items,
        {
          client_id: newClientId(),
          parent_id: null,
          parent_client_id: null,
          label: 'Menu mới',
          href: '#',
          semantic_type: null,
          route_payload: null,
          badge: null,
          icon: null,
          depth: 0,
          order: items.length,
          active: true,
          open_in_new_tab: false,
          source: 'menu',
        },
      ]) as DraftMenuItem[]);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tạo menu');
    }
  };

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <GripVertical size={22} />
        </div>
        <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-slate-100">Chưa có Header Menu</h3>
        <p className="mb-4 text-sm text-slate-500">Chưa có dữ liệu menu.</p>
        <Button type="button" onClick={createHeaderMenu}>Tạo Header Menu</Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(180px,1fr)] xl:gap-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-500">Chỉnh sửa menu và bấm lưu để áp dụng. Tối đa 500 menu items.</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={save} disabled={!hasChanges || isSaving || hasInvalidStructure} className="gap-2">
              <Save size={15} />
              {isSaving ? 'Đang lưu...' : 'Lưu tất cả'}
            </Button>
          </div>
        </div>

        <BulkActionBar
          selectedCount={selectedIds.length}
          onDelete={bulkDelete}
          onClearSelection={() => setSelectedIds([])}
        />

        {selectedIds.length > 0 && (
          <div className="-mt-2 flex justify-end gap-2">
            <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => bulkToggleActive(true)}>
              <Eye size={14} /> Hiện
            </Button>
            <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => bulkToggleActive(false)}>
              <EyeOff size={14} /> Ẩn
            </Button>
          </div>
        )}

        {items.length > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <SelectCheckbox
              checked={allSelected}
              indeterminate={!allSelected && someSelected}
              onChange={toggleSelectAll}
            />
            <span className="text-slate-600 dark:text-slate-300">Chọn tất cả menu ở trang hiện tại</span>
          </div>
        )}

        {items.map((item, index) => {
          const selected = selectedIds.includes(item.client_id);

          return (
            <div
              key={item.client_id}
              draggable
              onDragStart={(event) => {
                setDragIndex(index);
                event.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOverIndex(index);
              }}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={() => onDrop(index)}
              onDragEnd={() => {
                setDragIndex(null);
                setDragOverIndex(null);
              }}
              className={cn(
                'flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all dark:border-slate-700 dark:bg-slate-900',
                selected && 'border-blue-300 ring-2 ring-blue-500/40 dark:border-blue-700',
                !item.active && 'opacity-50',
                dragIndex === index && 'scale-[0.98] opacity-50',
                dragOverIndex === index && 'border-2 border-orange-500 bg-orange-50 dark:bg-orange-900/20'
              )}
              style={{ marginLeft: Math.min(item.depth, MENU_MAX_LEVEL - 1) * 24 }}
            >
              <div className="flex items-center self-start pt-1">
                <SelectCheckbox checked={selected} onChange={() => toggleSelectItem(item.client_id)} />
              </div>

              <div className="flex cursor-grab flex-col gap-1 text-slate-300 active:cursor-grabbing">
                <button type="button" onClick={() => moveItem(index, -1)} className="hover:text-orange-600 disabled:opacity-30" disabled={!canMove(index, -1)}>
                  <ArrowUp size={14} />
                </button>
                <GripVertical size={14} className="text-slate-400" />
                <button type="button" onClick={() => moveItem(index, 1)} className="hover:text-orange-600 disabled:opacity-30" disabled={!canMove(index, 1)}>
                  <ArrowDown size={14} />
                </button>
              </div>

              <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Nhãn hiển thị</Label>
                  <Input
                    value={item.label}
                    onChange={(event) => updateItem(item.client_id, { label: event.target.value })}
                    className="h-8 min-w-0 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={item.href ?? ''}
                      onChange={(event) => updateItem(item.client_id, { href: event.target.value })}
                      className="h-8 min-w-0 font-mono text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 whitespace-nowrap"
                      onClick={() => setRoutePickerFor(item.client_id)}
                    >
                      Gợi ý
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0.5 border-l border-slate-100 pl-2 dark:border-slate-700">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeDepth(index, -1)} disabled={!canChangeDepth(index, -1)} title="Thụt lề trái">
                  <ChevronLeft size={14} />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeDepth(index, 1)} disabled={!canChangeDepth(index, 1)} title={`Thụt lề phải (tối đa ${MENU_MAX_LEVEL} tầng)`}>
                  <ChevronRight size={14} />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => addItem(index)} title="Thêm ngay bên dưới">
                  <Plus size={14} />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateItem(index)} title="Copy menu item">
                  <Copy size={14} />
                </Button>
                {item.open_in_new_tab && <ExternalLink size={14} className="text-slate-400" />}
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateItem(item.client_id, { active: !item.active })} title={item.active ? 'Ẩn' : 'Hiện'}>
                  {item.active ? <Eye size={14} /> : <EyeOff size={14} className="text-slate-400" />}
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => removeItem(item.client_id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          );
        })}

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1 border-dashed" onClick={() => addItem()}>
            <Plus size={16} className="mr-2" /> Thêm liên kết mới
          </Button>
          <Button type="button" variant="outline" className="border-dashed" onClick={createHeaderMenu}>
            <Plus size={16} className="mr-2" /> Thêm menu cấp 1
          </Button>
        </div>

        {hasInvalidStructure && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Cấu trúc menu không hợp lệ: item đầu phải ở tầng 1 và không được nhảy tầng.
          </div>
        )}
      </div>

      <div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Thống kê</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{stat.label}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="xl:col-span-2">
        <MenuTreePreview menus={buildPreviewMenus(items)} />
      </div>

      <Dialog
        open={routePickerFor !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRoutePickerFor(null);
            setQuery('');
          }
        }}
      >
        <DialogContent className="w-[80vw] max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chọn URL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên, URL hoặc nguồn..."
              className="h-9 text-sm"
            />

            {!query.trim() && (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {suggestions.slice(0, 4).map((group) => (
                  <Button
                    key={group.key}
                    type="button"
                    variant="outline"
                    className="h-20 flex-col items-start gap-1.5 text-left"
                    onClick={() => setQuery(group.label)}
                  >
                    <span className="font-semibold">{group.label}</span>
                    <span className="text-xs text-slate-500">{group.items.length} route thật</span>
                  </Button>
                ))}
              </div>
            )}

            <div className="max-h-[50vh] overflow-auto rounded-md border border-slate-200 dark:border-slate-800">
              {query.trim() ? (
                filteredSuggestions.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-slate-500">Không có gợi ý phù hợp.</div>
                ) : (
                  <div className="space-y-3 p-2">
                    {filteredSuggestions.map((group) => (
                      <div key={group.key}>
                        <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{group.label}</div>
                        {group.items.map((suggestion) => (
                          <button
                            key={`${group.key}-${suggestion.path}`}
                            type="button"
                            onClick={() => routePickerFor && applySuggestion(routePickerFor, suggestion)}
                            className="flex w-full items-center justify-between gap-3 rounded px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <div className="min-w-0">
                              <div className="truncate font-semibold text-slate-700 dark:text-slate-200">{suggestion.label}</div>
                              <div className="truncate font-mono text-xs text-slate-500">{suggestion.path}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-1 p-2">
                  {flatSuggestions.slice(0, 80).map((suggestion) => (
                    <button
                      key={`${suggestion.groupKey}-${suggestion.path}`}
                      type="button"
                      onClick={() => routePickerFor && applySuggestion(routePickerFor, suggestion)}
                      className="flex w-full items-center justify-between gap-3 rounded px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-700 dark:text-slate-200">{suggestion.label}</div>
                        <div className="truncate font-mono text-xs text-slate-500">{suggestion.path}</div>
                      </div>
                      <span className="shrink-0 text-xs text-slate-400">{suggestion.groupLabel}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {hasChanges && (
        <div className="fixed bottom-4 right-4 z-40 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <span className="text-sm text-slate-600">Có thay đổi chưa lưu</span>
          <Button type="button" onClick={save} disabled={isSaving || hasInvalidStructure} className="gap-2">
            <Check size={15} />
            {isSaving ? 'Đang lưu...' : 'Lưu tất cả'}
          </Button>
        </div>
      )}
    </div>
  );
}

function toDraftItem(item: AdminMenuTreeItem): DraftMenuItem {
  return {
    ...item,
    client_id: String(item.id),
    parent_client_id: item.parent_id ? String(item.parent_id) : null,
    source: 'item',
  };
}

function collectDescendants(items: DraftMenuItem[], topItem: DraftMenuItem): DraftMenuItem[] {
  const startIndex = items.findIndex((item) => item.client_id === topItem.client_id);
  if (startIndex < 0) return [];

  const descendants: DraftMenuItem[] = [];
  for (let index = startIndex + 1; index < items.length; index++) {
    const item = items[index];
    if (item.depth === 0) break;
    descendants.push(item);
  }

  return descendants;
}

function buildChildPayload(descendants: DraftMenuItem[]) {
  const children = descendants.map((item, index) => ({
    ...item,
    depth: Math.max(0, item.depth - 1),
    order: index,
  }));

  return (assignParents(children) as DraftMenuItem[]).map((item) => ({
    ...(item.source === 'item' && typeof item.id === 'number' ? { id: item.id } : {}),
    client_id: item.client_id,
    parent_id: typeof item.parent_id === 'number' ? item.parent_id : null,
    parent_client_id: item.parent_client_id?.startsWith('menu-') ? null : item.parent_client_id ?? null,
    label: item.label.trim() || 'Menu mới',
    href: item.href?.trim() || null,
    semantic_type: item.semantic_type ?? null,
    route_payload: item.route_payload ?? null,
    badge: item.badge?.trim() || null,
    icon: item.icon?.trim() || null,
    depth: Number(item.depth) || 0,
    order: Number(item.order) || 0,
    active: Boolean(item.active),
    open_in_new_tab: Boolean(item.open_in_new_tab),
  }));
}

function buildPreviewMenus(items: DraftMenuItem[]): AdminMenuDetail[] {
  return items
    .filter((item) => item.depth === 0)
    .map((topItem, index) => ({
      id: topItem.menu_id ?? -index - 1,
      title: topItem.label,
      type: 'mega',
      href: topItem.href,
      semantic_type: topItem.semantic_type,
      route_payload: topItem.route_payload,
      order: index,
      active: topItem.active,
      blocks: [],
      items: collectDescendants(items, topItem).map((item, itemIndex) => ({
        id: item.id ?? -itemIndex - 1,
        menu_id: topItem.menu_id ?? -index - 1,
        parent_id: typeof item.parent_id === 'number' ? item.parent_id : null,
        label: item.label,
        href: item.href,
        semantic_type: item.semantic_type,
        route_payload: item.route_payload,
        badge: item.badge,
        icon: item.icon,
        depth: Math.max(0, item.depth - 1),
        order: itemIndex,
        active: item.active,
        open_in_new_tab: item.open_in_new_tab,
        client_id: item.client_id,
      })),
    })) as AdminMenuDetail[];
}
