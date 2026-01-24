'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Save,
  Loader2,
  ExternalLink,
  Edit2,
  X,
  Check,
  Menu as MenuIcon,
  Layers,
  Link as LinkIcon,
} from 'lucide-react';
import {
  Button,
  Card,
  Input,
  Label,
  Badge,
  cn,
} from '../components/ui';
import {
  type AdminMenuDetail,
  type AdminMenuBlock,
  type AdminMenuBlockItem,
  updateMenu,
  createMenuBlock,
  updateMenuBlock,
  deleteMenuBlock,
  createMenuBlockItem,
  updateMenuBlockItem,
  deleteMenuBlockItem,
  reorderMenus,
} from '@/lib/api/admin';
import { toast } from 'sonner';

// ==================== TYPES ====================

interface MenuBuilderProps {
  menus: AdminMenuDetail[];
  onRefresh: () => void;
}

interface EditingState {
  type: 'menu' | 'block' | 'item';
  id: number;
  field: string;
  value: string;
}

// ==================== SORTABLE COMPONENTS ====================

interface SortableMenuProps {
  menu: AdminMenuDetail;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (field: string, value: string) => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onAddBlock: () => void;
  children: React.ReactNode;
  editingState: EditingState | null;
  onStartEdit: (type: 'menu' | 'block' | 'item', id: number, field: string, currentValue: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  isSaving: boolean;
}

function SortableMenu({
  menu,
  isExpanded,
  onToggleExpand,
  onToggleActive,
  onDelete,
  onAddBlock,
  children,
  editingState,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  isSaving,
}: SortableMenuProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `menu-${menu.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isEditingTitle = editingState?.type === 'menu' && editingState?.id === menu.id && editingState?.field === 'title';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'border rounded-lg bg-white dark:bg-slate-900 transition-all',
        isDragging && 'opacity-50 shadow-lg',
        !menu.active && 'opacity-60'
      )}
    >
      {/* Menu Header */}
      <div className="flex items-center gap-2 p-3 border-b border-slate-100 dark:border-slate-800">
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          type="button"
        >
          <GripVertical size={16} />
        </button>

        <button
          onClick={onToggleExpand}
          className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          type="button"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <MenuIcon size={16} className="text-slate-400" />

        {/* Inline Title Edit */}
        {isEditingTitle ? (
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={editingState.value}
              onChange={(e) => onStartEdit('menu', menu.id, 'title', e.target.value)}
              className="h-8 text-sm font-medium"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit();
                if (e.key === 'Escape') onCancelEdit();
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-green-600"
              onClick={onSaveEdit}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-slate-500"
              onClick={onCancelEdit}
            >
              <X size={14} />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => onStartEdit('menu', menu.id, 'title', menu.title)}
            className="flex-1 text-left font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {menu.title}
          </button>
        )}

        {menu.type && (
          <Badge variant="secondary" className="text-xs">
            {menu.type}
          </Badge>
        )}

        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Layers size={12} />
          {menu.blocks?.length || 0}
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onToggleActive}
          title={menu.active ? 'Ẩn' : 'Hiện'}
        >
          {menu.active ? <Eye size={14} /> : <EyeOff size={14} className="text-slate-400" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-red-500 hover:text-red-600"
          onClick={onDelete}
        >
          <Trash2 size={14} />
        </Button>
      </div>

      {/* Blocks Content */}
      {isExpanded && (
        <div className="p-3 space-y-2">
          {children}
          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed gap-2"
            onClick={onAddBlock}
          >
            <Plus size={14} />
            Thêm block
          </Button>
        </div>
      )}
    </div>
  );
}

interface SortableBlockProps {
  block: AdminMenuBlock;
  menuId: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onAddItem: () => void;
  children: React.ReactNode;
  editingState: EditingState | null;
  onStartEdit: (type: 'menu' | 'block' | 'item', id: number, field: string, currentValue: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  isSaving: boolean;
}

function SortableBlock({
  block,
  isExpanded,
  onToggleExpand,
  onToggleActive,
  onDelete,
  onAddItem,
  children,
  editingState,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  isSaving,
}: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `block-${block.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isEditingTitle = editingState?.type === 'block' && editingState?.id === block.id && editingState?.field === 'title';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'border rounded-md bg-slate-50 dark:bg-slate-800/50 transition-all',
        isDragging && 'opacity-50 shadow-md',
        !block.active && 'opacity-60'
      )}
    >
      {/* Block Header */}
      <div className="flex items-center gap-2 p-2">
        <button
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
          type="button"
        >
          <GripVertical size={14} />
        </button>

        <button
          onClick={onToggleExpand}
          className="p-0.5 text-slate-500"
          type="button"
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <Layers size={14} className="text-orange-500" />

        {/* Inline Title Edit */}
        {isEditingTitle ? (
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={editingState.value}
              onChange={(e) => onStartEdit('block', block.id, 'title', e.target.value)}
              className="h-7 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit();
                if (e.key === 'Escape') onCancelEdit();
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-green-600"
              onClick={onSaveEdit}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={onCancelEdit}
            >
              <X size={12} />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => onStartEdit('block', block.id, 'title', block.title)}
            className="flex-1 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600"
          >
            {block.title}
          </button>
        )}

        <span className="text-xs text-slate-400">
          {block.items?.length || 0} items
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onToggleActive}
        >
          {block.active ? <Eye size={12} /> : <EyeOff size={12} className="text-slate-400" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-red-500"
          onClick={onDelete}
        >
          <Trash2 size={12} />
        </Button>
      </div>

      {/* Items Content */}
      {isExpanded && (
        <div className="px-2 pb-2 pl-8 space-y-1">
          {children}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs gap-1 h-7"
            onClick={onAddItem}
          >
            <Plus size={12} />
            Thêm item
          </Button>
        </div>
      )}
    </div>
  );
}

interface SortableItemProps {
  item: AdminMenuBlockItem;
  blockId: number;
  onToggleActive: () => void;
  onDelete: () => void;
  editingState: EditingState | null;
  onStartEdit: (type: 'menu' | 'block' | 'item', id: number, field: string, currentValue: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  isSaving: boolean;
}

function SortableItem({
  item,
  onToggleActive,
  onDelete,
  editingState,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  isSaving,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `item-${item.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isEditingLabel = editingState?.type === 'item' && editingState?.id === item.id && editingState?.field === 'label';
  const isEditingHref = editingState?.type === 'item' && editingState?.id === item.id && editingState?.field === 'href';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 p-1.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-all',
        isDragging && 'opacity-50 shadow-sm',
        !item.active && 'opacity-60'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-0.5 cursor-grab active:cursor-grabbing text-slate-400"
        type="button"
      >
        <GripVertical size={12} />
      </button>

      <LinkIcon size={12} className="text-blue-500" />

      {/* Label */}
      {isEditingLabel ? (
        <Input
          value={editingState.value}
          onChange={(e) => onStartEdit('item', item.id, 'label', e.target.value)}
          className="h-6 text-xs flex-1"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveEdit();
            if (e.key === 'Escape') onCancelEdit();
          }}
        />
      ) : (
        <button
          onClick={() => onStartEdit('item', item.id, 'label', item.label)}
          className="flex-1 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 truncate"
        >
          {item.label}
        </button>
      )}

      {/* Href */}
      {isEditingHref ? (
        <Input
          value={editingState.value}
          onChange={(e) => onStartEdit('item', item.id, 'href', e.target.value)}
          className="h-6 text-xs w-32 font-mono"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveEdit();
            if (e.key === 'Escape') onCancelEdit();
          }}
        />
      ) : (
        <button
          onClick={() => onStartEdit('item', item.id, 'href', item.href || '')}
          className="text-[10px] font-mono text-slate-400 hover:text-blue-500 truncate max-w-[100px]"
          title={item.href || 'Không có URL'}
        >
          {item.href || '—'}
        </button>
      )}

      {(isEditingLabel || isEditingHref) && (
        <>
          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5 text-green-600"
            onClick={onSaveEdit}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5"
            onClick={onCancelEdit}
          >
            <X size={10} />
          </Button>
        </>
      )}

      {item.badge && (
        <Badge variant="warning" className="text-[10px] h-4 px-1">
          {item.badge}
        </Badge>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5"
        onClick={onToggleActive}
      >
        {item.active ? <Eye size={10} /> : <EyeOff size={10} className="text-slate-400" />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 text-red-500"
        onClick={onDelete}
      >
        <Trash2 size={10} />
      </Button>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export function MenuBuilder({ menus: initialMenus, onRefresh }: MenuBuilderProps) {
  const [menus, setMenus] = useState<AdminMenuDetail[]>(initialMenus);
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set(initialMenus.map(m => m.id)));
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sync when initialMenus changes
  useEffect(() => {
    setMenus(initialMenus);
  }, [initialMenus]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ==================== HANDLERS ====================

  const handleStartEdit = useCallback((type: 'menu' | 'block' | 'item', id: number, field: string, currentValue: string) => {
    setEditingState({ type, id, field, value: currentValue });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingState(null);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingState) return;

    setIsSaving(true);
    try {
      const { type, id, field, value } = editingState;

      if (type === 'menu') {
        await updateMenu(id, { [field]: value });
        setMenus(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
      } else if (type === 'block') {
        const menu = menus.find(m => m.blocks?.some(b => b.id === id));
        if (menu) {
          await updateMenuBlock(menu.id, id, { [field]: value });
          setMenus(prev => prev.map(m => ({
            ...m,
            blocks: m.blocks?.map(b => b.id === id ? { ...b, [field]: value } : b)
          })));
        }
      } else if (type === 'item') {
        const block = menus.flatMap(m => m.blocks || []).find(b => b.items?.some(i => i.id === id));
        if (block) {
          await updateMenuBlockItem(block.id, id, { [field]: value });
          setMenus(prev => prev.map(m => ({
            ...m,
            blocks: m.blocks?.map(b => ({
              ...b,
              items: b.items?.map(i => i.id === id ? { ...i, [field]: value } : i)
            }))
          })));
        }
      }

      toast.success('Đã lưu');
      setEditingState(null);
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Không thể lưu');
    } finally {
      setIsSaving(false);
    }
  }, [editingState, menus]);

  const handleToggleMenuActive = useCallback(async (menuId: number) => {
    const menu = menus.find(m => m.id === menuId);
    if (!menu) return;

    try {
      await updateMenu(menuId, { active: !menu.active });
      setMenus(prev => prev.map(m => m.id === menuId ? { ...m, active: !m.active } : m));
      toast.success(menu.active ? 'Đã ẩn menu' : 'Đã hiện menu');
    } catch {
      toast.error('Không thể cập nhật');
    }
  }, [menus]);

  const handleToggleBlockActive = useCallback(async (menuId: number, blockId: number) => {
    const block = menus.find(m => m.id === menuId)?.blocks?.find(b => b.id === blockId);
    if (!block) return;

    try {
      await updateMenuBlock(menuId, blockId, { active: !block.active });
      setMenus(prev => prev.map(m => ({
        ...m,
        blocks: m.blocks?.map(b => b.id === blockId ? { ...b, active: !b.active } : b)
      })));
      toast.success(block.active ? 'Đã ẩn block' : 'Đã hiện block');
    } catch {
      toast.error('Không thể cập nhật');
    }
  }, [menus]);

  const handleToggleItemActive = useCallback(async (blockId: number, itemId: number) => {
    const item = menus.flatMap(m => m.blocks || []).find(b => b.id === blockId)?.items?.find(i => i.id === itemId);
    if (!item) return;

    try {
      await updateMenuBlockItem(blockId, itemId, { active: !item.active });
      setMenus(prev => prev.map(m => ({
        ...m,
        blocks: m.blocks?.map(b => ({
          ...b,
          items: b.items?.map(i => i.id === itemId ? { ...i, active: !i.active } : i)
        }))
      })));
      toast.success(item.active ? 'Đã ẩn item' : 'Đã hiện item');
    } catch {
      toast.error('Không thể cập nhật');
    }
  }, [menus]);

  const handleDeleteMenu = useCallback(async (menuId: number) => {
    if (!confirm('Xóa menu này và tất cả blocks/items bên trong?')) return;
    
    try {
      const { deleteMenu } = await import('@/lib/api/admin');
      await deleteMenu(menuId);
      setMenus(prev => prev.filter(m => m.id !== menuId));
      toast.success('Đã xóa menu');
    } catch {
      toast.error('Không thể xóa');
    }
  }, []);

  const handleDeleteBlock = useCallback(async (menuId: number, blockId: number) => {
    if (!confirm('Xóa block này và tất cả items bên trong?')) return;

    try {
      await deleteMenuBlock(menuId, blockId);
      setMenus(prev => prev.map(m => ({
        ...m,
        blocks: m.blocks?.filter(b => b.id !== blockId)
      })));
      toast.success('Đã xóa block');
    } catch {
      toast.error('Không thể xóa');
    }
  }, []);

  const handleDeleteItem = useCallback(async (blockId: number, itemId: number) => {
    if (!confirm('Xóa item này?')) return;

    try {
      await deleteMenuBlockItem(blockId, itemId);
      setMenus(prev => prev.map(m => ({
        ...m,
        blocks: m.blocks?.map(b => ({
          ...b,
          items: b.items?.filter(i => i.id !== itemId)
        }))
      })));
      toast.success('Đã xóa item');
    } catch {
      toast.error('Không thể xóa');
    }
  }, []);

  const handleAddBlock = useCallback(async (menuId: number) => {
    const title = prompt('Nhập tên block:');
    if (!title?.trim()) return;

    try {
      const result = await createMenuBlock(menuId, { title: title.trim() });
      const newBlock: AdminMenuBlock = {
        id: result.data.id,
        title: title.trim(),
        order: 0,
        active: true,
        items: [],
      };
      setMenus(prev => prev.map(m => m.id === menuId ? {
        ...m,
        blocks: [...(m.blocks || []), newBlock]
      } : m));
      setExpandedBlocks(prev => new Set([...prev, result.data.id]));
      toast.success('Đã thêm block');
    } catch {
      toast.error('Không thể thêm block');
    }
  }, []);

  const handleAddItem = useCallback(async (blockId: number) => {
    const label = prompt('Nhập tên item:');
    if (!label?.trim()) return;

    const href = prompt('Nhập URL (có thể để trống):') || '';

    try {
      const result = await createMenuBlockItem(blockId, {
        label: label.trim(),
        href: href.trim() || null,
      });
      const newItem: AdminMenuBlockItem = {
        id: result.data.id,
        label: label.trim(),
        href: href.trim() || null,
        badge: null,
        order: 0,
        active: true,
      };
      setMenus(prev => prev.map(m => ({
        ...m,
        blocks: m.blocks?.map(b => b.id === blockId ? {
          ...b,
          items: [...(b.items || []), newItem]
        } : b)
      })));
      toast.success('Đã thêm item');
    } catch {
      toast.error('Không thể thêm item');
    }
  }, []);

  // ==================== DRAG HANDLERS ====================

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    // Menu reorder
    if (activeIdStr.startsWith('menu-') && overIdStr.startsWith('menu-')) {
      const activeMenuId = parseInt(activeIdStr.replace('menu-', ''));
      const overMenuId = parseInt(overIdStr.replace('menu-', ''));

      const oldIndex = menus.findIndex(m => m.id === activeMenuId);
      const newIndex = menus.findIndex(m => m.id === overMenuId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newMenus = arrayMove(menus, oldIndex, newIndex);
        setMenus(newMenus);

        // Update order on server
        try {
          await reorderMenus(newMenus.map((m, i) => ({ id: m.id, order: i })));
        } catch {
          // Revert on error
          setMenus(menus);
          toast.error('Không thể sắp xếp');
        }
      }
    }

    // Block reorder (within same menu)
    // TODO: Implement block reorder if needed

    // Item reorder (within same block)
    // TODO: Implement item reorder if needed
  };

  // ==================== RENDER ====================

  const menuIds = useMemo(() => menus.map(m => `menu-${m.id}`), [menus]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={menuIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {menus.map((menu) => {
            const isExpanded = expandedMenus.has(menu.id);
            const blockIds = (menu.blocks || []).map(b => `block-${b.id}`);

            return (
              <SortableMenu
                key={menu.id}
                menu={menu}
                isExpanded={isExpanded}
                onToggleExpand={() => {
                  setExpandedMenus(prev => {
                    const next = new Set(prev);
                    if (next.has(menu.id)) next.delete(menu.id);
                    else next.add(menu.id);
                    return next;
                  });
                }}
                onEdit={() => {}}
                onToggleActive={() => handleToggleMenuActive(menu.id)}
                onDelete={() => handleDeleteMenu(menu.id)}
                onAddBlock={() => handleAddBlock(menu.id)}
                editingState={editingState}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                isSaving={isSaving}
              >
                <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
                  {(menu.blocks || []).map((block) => {
                    const isBlockExpanded = expandedBlocks.has(block.id);
                    const itemIds = (block.items || []).map(i => `item-${i.id}`);

                    return (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        menuId={menu.id}
                        isExpanded={isBlockExpanded}
                        onToggleExpand={() => {
                          setExpandedBlocks(prev => {
                            const next = new Set(prev);
                            if (next.has(block.id)) next.delete(block.id);
                            else next.add(block.id);
                            return next;
                          });
                        }}
                        onToggleActive={() => handleToggleBlockActive(menu.id, block.id)}
                        onDelete={() => handleDeleteBlock(menu.id, block.id)}
                        onAddItem={() => handleAddItem(block.id)}
                        editingState={editingState}
                        onStartEdit={handleStartEdit}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={handleCancelEdit}
                        isSaving={isSaving}
                      >
                        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                          {(block.items || []).map((item) => (
                            <SortableItem
                              key={item.id}
                              item={item}
                              blockId={block.id}
                              onToggleActive={() => handleToggleItemActive(block.id, item.id)}
                              onDelete={() => handleDeleteItem(block.id, item.id)}
                              editingState={editingState}
                              onStartEdit={handleStartEdit}
                              onSaveEdit={handleSaveEdit}
                              onCancelEdit={handleCancelEdit}
                              isSaving={isSaving}
                            />
                          ))}
                        </SortableContext>
                      </SortableBlock>
                    );
                  })}
                </SortableContext>
              </SortableMenu>
            );
          })}

          {menus.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <MenuIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>Chưa có menu nào</p>
            </div>
          )}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeId && (
          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-blue-500 opacity-90">
            <span className="text-sm font-medium">Đang di chuyển...</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
