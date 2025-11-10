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
}

export async function fetchMenus(): Promise<MenuItem[]> {
  const response = await apiFetch<MenusResponse>("v1/menus", {
    next: { revalidate: 3600 }, // Cache 1 giờ vì menu ít thay đổi
  });
  return response.data;
}
