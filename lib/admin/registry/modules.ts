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

export type AdminNavIcon =
  | "LayoutDashboard"
  | "Package"
  | "FileText"
  | "Globe"
  | "Settings";

export interface AdminNavItem {
  key: AdminModuleKey;
  label: string;
  href: string;
  icon: AdminNavIcon;
  subItems?: Array<{ label: string; href: string }>;
}

export interface AdminNavGroup {
  key: AdminModuleGroup | "root";
  label: string;
  items: AdminNavItem[];
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
  { key: "settings", label: "Cấu hình chung", route: "/admin/settings", group: "system" },
  { key: "users", label: "Users", route: "/admin/users", group: "system" },
];

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    key: "root",
    label: "",
    items: [
      {
        key: "dashboard",
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: "LayoutDashboard",
      },
    ],
  },
  {
    key: "products",
    label: "Sản phẩm",
    items: [
      {
        key: "products",
        label: "Sản phẩm",
        href: "/admin/products",
        icon: "Package",
        subItems: [
          { label: "Tất cả sản phẩm", href: "/admin/products" },
          { label: "Danh mục", href: "/admin/categories" },
          { label: "Nhóm sản phẩm", href: "/admin/product-types" },
          { label: "Nhóm thuộc tính", href: "/admin/attribute-groups" },
        ],
      },
    ],
  },
  {
    key: "content",
    label: "Nội dung",
    items: [
      {
        key: "articles",
        label: "Nội dung",
        href: "/admin/articles",
        icon: "FileText",
        subItems: [
          { label: "Bài viết", href: "/admin/articles" },
          { label: "Thư viện ảnh", href: "/admin/images" },
        ],
      },
    ],
  },
  {
    key: "website",
    label: "Website",
    items: [
      {
        key: "home-components",
        label: "Website",
        href: "/admin/home-components",
        icon: "Globe",
        subItems: [
          { label: "Trang chủ", href: "/admin/home-components" },
          { label: "Menu", href: "/admin/menus" },
          { label: "Cấu hình Liên hệ", href: "/admin/contact-config" },
          { label: "Cấu hình Footer", href: "/admin/footer-config" },
        ],
      },
    ],
  },
  {
    key: "system",
    label: "Hệ thống",
    items: [
      {
        key: "settings",
        label: "Hệ thống",
        href: "/admin/settings",
        icon: "Settings",
        subItems: [
          { label: "Cấu hình chung", href: "/admin/settings" },
          { label: "Quản lý Users", href: "/admin/users" },
        ],
      },
    ],
  },
];
