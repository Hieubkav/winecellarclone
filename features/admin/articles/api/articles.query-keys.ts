export const articleQueryKeys = {
  all: ['admin-articles'] as const,
  lists: () => [...articleQueryKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) => [...articleQueryKeys.lists(), params ?? {}] as const,
  details: () => [...articleQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...articleQueryKeys.details(), id] as const,
};
