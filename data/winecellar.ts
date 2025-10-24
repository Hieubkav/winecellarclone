export type NavItem = {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
};

export const primaryNav: NavItem[] = [
  {
    label: "Trang chủ",
    href: "https://winecellar.vn/",
    icon: "https://winecellar.vn/wp-content/uploads/2025/06/icon-home-new.svg",
  },
  {
    label: "Giá Tốt",
    href: "https://winecellar.vn/chuong-trinh-khuyen-mai/",
    icon: "https://winecellar.vn/wp-content/uploads/2025/06/flash-sale-1.svg",
  },
  {
    label: "Quà tặng",
    href: "https://winecellar.vn/qua-tang-doanh-nghiep/",
    icon: "https://winecellar.vn/wp-content/uploads/2022/03/icon_gift.png",
    children: [
      { label: "Quà Tặng Doanh Nghiệp", href: "https://winecellar.vn/qua-tang-doanh-nghiep/" },
      { label: "Quà Tặng Tết", href: "https://winecellar.vn/qua-tang-tet/" },
      { label: "Quà Tặng Rượu Vang", href: "https://winecellar.vn/hop-ruou-vang-tet/" },
      { label: "Quà Tặng Rượu Mạnh", href: "https://winecellar.vn/qua-tang-ruou-whisky/" },
      { label: "Quà Tặng Trung Thu", href: "https://winecellar.vn/qua-tang-trung-thu" },
    ],
  },
  {
    label: "Rượu vang",
    href: "https://winecellar.vn/ruou-vang/",
  },
  {
    label: "Rượu mạnh",
    href: "https://winecellar.vn/ruou-manh-cao-cap/",
  },
  {
    label: "Ly pha lê",
    href: "https://winecellar.vn/pha-le-riedel/",
  },
  {
    label: "Nước khoáng",
    href: "https://winecellar.vn/nuoc-khoang/",
  },
  {
    label: "Sản phẩm khác",
    href: "https://winecellar.vn/san-pham-khac/",
    children: [
      { label: "Bia nhập khẩu", href: "https://winecellar.vn/bia-nhap-khau/" },
      { label: "Trà", href: "https://winecellar.vn/tra/" },
      { label: "Bánh nhập khẩu", href: "https://winecellar.vn/banh-nhap-khau/" },
      { label: "Thịt Heo Muối Iberico", href: "https://winecellar.vn/jamon-iberico/" },
      { label: "Phụ kiện", href: "https://winecellar.vn/phu-kien-cao-cap/" },
    ],
  },
  {
    label: "Nhà sản xuất",
    href: "https://winecellar.vn/nha-san-xuat/",
  },
  {
    label: "Kiến thức",
    href: "https://winecellar.vn/tim-hieu-kien-thuc-ruou-vang/",
  },
  {
    label: "Liên hệ",
    href: "https://winecellar.vn/lien-he/",
  },
];

export type HeroSlide = {
  image: string;
  alt: string;
  href: string;
};

export const heroSlides: HeroSlide[] = [
  {
    image: "https://winecellar.vn/wp-content/uploads/2025/06/250722-Banner-main-hop-qua-TBXG-VI-3.png",
    alt: "Hộp quà doanh nghiệp",
    href: "https://winecellar.vn/qua-tang-doanh-nghiep/",
  },
  {
    image: "https://winecellar.vn/wp-content/uploads/2025/06/250926-Banner-main-Faiveley-200-VI.png",
    alt: "Domaine Faiveley 200 năm",
    href: "https://winecellar.vn/nha-san-xuat/domaine-faiveley/",
  },
  {
    image: "https://winecellar.vn/wp-content/uploads/2025/06/banner-bouchard-home.png",
    alt: "Bouchard Père & Fils",
    href: "https://winecellar.vn/nha-san-xuat/bouchard-pere-fils/",
  },
  {
    image: "https://winecellar.vn/wp-content/uploads/2025/06/banner-event-tamdhu-2.png",
    alt: "Sự kiện Tamdhu",
    href: "https://winecellar.vn/su-kien-whisky-tamdhu/",
  },
  {
    image: "https://winecellar.vn/wp-content/uploads/2025/07/250708-Banner-main-W-Big-B-VI.png",
    alt: "Bộ sưu tập Big B nước Ý",
    href: "https://winecellar.vn/4-big-b-nuoc-y/",
  },
  {
    image: "https://winecellar.vn/wp-content/uploads/2025/06/250708-Banner-main-W-Sauv-blanc-VI.png",
    alt: "Top Sauvignon Blanc",
    href: "https://winecellar.vn/top-sauvignon-blanc-by-sommelier/",
  },
];

export const dualBanners = [
  {
    image: "https://winecellar.vn/wp-content/uploads/2025/06/banner-vang-bordeaux.jpg",
    alt: "Vang Bordeaux giá đặc biệt",
    href: "https://winecellar.vn/vang-bordeaux-gia-dac-biet/?orderby=price",
  },
  {
    image: "https://winecellar.vn/wp-content/uploads/2025/06/banner-vang-bourgogne.jpg",
    alt: "Khám phá vang Bourgogne",
    href: "https://winecellar.vn/ruou-vang-burgundy/",
  },
];

export type CategoryTile = {
  name: string;
  href: string;
  image: string;
};

export const spotlightCategories: CategoryTile[] = [
  {
    name: "Vang đỏ",
    href: "https://winecellar.vn/ruou-vang-do/",
    image: "https://winecellar.vn/wp-content/uploads/2025/06/box-vang-do.jpg",
  },
  {
    name: "Vang trắng",
    href: "https://winecellar.vn/ruou-vang-trang/",
    image: "https://winecellar.vn/wp-content/uploads/2025/06/box-vang-trang.png",
  },
  {
    name: "Vang hồng",
    href: "https://winecellar.vn/ruou-vang-hong/",
    image: "https://winecellar.vn/wp-content/uploads/2025/06/box-vang-hong.png",
  },
  {
    name: "Vang sủi",
    href: "https://winecellar.vn/ruou-vang-sui/",
    image: "https://winecellar.vn/wp-content/uploads/2025/06/champagne-2.jpg",
  },
  {
    name: "Whisky",
    href: "https://winecellar.vn/ruou-manh-cao-cap/",
    image: "https://winecellar.vn/wp-content/uploads/2025/06/whisky-2.jpg",
  },
  {
    name: "Ly & Decanter",
    href: "https://winecellar.vn/pha-le-riedel/",
    image: "https://winecellar.vn/wp-content/uploads/2025/06/banner-ly-2.jpg",
  },
];

export type PromotionCard = {
  title: string;
  image: string;
  href: string;
};

export const partyPromotions: PromotionCard[] = [
  {
    title: "Combo Champagne & Vang Đỏ hảo hạng",
    image: "https://winecellar.vn/wp-content/uploads/2025/10/combo-champagne-vang-do.png",
    href: "https://winecellar.vn/blend/combo-champage-alfred-gratien-brut-vang-do-torbreck-the-struie/",
  },
  {
    title: "Combo Vang Trắng & Đỏ tuyển chọn",
    image: "https://winecellar.vn/wp-content/uploads/2025/10/combo-vang-trang-vang-do.png",
    href: "https://winecellar.vn/blend/combo-vang-do-trang-grattamacco-bolgheri-rosso-bouchard-pere-fils-bourgogne-chardonnay/",
  },
  {
    title: "Ly pha lê Riedel – Chuẩn gu sành điệu",
    image: "https://winecellar.vn/wp-content/uploads/2025/07/banner-home-promotion-sale-5.png",
    href: "https://winecellar.vn/graperiedel/",
  },
];

export type ProductCard = {
  name: string;
  href: string;
  image: string;
  price?: string;
  originalPrice?: string;
  badge?: string;
};

export const favouriteProducts: ProductCard[] = [
  {
    name: "Champagne Charles Heidsieck Brut Réserve",
    href: "https://winecellar.vn/ruou-vang-phap/champagne-charles-heidsieck-brut-reserve/",
    image: "https://winecellar.vn/wp-content/uploads/2018/11/champagne-charles-heidsieck-brut-reserve-300x400.jpg",
    price: "2.526.000 ₫",
  },
  {
    name: "Rượu Vang Pháp Château Martinet 2020",
    href: "https://winecellar.vn/ruou-vang-phap/chateau-martinet-2020/",
    image: "https://winecellar.vn/wp-content/uploads/2025/04/chateau-martinet-300x400.jpg",
    price: "1.210.000 ₫",
  },
  {
    name: "Louis Latour Ardèche Chardonnay",
    href: "https://winecellar.vn/ruou-vang-phap/louis-latourardeche-chardonnay/",
    image: "https://winecellar.vn/wp-content/uploads/2019/06/ardeche-chardonnay-louis-latour-300x401.jpg",
    price: "532.000 ₫",
  },
  {
    name: "GlenAllachie 15 Year-Old",
    href: "https://winecellar.vn/ruou-whisky-single-malt/glenallachie-15-sherry/",
    image: "https://winecellar.vn/wp-content/uploads/2023/11/GlenAllachie-15-new-label-300x400.jpg",
    price: "2.150.000 ₫",
  },
  {
    name: "Ly GRAPE@RIEDEL Cabernet / Merlot / Cocktail",
    href: "https://winecellar.vn/graperiedel/graperiedel-cabernet-merlot-cocktail/",
    image: "https://winecellar.vn/wp-content/uploads/2024/08/graperiedel-cabernet-merlot-cocktail-300x400.jpg",
    price: "222.750 ₫",
    originalPrice: "297.000 ₫",
    badge: "Ưu đãi 25%",
  },
  {
    name: "Champagne Billecart-Salmon Brut Rosé",
    href: "https://winecellar.vn/ruou-vang-phap/ruou-sam-panh-champagne-billecart-salmon-brut-rose/",
    image: "https://winecellar.vn/wp-content/uploads/2022/04/champagne-billecart-salmon-brut-rose-300x400.jpg",
    price: "3.256.000 ₫",
  },
  {
    name: "Rượu vang hồng Studio By Miraval",
    href: "https://winecellar.vn/ruou-vang-phap/studio-by-miraval/",
    image: "https://winecellar.vn/wp-content/uploads/2022/05/studio-by-miraval-300x400.jpg",
    price: "750.000 ₫",
  },
  {
    name: "Dr. Loosen Red Slate Riesling Dry",
    href: "https://winecellar.vn/ruou-vang-duc/dr-loosen-red-slate-riesling-dry/",
    image: "https://winecellar.vn/wp-content/uploads/2024/04/dr-loosen-red-slate-riesling-dry-300x400.jpg",
    price: "799.000 ₫",
  },
  {
    name: "Greywacke Sauvignon Blanc",
    href: "https://winecellar.vn/ruou-vang-newzealand/greywacke-sauvignon-blanc/",
    image: "https://winecellar.vn/wp-content/uploads/2020/10/ruou-vang-new-zealand-greywacke-sauvignon-blanc-2021-300x400.jpg",
    price: "714.000 ₫",
  },
  {
    name: "Rượu Vang Ý Terre Nere Etna Rosso",
    href: "https://winecellar.vn/ruou-vang-y/terre-nere-etna-rosso/",
    image: "https://winecellar.vn/wp-content/uploads/2023/04/terre-nere-etna-rosso-300x400.jpg",
    price: "1.029.000 ₫",
  },
  {
    name: "Rượu Whisky Tamdhu 15 Year Old",
    href: "https://winecellar.vn/ruou-whisky-single-malt/tamdhu-15-year-old/",
    image: "https://winecellar.vn/wp-content/uploads/2024/05/tamdhu-15-year-old-300x400.jpg",
    price: "3.410.000 ₫",
  },
  {
    name: "Ly RIEDEL Fatto A Mano Cabernet / Merlot Red RQ",
    href: "https://winecellar.vn/riedel-fatto-a-mano/cabernet-merlot-red-rq/",
    image: "https://winecellar.vn/wp-content/uploads/2021/06/fatto-a-mano-cabernet-merlot-red-rq-705ml-300x300.png",
    price: "2.865.000 ₫",
  },
];

export type BrandLogo = {
  name: string;
  href: string;
  image: string;
};

export const featuredBrands: BrandLogo[] = [
  {
    name: "Maison Louis Latour",
    href: "https://winecellar.vn/nha-san-xuat/maison-louis-latour/",
    image: "https://winecellar.vn/wp-content/uploads/2024/03/Louis-latour-80.jpg",
  },
  {
    name: "Domaine Faiveley",
    href: "https://winecellar.vn/nha-san-xuat/domaine-faiveley/",
    image: "https://winecellar.vn/wp-content/uploads/2024/03/domaine-faiveley-logo.jpg",
  },
  {
    name: "San Marzano",
    href: "https://winecellar.vn/nha-san-xuat/san-marzano/",
    image: "https://winecellar.vn/wp-content/uploads/2024/03/San-Marzano-80.jpg",
  },
  {
    name: "Bodegas Muga",
    href: "https://winecellar.vn/nha-san-xuat/bodegas-muga/",
    image: "https://winecellar.vn/wp-content/uploads/2024/03/Muga-80.jpg",
  },
  {
    name: "Robert Mondavi",
    href: "https://winecellar.vn/nha-san-xuat/robert-mondavi-winery/",
    image: "https://winecellar.vn/wp-content/uploads/2024/03/Robert-Mondavi-80.jpg",
  },
  {
    name: "Torbreck",
    href: "https://winecellar.vn/nha-san-xuat/torbreck/",
    image: "https://winecellar.vn/wp-content/uploads/2024/03/Torbreck-80.jpg",
  },
  {
    name: "Lapostolle",
    href: "https://winecellar.vn/nha-san-xuat/lapostolle/",
    image: "https://winecellar.vn/wp-content/uploads/2024/03/Lapostolle-80.jpg",
  },
  {
    name: "El Enemigo",
    href: "https://winecellar.vn/nha-san-xuat/el-enemigo/",
    image: "https://winecellar.vn/wp-content/uploads/2024/03/El-Enemigo-80.jpg",
  },
  {
    name: "Greywacke",
    href: "https://winecellar.vn/nha-san-xuat/greywacke/",
    image: "https://winecellar.vn/wp-content/uploads/2024/03/Greywacke-80.jpg",
  },
  {
    name: "Dr. Loosen",
    href: "https://winecellar.vn/nha-san-xuat/dr-loosen/",
    image: "https://winecellar.vn/wp-content/uploads/2024/03/dr-loosen-logo.jpg",
  },
];

export type EventCard = {
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  href: string;
};

export const upcomingEvents: EventCard[] = [
  {
    title: "Hanoi | Bodegas Muga – A Rioja Legacy Wine Dinner",
    date: "13.11.2025",
    time: "18:30",
    location: "Link Bistro, La Siesta Premium Lakeside Hotel, Hà Nội",
    image: "https://winecellar.vn/wp-content/uploads/2025/10/hanoi-bodegas-muga-a-rioja-legacy-wine-dinner-764x400.jpg",
    href: "https://winecellar.vn/hanoi-bodegas-muga-a-rioja-legacy-wine-dinner/",
  },
  {
    title: "[Invitation Only] Hồ Chí Minh | Collefrisio Wine Dinner",
    date: "31.10.2025",
    time: "18:30",
    location: "Hotel Nikko Saigon, Q.1, TP. Hồ Chí Minh",
    image: "https://winecellar.vn/wp-content/uploads/2025/09/cf-hcm-1-1-764x400.jpg",
    href: "https://winecellar.vn/invitation-only-ho-chi-minh-collefrisio-wine-dinner/",
  },
  {
    title: "Hanoi | Famille Paquet Wine Dinner",
    date: "30.10.2025",
    time: "18:30",
    location: "Villa des Fleurs, 95 Quán Thánh, Hà Nội",
    image: "https://winecellar.vn/wp-content/uploads/2025/10/famille-paquet-event-764x400.jpg",
    href: "https://winecellar.vn/hanoi-famille-paquet-wine-dinner/",
  },
  {
    title: "[Invitation Only] Đà Nẵng | Collefrisio Wine Dinner",
    date: "30.10.2025",
    time: "18:30",
    location: "Ariyana Ballroom 1, Đà Nẵng",
    image: "https://winecellar.vn/wp-content/uploads/2025/09/cf-dn-1-764x400.jpg",
    href: "https://winecellar.vn/invitation-only-da-nang-collefrisio-wine-dinner/",
  },
  {
    title: "[Invitation Only] Hanoi | Collefrisio Wine Dinner",
    date: "29.10.2025",
    time: "18:30",
    location: "InterContinental Hanoi Landmark72",
    image: "https://winecellar.vn/wp-content/uploads/2025/09/cf-hn-764x400.jpg",
    href: "https://winecellar.vn/invitation-only-hanoi-collefrisio-wine-dinner/",
  },
  {
    title: "Tenuta Luce Wine Dinner",
    date: "02.10.2025",
    time: "18:30",
    location: "The Hudson Rooms – Capella Hanoi",
    image: "https://winecellar.vn/wp-content/uploads/2025/09/tenuta-luce-wine-dinner-764x400.jpg",
    href: "https://winecellar.vn/tenuta-luce-wine-dinner/",
  },
];

export type ArticleCard = {
  title: string;
  href: string;
  image: string;
};

export const knowledgeArticles: ArticleCard[] = [
  {
    title: "Gỏi cuốn tôm thịt & bí quyết pairing chuẩn vị",
    href: "https://winecellar.vn/goi-cuon-tom-thit-ket-hop-ruou-vang-bi-quyet-pairing-chuan-vi-tu-chuyen-gia-winecellar-vn/",
    image: "https://winecellar.vn/wp-content/uploads/2025/10/goi-cuon-tom-thit-ket-hop-ruou-vang-bi-quyet-pairing-chuan-vi-tu-chuyen-gia-winecellar-vn-711x400.jpg",
  },
  {
    title: "Khoa học về dáng ly – bí mật nâng tầm hương vị",
    href: "https://winecellar.vn/khoa-hoc-ve-dang-ly-bi-mat-nang-tam-huong-vi-vang/",
    image: "https://winecellar.vn/wp-content/uploads/2025/10/khoa-hoc-ve-dang-ly-bi-mat-nang-tam-huong-vi-vang-711x400.jpg",
  },
  {
    title: "Những thửa ruộng Premier Cru trứ danh của Billaud-Simon",
    href: "https://winecellar.vn/nhung-thua-ruong-premier-cru-tru-danh-cua-billaud-simon/",
    image: "https://winecellar.vn/wp-content/uploads/2025/10/nhung-thua-ruong-premier-cru-tru-danh-cua-billaud-simon-711x400.jpg",
  },
  {
    title: "Chả cá Lã Vọng & 04 sắc thái rượu vang độc đáo",
    href: "https://winecellar.vn/cha-ca-la-vong-04-sac-thai-ruou-vang-doc-dao-nang-tam-di-san-am-thuc-ha-thanh/",
    image: "https://winecellar.vn/wp-content/uploads/2025/10/cha-ca-la-vong-04-sac-thai-ruou-vang-doc-dao-nang-tam-di-san-am-thuc-ha-thanh-thumb-400x400.jpg",
  },
  {
    title: "Chọn ly cho rượu vang sủi – bí quyết từ chuyên gia RIEDEL",
    href: "https://winecellar.vn/chon-ly-cho-ruou-vang-sui-bi-quyet-tu-chuyen-gia-riedel/",
    image: "https://winecellar.vn/wp-content/uploads/2025/10/chon-ly-cho-ruou-vang-sui-bi-quyet-tu-chuyen-gia-riedel-711x400.jpg",
  },
];

export const newsArticles: ArticleCard[] = [
  {
    title: "Tiêu chí chọn quà tặng doanh nghiệp 2026",
    href: "https://winecellar.vn/tieu-chi-chon-qua-tang-doanh-nghiep-tu-ngan-sach-den-xu-huong/",
    image: "https://winecellar.vn/wp-content/uploads/2025/10/phan-tich-tieu-chi-chon-qua-tang-doanh-nghiep-2026-tu-ngan-sach-den-xu-huong-ca-nhan-hoa-711x400.jpg",
  },
  {
    title: "3 xu hướng quà Tết & 5 nhóm sản phẩm chủ đạo",
    href: "https://winecellar.vn/3-xu-huong-qua-tet-va-5-nhom-san-pham-lam-qua-tang-doanh-nghiep/",
    image: "https://winecellar.vn/wp-content/uploads/2025/10/3-xu-huong-qua-tet-va-5-nhom-san-pham-lam-qua-tang-doanh-nghiep-thumbnail-711x400.jpg",
  },
  {
    title: "50+ hộp quà Tết doanh nghiệp tặng khách hàng",
    href: "https://winecellar.vn/qua-tet-doanh-nghiep-tang-khach-hang-doi-tac/",
    image: "https://winecellar.vn/wp-content/uploads/2025/10/qua-tet-doanh-nghiep-tang-khach-hang-doi-tac-thumbnail-711x400.jpg",
  },
  {
    title: "15+ hộp quà doanh nghiệp giá rẻ và 5 nguyên tắc vàng",
    href: "https://winecellar.vn/15-hop-qua-tang-doanh-nghiep-gia-re-va-5-nguyen-tac-vang/",
    image: "https://winecellar.vn/wp-content/uploads/2025/10/15-hop-qua-tang-doanh-nghiep-gia-re-va-5-nguyen-tac-vang-711x400.jpg",
  },
  {
    title: "5 chai whisky tặng doanh nhân ngày 13/10",
    href: "https://winecellar.vn/5-chai-whisky-tang-doanh-nhan-ngay-13-10-lua-chon-sang-trong-y-nghia-dang-cap/",
    image: "https://winecellar.vn/wp-content/uploads/2025/10/Thumb-900x506-2-711x400.jpg",
  },
];

export type ServiceLink = {
  icon: string;
  label: string;
  href: string;
};

export const customerServices: ServiceLink[] = [
  {
    icon: "https://winecellar.vn/wp-content/themes/winecellarvn/assets/icons/icon_map.png",
    label: "Tìm cửa hàng",
    href: "https://winecellar.vn/lien-he/he-thong-cua-hang/",
  },
  {
    icon: "https://winecellar.vn/wp-content/themes/winecellarvn/assets/icons/icon_gift.png",
    label: "Nhận ưu đãi",
    href: "https://winecellar.vn/chuong-trinh-khuyen-mai/",
  },
  {
    icon: "https://winecellar.vn/wp-content/themes/winecellarvn/assets/icons/icon_gift.png",
    label: "Quà tặng doanh nghiệp",
    href: "https://winecellar.vn/qua-tang-doanh-nghiep/",
  },
];

export type StoreLocation = {
  city: string;
  stores: { address: string; phone: string }[];
};

export const storeSystem: StoreLocation[] = [
  {
    city: "TP. Hà Nội",
    stores: [
      { address: "78 Vũ Phạm Hàm, Yên Hoà", phone: "098 658 7836" },
      { address: "43 Phan Chu Trinh, Cửa Nam", phone: "098 757 7836" },
      { address: "88 Đào Tấn, Giảng Võ", phone: "096 849 7836" },
      { address: "246 Hoàng Ngân, Yên Hòa", phone: "090 308 2366" },
    ],
  },
  {
    city: "TP. Hồ Chí Minh",
    stores: [
      { address: "188 Nguyễn Văn Thủ, Tân Định", phone: "091 673 3416" },
      { address: "253 Nam Kỳ Khởi Nghĩa, Phường Xuân Hòa", phone: "091 673 3414" },
      { address: "58 Song Hành, Bình Trưng", phone: "091 673 3415" },
    ],
  },
  {
    city: "TP. Đà Nẵng",
    stores: [{ address: "21 Hùng Vương, Hải Châu", phone: "093 556 7172" }],
  },
  {
    city: "TP. Nha Trang",
    stores: [{ address: "15 Hai Bà Trưng, Phường Nha Trang", phone: "094 105 1001" }],
  },
  {
    city: "Hội An",
    stores: [{ address: "166 Nguyễn Trường Tộ, Hội An", phone: "096 488 7166" }],
  },
  {
    city: "Phú Quốc",
    stores: [{ address: "217B đường 30/4, Dương Đông", phone: "091 673 9311" }],
  },
];

export const footerMenus = [
  {
    title: "Danh mục rượu",
    links: [
      { label: "Rượu vang Pháp", href: "https://winecellar.vn/ruou-vang-phap/" },
      { label: "Rượu vang Ý", href: "https://winecellar.vn/ruou-vang-y/" },
      { label: "Rượu vang Mỹ", href: "https://winecellar.vn/ruou-vang-my/" },
      { label: "Champagne", href: "https://winecellar.vn/ruou-champagne/" },
      { label: "Rượu vang đỏ", href: "https://winecellar.vn/ruou-vang-do/" },
      { label: "Rượu vang trắng", href: "https://winecellar.vn/ruou-vang-trang/" },
    ],
  },
  {
    title: "Quà tặng",
    links: [
      { label: "Quà tặng Tết", href: "https://winecellar.vn/qua-tang-tet/" },
      { label: "Quà tặng doanh nghiệp", href: "https://winecellar.vn/qua-tang-doanh-nghiep/" },
      { label: "Quà tặng rượu vang", href: "https://winecellar.vn/hop-ruou-vang-tet/" },
      { label: "Quà tặng rượu mạnh", href: "https://winecellar.vn/qua-tang-ruou-whisky/" },
      { label: "Quà tặng trung thu", href: "https://winecellar.vn/qua-tang-trung-thu" },
    ],
  },
  {
    title: "Hỗ trợ khách hàng",
    links: [
      { label: "Chính sách bảo mật", href: "https://winecellar.vn/chinh-sach-bao-mat/" },
      { label: "Chính sách đổi trả", href: "https://winecellar.vn/chinh-sach-doi-tra/" },
      { label: "Mua hàng & thanh toán", href: "https://winecellar.vn/chinh-sach-mua-hang-va-thanh-toan/" },
      { label: "Điều khoản và điều kiện", href: "https://winecellar.vn/dieu-khoan-va-dieu-kien/" },
      { label: "Tuyển dụng", href: "https://winecellar.vn/tuyen-dung/" },
    ],
  },
];

export const hotline = {
  phone: "094 669 8008",
  email: "info@winecellar.vn",
  company:
    "CÔNG TY TNHH HẦM RƯỢU VIỆT NAM – Giấy ĐKKD số: 0107950420, cấp lần đầu ngày 09/08/2017, đăng ký thay đổi lần 5 ngày 20/10/2023.",
  address: "78 Vũ Phạm Hàm, Phường Yên Hòa, Thành phố Hà Nội",
};
