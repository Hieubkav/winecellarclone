import { apiFetch } from "./client";

// Menu item leaf (link cuối cùng trong cây)
export interface MenuLeaf {
  label: string;
  href: string;
  isHot?: boolean;
  badge?: string;
}

// Menu block (nhóm các links)
export interface MenuBlock {
  label: string;
  children: MenuLeaf[];
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
  };
}

export async function fetchMenus(): Promise<MenuItem[]> {
  const response = await apiFetch<MenusResponse>("v1/menus", {
    // Revalidate mỗi 10 giây - balance giữa freshness và performance
    // Backend có cache version + on-demand revalidation để update nhanh hơn
    next: { revalidate: 10 },
  });
  
  return response.data;
}
