export type AdminModuleKey =
  | "dashboard"
  | "products"
  | "categories"
  | "product-types"
  | "attribute-groups"
  | "articles"
  | "images"
  | "home-components"
  | "menus"
  | "social-links"
  | "settings"
  | "users";

export type AdminModuleGroup = "core" | "products" | "content" | "website" | "system";

export interface AdminModuleMeta {
  key: AdminModuleKey;
  label: string;
  route: string;
  group: AdminModuleGroup;
  description?: string;
}

export const ADMIN_MODULES: AdminModuleMeta[] = [
  { key: "dashboard", label: "Dashboard", route: "/admin/dashboard", group: "core" },
  { key: "products", label: "Sản phẩm", route: "/admin/products", group: "products" },
  { key: "categories", label: "Danh mục", route: "/admin/categories", group: "products" },
  { key: "product-types", label: "Nhóm sản phẩm", route: "/admin/product-types", group: "products" },
  { key: "attribute-groups", label: "Nhóm thuộc tính", route: "/admin/attribute-groups", group: "products" },
  { key: "articles", label: "Bài viết", route: "/admin/articles", group: "content" },
  { key: "images", label: "Thư viện ảnh", route: "/admin/images", group: "content" },
  { key: "home-components", label: "Trang chủ", route: "/admin/home-components", group: "website" },
  { key: "menus", label: "Menu", route: "/admin/menus", group: "website" },
  { key: "social-links", label: "Mạng xã hội", route: "/admin/social-links", group: "website" },
  { key: "settings", label: "Cấu hình chung", route: "/admin/settings", group: "system" },
  { key: "users", label: "Users", route: "/admin/users", group: "system" },
];
