import { apiFetch } from "./client";

// Menu item leaf (link cuối cùng trong cây)
export interface MenuLeaf {
  label: string;
  href: string;
  isHot?: boolean;
  badge?: string;
  isViewAll?: boolean;
}

// Menu block (nhóm các links)
export interface MenuBlock {
  label: string;
  children: MenuLeaf[];
  isViewAll?: boolean;
}

// Menu item chính
export interface MenuItem {
  id: number;
  label: string;
  href: string;
  type: "standard" | "mega";
  children?: MenuBlock[];
}

export interface MenusResponse {
  data: MenuItem[];
  meta: {
    cache_version: number;
    audit?: {
      cache_hit: boolean;
      cache_key: string;
      server_ms: number;
    };
  };
}

export async function fetchMenusWithMeta(options?: { audit?: boolean }): Promise<MenusResponse> {
  const params = options?.audit ? "?audit=1" : "";

  return apiFetch<MenusResponse>(`v1/menus${params}`, {
    cache: options?.audit ? "no-store" : undefined,
    next: options?.audit ? { revalidate: 0 } : { revalidate: 10 },
  });
}

export async function fetchMenus(): Promise<MenuItem[]> {
  const response = await fetchMenusWithMeta();

  return response.data;
}
