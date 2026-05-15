import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Copy,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Plus,
  Save,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  createMenu,
  fetchAdminMenuRouteSuggestions,
  saveMenuTreeItems,
  updateMenu,
  type AdminMenuDetail,
  type AdminMenuRouteSuggestion,
  type AdminMenuRouteSuggestionGroup,
  type AdminMenuTreeItem,
} from '@/lib/api/admin';
import { assignParents, MENU_MAX_LEVEL } from '@/lib/menus/menu-tree';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, cn } from '../components/ui';

interface MenuTreeBuilderProps {
  menus: AdminMenuDetail[];
  onRefresh: () => Promise<void>;
}

interface DraftMenuItem extends Omit<AdminMenuTreeItem, 'id' | 'menu_id'> {
  id?: number;
  menu_id?: number;
  client_id: string;
  parent_client_id?: string | null;
}

const newClientId = () => `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function MenuTreeBuilder({ menus, onRefresh }: MenuTreeBuilderProps) {
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(menus[0]?.id ?? null);
  const [items, setItems] = useState<DraftMenuItem[]>([]);
  const [originalJson, setOriginalJson] = useState('[]');
  const [isSaving, setIsSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AdminMenuRouteSuggestionGroup[]>([]);
  const [routePickerFor, setRoutePickerFor] = useState<string | null>(null);
  const [newMenuTitle, setNewMenuTitle] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const selectedMenu = useMemo(
    () => menus.find((menu) => menu.id === selectedMenuId) ?? menus[0],
    [menus, selectedMenuId]
  );

  useEffect(() => {
    if (!selectedMenuId && menus[0]?.id) {
      setSelectedMenuId(menus[0].id);
    }
  }, [menus, selectedMenuId]);

  useEffect(() => {
    const nextItems = (selectedMenu?.items ?? []).map(toDraftItem);
    setItems(nextItems);
    setOriginalJson(JSON.stringify(nextItems));
  }, [selectedMenu?.id, selectedMenu?.items]);

  useEffect(() => {
    fetchAdminMenuRouteSuggestions()
      .then((res) => setSuggestions(res.data))
      .catch(() => setSuggestions([]));
  }, []);

  const hasChanges = JSON.stringify(items) !== originalJson;
  const filteredSuggestions = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return suggestions;

    return suggestions
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          `${item.label} ${item.path} ${item.source}`.toLowerCase().includes(keyword)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [query, suggestions]);

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
    const removing = items.find((item) => item.client_id === clientId);
    if (!removing) return;
    const next = items.filter((item) => item.client_id !== clientId && item.parent_client_id !== clientId && item.parent_id !== removing.id);
    setItems(assignParents(next) as DraftMenuItem[]);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(assignParents(next) as DraftMenuItem[]);
  };

  const changeDepth = (index: number, direction: -1 | 1) => {
    const current = items[index];
    if (!current) return;
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
    if (!selectedMenu) return;
    setIsSaving(true);
    try {
      const normalized = assignParents(items).map((item, index) => ({
        ...item,
        order: index,
      })) as DraftMenuItem[];

      await saveMenuTreeItems(selectedMenu.id, normalized);
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

  const createTopMenu = async () => {
    const title = newMenuTitle.trim();
    if (!title) return;

    try {
      await createMenu({ title, type: 'mega', href: '#', active: true, order: menus.length });
      setNewMenuTitle('');
      toast.success('Đã tạo menu');
      await onRefresh();
    } catch (error) {
      console.error(error);
      toast.error('Không thể tạo menu');
    }
  };

  const toggleMenuActive = async () => {
    if (!selectedMenu) return;

    try {
      await updateMenu(selectedMenu.id, { active: !selectedMenu.active });
      await onRefresh();
    } catch {
      toast.error('Không thể đổi trạng thái menu');
    }
  };

  const onDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...items];
    const [dragged] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, dragged);
    setItems(assignParents(next) as DraftMenuItem[]);
    setDragIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-slate-100 p-4 dark:border-slate-800">
            <CardTitle className="text-base">Menu header</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <div className="space-y-2">
              {menus.map((menu) => (
                <button
                  key={menu.id}
                  type="button"
                  onClick={() => setSelectedMenuId(menu.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition',
                    selectedMenu?.id === menu.id
                      ? 'border-amber-300 bg-amber-50 text-amber-900'
                      : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
                  )}
                >
                  <span className="font-medium">{menu.title}</span>
                  <Badge variant={menu.active ? 'success' : 'secondary'}>{menu.active ? 'Hiện' : 'Ẩn'}</Badge>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newMenuTitle}
                onChange={(event) => setNewMenuTitle(event.target.value)}
                placeholder="Menu mới"
              />
              <Button onClick={createTopMenu} size="icon" aria-label="Tạo menu">
                <Plus size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-slate-100 p-4 dark:border-slate-800">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-base">{selectedMenu?.title ?? 'Chưa có menu'}</CardTitle>
                <p className="mt-1 text-xs text-slate-500">Quản lý cây menu tối đa {MENU_MAX_LEVEL} cấp.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedMenu && (
                  <Button variant="outline" onClick={toggleMenuActive} className="gap-2">
                    {selectedMenu.active ? <EyeOff size={15} /> : <Eye size={15} />}
                    {selectedMenu.active ? 'Ẩn menu' : 'Hiện menu'}
                  </Button>
                )}
                <Button variant="outline" onClick={() => addItem()} className="gap-2" disabled={!selectedMenu}>
                  <Plus size={15} />
                  Thêm dòng
                </Button>
                <Button onClick={save} disabled={!selectedMenu || !hasChanges || isSaving} className="gap-2">
                  <Save size={15} />
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {items.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-500">Menu này chưa có item.</p>
                <Button onClick={() => addItem()} className="mt-4 gap-2" disabled={!selectedMenu}>
                  <Plus size={15} />
                  Tạo item đầu tiên
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item, index) => (
                  <div
                    key={item.client_id}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => onDrop(index)}
                    className="relative grid gap-3 p-3 lg:grid-cols-[120px_1fr_1fr_190px] lg:items-center"
                    style={{ paddingLeft: `${12 + item.depth * 24}px` }}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Tầng {item.depth + 1}</Badge>
                      <span className="cursor-grab text-xs text-slate-400">kéo</span>
                    </div>

                    <Input
                      value={item.label}
                      onChange={(event) => updateItem(item.client_id, { label: event.target.value })}
                      placeholder="Nhãn menu"
                    />

                    <div className="relative">
                      <Input
                        value={item.href ?? ''}
                        onChange={(event) => updateItem(item.client_id, { href: event.target.value })}
                        placeholder="/duong-dan"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRoutePickerFor(routePickerFor === item.client_id ? null : item.client_id)}
                        className="absolute right-0 top-0"
                        aria-label="Chọn route"
                      >
                        <LinkIcon size={15} />
                      </Button>
                    </div>

                    <div className="flex flex-wrap justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => moveItem(index, -1)} disabled={index === 0}>
                        <ArrowUp size={15} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1}>
                        <ArrowDown size={15} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => changeDepth(index, -1)} disabled={item.depth === 0}>
                        <ArrowLeft size={15} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => changeDepth(index, 1)} disabled={item.depth >= MENU_MAX_LEVEL - 1 || index === 0}>
                        <ArrowRight size={15} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => updateItem(item.client_id, { active: !item.active })}>
                        {item.active ? <Eye size={15} /> : <EyeOff size={15} />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => duplicateItem(index)}>
                        <Copy size={15} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => addItem(index)}>
                        <Plus size={15} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.client_id)} className="text-red-600">
                        <Trash2 size={15} />
                      </Button>
                    </div>

                    {routePickerFor === item.client_id && (
                      <div className="z-20 rounded-lg border border-slate-200 bg-white p-3 shadow-xl lg:col-span-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="relative mb-3">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Tìm route thật..."
                            className="pl-9"
                          />
                        </div>
                        <div className="max-h-72 space-y-3 overflow-auto">
                          {filteredSuggestions.map((group) => (
                            <div key={group.key}>
                              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{group.label}</div>
                              <div className="grid gap-1 md:grid-cols-2">
                                {group.items.map((suggestion) => (
                                  <button
                                    key={`${group.key}-${suggestion.path}`}
                                    type="button"
                                    onClick={() => applySuggestion(item.client_id, suggestion)}
                                    className="rounded-md border border-slate-100 px-3 py-2 text-left text-sm hover:border-amber-300 hover:bg-amber-50 dark:border-slate-800"
                                  >
                                    <span className="block font-medium text-slate-800 dark:text-slate-100">{suggestion.label}</span>
                                    <span className="block truncate text-xs text-slate-500">{suggestion.path}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {hasChanges && (
        <div className="sticky bottom-4 z-30 rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium text-amber-900">Bạn có thay đổi chưa lưu.</span>
            <Button onClick={save} disabled={isSaving} className="gap-2">
              <Check size={15} />
              Lưu tất cả
            </Button>
          </div>
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
  };
}
