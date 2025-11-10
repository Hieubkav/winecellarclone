export interface NavLeaf {
  label: string
  href: string
  isHot?: boolean
}

export interface NavNode {
  label: string
  children: NavLeaf[]
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
  { label: "vang pháp", href: "/filter?q=vang+ph%C3%A1p" },
  { label: "vang ý", href: "/filter?q=vang+%C3%BD" },
  { label: "rượu mạnh", href: "/filter?q=r%C6%B0%E1%BB%A3u+m%E1%BA%A1nh" },
  { label: "bia", href: "/filter?q=bia" },
  { label: "ly rượu vang", href: "/filter?q=ly+r%C6%B0%E1%BB%A3u+vang" },
  { label: "bánh quy", href: "/filter?q=b%C3%A1nh+quy" },
  { label: "trà anh quốc", href: "/filter?q=tr%C3%A0+anh+qu%E1%BB%91c" },
  { label: "nước khoáng", href: "/filter?q=n%C6%B0%E1%BB%9Bc+kho%C3%A1ng" },
]

export const menuItems: MenuItemWithChildren[] = [
  { label: "Trang chủ", href: "/" },
  {
    label: "Rượu vang",
    href: "/",
    children: [
      {
        label: "Theo loại rượu",
        children: [
          { label: "Rượu vang đỏ", href: "/", isHot: true },
          { label: "Rượu vang trắng", href: "/" },
          { label: "Rượu vang sủi", href: "/" },
          { label: "Champagne (Sâm panh)", href: "/" },
          { label: "Rượu vang hồng", href: "/" },
          { label: "Rượu vang ngọt", href: "/" },
          { label: "Rượu vang cường hóa", href: "/" },
          { label: "Rượu vang không cồn", href: "/" },
          { label: "Rượu vang Organic", href: "/" },
          { label: "Tất cả rượu vang", href: "/" },
        ],
      },
      {
        label: "Theo quốc gia",
        children: [
          { label: "Pháp", href: "/" },
          { label: "Ý", href: "/" },
          { label: "Tây Ban Nha", href: "/" },
          { label: "Chile", href: "/" },
          { label: "Mỹ", href: "/" },
          { label: "Úc", href: "/" },
          { label: "New Zealand", href: "/" },
          { label: "Argentina", href: "/" },
          { label: "Bồ Đào Nha", href: "/" },
          { label: "Đức", href: "/" },
          { label: "Nam Phi", href: "/" },
        ],
      },
      {
        label: "Theo giống nho",
        children: [
          { label: "Cabernet Sauvignon", href: "/" },
          { label: "Merlot", href: "/" },
          { label: "Syrah (Shiraz)", href: "/" },
          { label: "Pinot Noir", href: "/" },
          { label: "Malbec", href: "/" },
          { label: "Montepulciano D'Abruzzo", href: "/" },
          { label: "Negroamaro", href: "/" },
          { label: "Primitivo", href: "/" },
          { label: "Chardonnay", href: "/" },
          { label: "Sauvignon Blanc", href: "/" },
          { label: "Riesling", href: "/" },
          { label: "Tìm giống nho", href: "/" },
        ],
      },
      {
        label: "Theo vùng nổi tiếng",
        children: [
          { label: "Bordeaux", href: "/" },
          { label: "Bourgogne (Pháp)", href: "/" },
          { label: "Tuscany", href: "/" },
          { label: "Puglia", href: "/" },
          { label: "Piedmont (Ý)", href: "/" },
          { label: "California (Mỹ)", href: "/" },
          { label: "Champagne (Pháp)", href: "/" },
        ],
      },
    ],
  },
  {
    label: "Rượu mạnh",
    href: "/",
    children: [
      {
        label: "Loại rượu",
        children: [
          { label: "Rượu Whisky", href: "/" },
          { label: "Rượu Cognac", href: "/" },
          { label: "Rượu Rum", href: "/" },
          { label: "Rượu Gin", href: "/" },
          { label: "Rượu Vermouth", href: "/" },
          { label: "Rượu Whisky Single Malt", href: "/" },
        ],
      },
      {
        label: "Thương hiệu (Cột 1)",
        children: [
          { label: "GlenAllachie", href: "/" },
          { label: "Tamdhu", href: "/" },
          { label: "Glengoyne", href: "/" },
          { label: "Kilchoman", href: "/" },
          { label: "Meikle Tòir", href: "/" },
          { label: "Glen Moray", href: "/" },
          { label: "Thomas Hine & Co", href: "/" },
          { label: "Cognac Lhéraud", href: "/" },
          { label: "Rosebank", href: "/" },
        ],
      },
      {
        label: "Thương hiệu (Cột 2)",
        children: [
          { label: "Hunter Laing", href: "/" },
          { label: "That Boutique-Y Whisky Company", href: "/" },
          { label: "Kill Devil", href: "/" },
          { label: "Cadenhead's", href: "/" },
          { label: "The Ileach", href: "/" },
          { label: "The Original Islay Rum", href: "/" },
          { label: "Silver Seal", href: "/" },
          { label: "MacNair's", href: "/" },
        ],
      },
      {
        label: "Quà tặng",
        children: [{ label: "Quà tặng rượu mạnh", href: "/" }],
      },
    ],
  },
  {
    label: "Sản phẩm khác",
    href: "/",
    children: [
      {
        label: "Danh mục",
        children: [
          { label: "Bia", href: "/" },
          { label: "Trà", href: "/" },
          { label: "Bánh", href: "/" },
        ],
      },
    ],
  },
  { label: "Liên hệ", href: "/" },
] as const
