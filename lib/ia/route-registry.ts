export type IARouteSource =
  | { kind: "core"; key: "home" | "products" | "contact" }
  | { kind: "static_hub"; hub: string }
  | { kind: "static_child"; hub: string; slug: string }
  | { kind: "product_type"; typeSlug: string }
  | { kind: "product_category"; typeSlug: string; categorySlug: string }
  | { kind: "product_term"; typeSlug: string; groupCode?: string; termSlug: string }
  | { kind: "price_preset"; typeSlug: string; presetSlug: string }
  | { kind: "product"; slug: string }
  | { kind: "article"; slug: string }
  | { kind: "custom"; href: string };

export type IARouteOption = {
  label: string;
  href: string;
  source: IARouteSource;
  description?: string;
  children?: IARouteOption[];
};

export type IAGroup = {
  key: string;
  label: string;
  items: IARouteOption[];
};

export const buildIARoute = (source: IARouteSource): string => {
  switch (source.kind) {
    case "core":
      return source.key === "home" ? "/" : source.key === "products" ? "/san-pham" : "/lien-he";
    case "static_hub":
      return `/${source.hub}`;
    case "static_child":
      return `/${source.hub}/${source.slug}`;
    case "product_type":
      return `/san-pham/${source.typeSlug}`;
    case "product_category":
      return `/san-pham/${source.typeSlug}/${source.categorySlug}`;
    case "product_term":
      return `/san-pham/${source.typeSlug}/${source.termSlug}`;
    case "price_preset":
      return `/san-pham/${source.typeSlug}/${source.presetSlug}`;
    case "product":
      return `/san-pham/${source.slug}`;
    case "article":
      return `/bai-viet/${source.slug}`;
    case "custom":
      return source.href;
  }
};

const route = (label: string, source: IARouteSource, description?: string): IARouteOption => ({
  label,
  source,
  href: buildIARoute(source),
  description,
});

const staticHub = (
  key: string,
  label: string,
  children: Array<[label: string, slug: string]>
): IAGroup => ({
  key,
  label,
  items: [{
    ...route(label, { kind: "static_hub", hub: key }),
    children: children.map(([childLabel, slug]) => route(childLabel, { kind: "static_child", hub: key, slug })),
  }],
});

const productNode = (
  label: string,
  typeSlug: string,
  children: Array<[label: string, slug: string, kind: "product_category" | "product_term" | "price_preset"]>
): IARouteOption => ({
  ...route(label, { kind: "product_type", typeSlug }),
  children: children.map(([childLabel, slug, kind]) => {
    if (kind === "product_category") {
      return route(childLabel, { kind, typeSlug, categorySlug: slug });
    }
    if (kind === "price_preset") {
      return route(childLabel, { kind, typeSlug, presetSlug: slug });
    }
    return route(childLabel, { kind, typeSlug, termSlug: slug });
  }),
});

export const CORE_ROUTE_OPTIONS: IARouteOption[] = [
  route("Trang chủ", { kind: "core", key: "home" }),
  route("Sản phẩm", { kind: "core", key: "products" }),
  route("Liên hệ", { kind: "core", key: "contact" }),
];

export const WEBSITE_ROUTE_GROUPS: IAGroup[] = [
  { key: "core", label: "Core", items: CORE_ROUTE_OPTIONS },
  {
    key: "products",
    label: "Sản phẩm",
    items: [
      productNode("Rượu vang", "ruou-vang", [
        ["Vang đỏ", "vang-do", "product_category"],
        ["Vang trắng", "vang-trang", "product_category"],
        ["Vang hồng", "vang-hong", "product_category"],
        ["Vang sủi", "vang-sui", "product_category"],
        ["Champagne / Sâm panh", "champagne", "product_category"],
        ["Vang ngọt", "vang-ngot", "product_category"],
        ["Vang cường hóa", "vang-cuong-hoa", "product_category"],
        ["Vang không cồn", "vang-khong-con", "product_category"],
        ["Vang organic", "vang-organic", "product_term"],
        ["Pháp", "phap", "product_term"],
        ["Ý", "y", "product_term"],
        ["Tây Ban Nha", "tay-ban-nha", "product_term"],
        ["Chile", "chile", "product_term"],
        ["Úc", "uc", "product_term"],
        ["Mỹ", "my", "product_term"],
        ["Argentina", "argentina", "product_term"],
        ["New Zealand", "new-zealand", "product_term"],
        ["Dưới 500k", "duoi-500k", "price_preset"],
        ["500k - 1 triệu", "500k-1-trieu", "price_preset"],
        ["1 - 2 triệu", "1-2-trieu", "price_preset"],
        ["2 - 5 triệu", "2-5-trieu", "price_preset"],
        ["Trên 5 triệu", "tren-5-trieu", "price_preset"],
        ["Tiệc tối", "tiec-toi", "product_term"],
        ["Sinh nhật", "sinh-nhat", "product_term"],
        ["Quà biếu", "qua-bieu", "product_term"],
        ["Lễ Tết", "le-tet", "product_term"],
      ]),
      productNode("Rượu mạnh", "ruou-manh", [
        ["Whisky", "whisky", "product_category"],
        ["Single Malt", "whisky/single-malt", "product_term"],
        ["Blended", "whisky/blended", "product_term"],
        ["Bourbon", "whisky/bourbon", "product_term"],
        ["Japanese Whisky", "whisky/japanese-whisky", "product_term"],
        ["Cognac", "cognac", "product_category"],
        ["Gin", "gin", "product_category"],
        ["Sake / Soju / Umeshu", "sake-soju-umeshu", "product_category"],
        ["Rượu mạnh khác", "khac", "product_category"],
        ["Dưới 1 triệu", "duoi-1-trieu", "price_preset"],
        ["1 - 3 triệu", "1-3-trieu", "price_preset"],
        ["3 - 5 triệu", "3-5-trieu", "price_preset"],
        ["Trên 5 triệu", "tren-5-trieu", "price_preset"],
        ["Quà biếu", "qua-bieu", "product_term"],
        ["Sự kiện", "su-kien", "product_term"],
        ["Doanh nghiệp", "doanh-nghiep", "product_term"],
      ]),
      productNode("Phụ kiện", "phu-kien", [
        ["Ly rượu vang", "ly-ruou-vang", "product_category"],
        ["Decanter", "decanter", "product_category"],
        ["Dụng cụ khui vang", "dung-cu-khui-vang", "product_category"],
        ["Phụ kiện cao cấp", "phu-kien-cao-cap", "product_category"],
      ]),
    ],
  },
  staticHub("thuong-hieu", "Thương hiệu", [["Thương hiệu nổi bật", "noi-bat"]]),
  staticHub("bo-suu-tap", "Bộ sưu tập", [
    ["Bán chạy", "ban-chay"],
    ["Hàng mới về", "hang-moi-ve"],
    ["Khuyến mãi", "khuyen-mai"],
    ["Cao cấp", "cao-cap"],
    ["Uống hằng ngày", "uong-hang-ngay"],
    ["Theo mùa", "theo-mua"],
  ]),
  staticHub("qua-tang", "Quà tặng", [
    ["Quà tặng doanh nghiệp", "doanh-nghiep"],
    ["Quà tặng rượu vang", "ruou-vang"],
    ["Quà tặng rượu mạnh", "ruou-manh"],
    ["Quà Tết", "tet"],
    ["Hộp quà / túi quà", "hop-tui-qua"],
  ]),
  staticHub("kien-thuc", "Kiến thức", [
    ["Cho người mới bắt đầu", "cho-nguoi-moi-bat-dau"],
    ["Kiến thức cơ bản", "co-ban"],
    ["Kiến thức chuyên sâu", "chuyen-sau"],
    ["Thưởng thức & phục vụ", "thuong-thuc-phuc-vu"],
    ["Bảo quản rượu", "bao-quan"],
    ["Kết hợp món ăn", "ket-hop-mon-an"],
    ["Kiến thức vang Pháp", "vang-phap"],
    ["Kiến thức vang Ý", "vang-y"],
    ["Kiến thức whisky", "whisky"],
  ]),
  { key: "news-events", label: "Tin tức & sự kiện", items: [
    route("Tin tức", { kind: "static_hub", hub: "tin-tuc" }),
    route("Sự kiện", { kind: "static_hub", hub: "su-kien" }),
  ] },
  staticHub("dich-vu", "Dịch vụ", [
    ["Đặt hàng doanh nghiệp", "dat-hang-doanh-nghiep"],
    ["In logo / tên doanh nghiệp", "in-logo-ten-doanh-nghiep"],
    ["Tư vấn chọn quà", "tu-van-chon-qua"],
    ["Tặng quà từ xa", "tang-qua-tu-xa"],
  ]),
  staticHub("cua-hang", "Hệ thống cửa hàng", [
    ["Danh sách cửa hàng", "danh-sach"],
    ["Giờ mở cửa", "gio-mo-cua"],
  ]),
  staticHub("ho-tro", "Hỗ trợ khách hàng", [
    ["Câu hỏi thường gặp", "faq"],
    ["Giao hàng & vận chuyển", "giao-hang-van-chuyen"],
    ["Đổi trả & hoàn tiền", "doi-tra-hoan-tien"],
    ["Phương thức thanh toán", "thanh-toan"],
    ["Cam kết chính hãng", "cam-ket-chinh-hang"],
    ["Chính sách bảo mật", "chinh-sach-bao-mat"],
    ["Điều khoản & điều kiện", "dieu-khoan-dieu-kien"],
  ]),
  staticHub("gioi-thieu", "Giới thiệu", [
    ["Về Thiên Kim Wine", "ve-thien-kim-wine"],
    ["Câu chuyện thương hiệu", "cau-chuyen-thuong-hieu"],
    ["Vì sao chọn chúng tôi", "vi-sao-chon-chung-toi"],
    ["Chứng nhận / giấy phép", "chung-nhan-giay-phep"],
  ]),
];

export const flattenIARoutes = (groups: IAGroup[] = WEBSITE_ROUTE_GROUPS): IARouteOption[] =>
  groups.flatMap((group) => group.items.flatMap((item) => [item, ...(item.children ?? [])]));

export const IA_STATIC_PATHS = flattenIARoutes()
  .filter((item) => item.source.kind === "static_hub" || item.source.kind === "static_child")
  .map((item) => item.href.replace(/^\//, ""));

export const serializeRouteSource = (source: IARouteSource): Record<string, string> => {
  const entries = Object.entries(source).filter(([, value]) => typeof value === "string");
  return Object.fromEntries(entries) as Record<string, string>;
};
