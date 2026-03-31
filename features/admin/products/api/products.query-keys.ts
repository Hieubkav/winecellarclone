export const productQueryKeys = {
  all: ['admin-products'] as const,
  lists: () => [...productQueryKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) => [...productQueryKeys.lists(), params ?? {}] as const,
  details: () => [...productQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...productQueryKeys.details(), id] as const,
  filters: (typeId?: number | null) => [...productQueryKeys.all, 'filters', typeId ?? 'all'] as const,
  settings: () => [...productQueryKeys.all, 'settings'] as const,
};
