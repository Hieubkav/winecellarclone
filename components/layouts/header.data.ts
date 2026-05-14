export interface NavLeaf {
  label: string
  href: string
  isHot?: boolean
  isViewAll?: boolean
}

export interface NavNode {
  label: string
  children: NavLeaf[]
  isViewAll?: boolean
}

export interface MenuItemBase {
  label: string
  href: string
}

export interface MenuItemWithChildren extends MenuItemBase {
  children?: NavNode[]
}

export const BRAND_COLORS = {
  base: "#1C1C1C",
  accent: "#ECAA4D",
  highlight: "#9B2C3B",
} as const

export const languageOptions = [
  { code: "en", label: "English", href: "/" },
  { code: "vi", label: "Tiếng Việt", href: "/" },
] as const
export const trendingKeywords: NavLeaf[] = [
  { label: "vang pháp", href: "/san-pham?q=vang+ph%C3%A1p" },
  { label: "vang ý", href: "/san-pham?q=vang+%C3%BD" },
  { label: "rượu mạnh", href: "/san-pham?q=r%C6%B0%E1%BB%A3u+m%E1%BA%A1nh" },
  { label: "bia", href: "/san-pham?q=bia" },
  { label: "ly rượu vang", href: "/san-pham?q=ly+r%C6%B0%E1%BB%A3u+vang" },
  { label: "bánh quy", href: "/san-pham?q=b%C3%A1nh+quy" },
  { label: "trà anh quốc", href: "/san-pham?q=tr%C3%A0+anh+qu%E1%BB%91c" },
  { label: "nước khoáng", href: "/san-pham?q=n%C6%B0%E1%BB%9Bc+kho%C3%A1ng" },
]

export const menuItems: MenuItemWithChildren[] = [
  { label: "Trang chủ", href: "/" },
  {
    label: "Rượu vang",
    href: "/san-pham",
    children: [
      {
        label: "Theo loại rượu",
        children: [
          { label: "Rượu vang đỏ", href: "/san-pham/ruou-vang/vang-do", isHot: true },
          { label: "Rượu vang trắng", href: "/san-pham/ruou-vang/vang-trang" },
          { label: "Rượu vang sủi", href: "/san-pham/ruou-vang/vang-sui" },
          { label: "Champagne (Sâm panh)", href: "/san-pham/ruou-vang/champagne" },
          { label: "Rượu vang hồng", href: "/san-pham/ruou-vang/vang-hong" },
          { label: "Rượu vang ngọt", href: "/san-pham/ruou-vang/vang-ngot" },
          { label: "Rượu vang cường hóa", href: "/san-pham/ruou-vang/vang-cuong-hoa" },
          { label: "Rượu vang không cồn", href: "/san-pham/ruou-vang/vang-khong-con" },
          { label: "Rượu vang Organic", href: "/san-pham/ruou-vang/vang-organic" },
          { label: "Tất cả rượu vang", href: "/san-pham/ruou-vang" },
        ],
      },
      {
        label: "Theo quốc gia",
        children: [
          { label: "Pháp", href: "/san-pham" },
          { label: "Ý", href: "/san-pham" },
          { label: "Tây Ban Nha", href: "/san-pham" },
          { label: "Chile", href: "/san-pham" },
          { label: "Mỹ", href: "/san-pham" },
          { label: "Úc", href: "/san-pham" },
          { label: "New Zealand", href: "/san-pham" },
          { label: "Argentina", href: "/san-pham" },
          { label: "Bồ Đào Nha", href: "/san-pham" },
          { label: "Đức", href: "/san-pham" },
          { label: "Nam Phi", href: "/san-pham" },
        ],
      },
      {
        label: "Theo giống nho",
        children: [
          { label: "Cabernet Sauvignon", href: "/san-pham" },
          { label: "Merlot", href: "/san-pham" },
          { label: "Syrah (Shiraz)", href: "/san-pham" },
          { label: "Pinot Noir", href: "/san-pham" },
          { label: "Malbec", href: "/san-pham" },
          { label: "Montepulciano D'Abruzzo", href: "/san-pham" },
          { label: "Negroamaro", href: "/san-pham" },
          { label: "Primitivo", href: "/san-pham" },
          { label: "Chardonnay", href: "/san-pham" },
          { label: "Sauvignon Blanc", href: "/san-pham" },
          { label: "Riesling", href: "/san-pham" },
          { label: "Tìm giống nho", href: "/san-pham" },
        ],
      },
      {
        label: "Theo vùng nổi tiếng",
        children: [
          { label: "Bordeaux", href: "/san-pham" },
          { label: "Bourgogne (Pháp)", href: "/san-pham" },
          { label: "Tuscany", href: "/san-pham" },
          { label: "Puglia", href: "/san-pham" },
          { label: "Piedmont (Ý)", href: "/san-pham" },
          { label: "California (Mỹ)", href: "/san-pham" },
          { label: "Champagne (Pháp)", href: "/san-pham" },
        ],
      },
    ],
  },
  {
    label: "Rượu mạnh",
    href: "/san-pham",
    children: [
      {
        label: "Loại rượu",
        children: [
          { label: "Rượu Whisky", href: "/san-pham" },
          { label: "Rượu Cognac", href: "/san-pham" },
          { label: "Rượu Rum", href: "/san-pham" },
          { label: "Rượu Gin", href: "/san-pham" },
          { label: "Rượu Vermouth", href: "/san-pham" },
          { label: "Rượu Whisky Single Malt", href: "/san-pham" },
        ],
      },
      {
        label: "Thương hiệu (Cột 1)",
        children: [
          { label: "GlenAllachie", href: "/san-pham" },
          { label: "Tamdhu", href: "/san-pham" },
          { label: "Glengoyne", href: "/san-pham" },
          { label: "Kilchoman", href: "/san-pham" },
          { label: "Meikle Tòir", href: "/san-pham" },
          { label: "Glen Moray", href: "/san-pham" },
          { label: "Thomas Hine & Co", href: "/san-pham" },
          { label: "Cognac Lhéraud", href: "/san-pham" },
          { label: "Rosebank", href: "/san-pham" },
        ],
      },
      {
        label: "Thương hiệu (Cột 2)",
        children: [
          { label: "Hunter Laing", href: "/san-pham" },
          { label: "That Boutique-Y Whisky Company", href: "/san-pham" },
          { label: "Kill Devil", href: "/san-pham" },
          { label: "Cadenhead's", href: "/san-pham" },
          { label: "The Ileach", href: "/san-pham" },
          { label: "The Original Islay Rum", href: "/san-pham" },
          { label: "Silver Seal", href: "/san-pham" },
          { label: "MacNair's", href: "/san-pham" },
        ],
      },
      {
        label: "Quà tặng",
        children: [{ label: "Quà tặng rượu mạnh", href: "/san-pham" }],
      },
    ],
  },
  {
    label: "Sản phẩm khác",
    href: "/san-pham",
    children: [
      {
        label: "Danh mục",
        children: [
          { label: "Bia", href: "/san-pham" },
          { label: "Trà", href: "/san-pham" },
          { label: "Bánh", href: "/san-pham" },
        ],
      },
    ],
  },
  { label: "Liên hệ", href: "/lien-he" },
] as const
