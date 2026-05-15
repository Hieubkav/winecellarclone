export const MENU_MAX_LEVEL = 5;

export interface FlatMenuItemLike {
  id?: number;
  client_id?: string;
  parent_id?: number | string | null;
  parent_client_id?: string | null;
  depth: number;
  order: number;
}

export type MenuTreeNode<T extends FlatMenuItemLike> = T & {
  children: Array<MenuTreeNode<T>>;
  level: number;
};

export function normalizeDepth(items: FlatMenuItemLike[]): FlatMenuItemLike[] {
  let previousDepth = 0;

  return items.map((item, index) => {
    const depth = index === 0 ? 0 : Math.min(Math.max(item.depth, 0), previousDepth + 1, MENU_MAX_LEVEL - 1);
    previousDepth = depth;

    return { ...item, depth, order: index };
  });
}

export function assignParents<T extends FlatMenuItemLike>(items: T[]): T[] {
  const stack: T[] = [];

  return normalizeDepth(items).map((item) => {
    const typedItem = item as T;
    const parent = typedItem.depth > 0 ? stack[typedItem.depth - 1] : undefined;
    const nextItem = {
      ...typedItem,
      parent_id: parent?.id ?? null,
      parent_client_id: parent?.client_id ?? null,
    };

    stack[typedItem.depth] = nextItem;
    stack.length = typedItem.depth + 1;

    return nextItem;
  });
}

export function buildMenuTree<T extends FlatMenuItemLike>(items: T[]): Array<MenuTreeNode<T>> {
  const ordered = assignParents([...items].sort((a, b) => a.order - b.order));
  const nodes = new Map<string, MenuTreeNode<T>>();
  const roots: Array<MenuTreeNode<T>> = [];

  ordered.forEach((item) => {
    const key = item.client_id ?? String(item.id);
    nodes.set(key, { ...item, children: [], level: item.depth + 1 } as MenuTreeNode<T>);
  });

  ordered.forEach((item) => {
    const key = item.client_id ?? String(item.id);
    const node = nodes.get(key);
    if (!node) return;

    const parentKey = item.parent_client_id ?? (item.parent_id ? String(item.parent_id) : null);
    const parent = parentKey ? nodes.get(parentKey) : null;

    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}
