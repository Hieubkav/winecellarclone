import React, { useMemo } from 'react';
import { Eye } from 'lucide-react';
import { buildMenuTree, type MenuTreeNode } from '@/lib/menus/menu-tree';
import type { AdminMenuDetail, AdminMenuTreeItem } from '@/lib/api/admin';
import { Badge, Card, CardContent, CardHeader, CardTitle, cn } from '../components/ui';

interface MenuTreePreviewProps {
  menus: AdminMenuDetail[];
}

export function MenuTreePreview({ menus }: MenuTreePreviewProps) {
  const activeMenus = useMemo(() => menus.filter((menu) => menu.active).sort((a, b) => a.order - b.order), [menus]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye size={18} />
          Preview cây menu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeMenus.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            Chưa có menu active.
          </div>
        ) : (
          activeMenus.map((menu) => (
            <div key={menu.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <div className="mb-3 flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100">{menu.title}</span>
                <Badge variant="secondary">{menu.items?.length ?? 0} items</Badge>
              </div>
              <div className="space-y-2">
                {buildMenuTree(menu.items ?? []).length === 0 ? (
                  <p className="text-sm text-slate-500">Menu chưa có item.</p>
                ) : (
                  renderNodes(buildMenuTree(menu.items ?? []))
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function renderNodes(nodes: Array<MenuTreeNode<AdminMenuTreeItem>>) {
  return nodes.map((node) => (
    <div key={node.id} className="space-y-2">
      <div
        className={cn(
          'flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900',
          !node.active && 'opacity-50'
        )}
        style={{ marginLeft: node.depth * 18 }}
      >
        <Badge variant="outline">Tầng {node.depth + 1}</Badge>
        <span className="font-medium text-slate-800 dark:text-slate-100">{node.label}</span>
        <span className="truncate text-xs text-slate-400">{node.href || '#'}</span>
      </div>
      {node.children.length > 0 && renderNodes(node.children)}
    </div>
  ));
}
