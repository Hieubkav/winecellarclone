export type HomeShowcaseProduct = {
  id: string;
  name: string;
  href: string;
  image: string;
  country: string;
  style: string;
  price: string;
  badge?: string;
};

export const spiritShowcaseProducts: HomeShowcaseProduct[] = [
  {
    id: "spirit-macallan-18",
    name: "Macallan 18 Sherry Oak",
    href: "https://winecellar.vn/ruou-manh-cao-cap/macallan-18-sherry-oak-2019/",
    image: "https://winecellar.vn/wp-content/uploads/2023/06/the-ileach-cask-strength.jpg",
    country: "Scotland",
    style: "Single Malt",
    price: "10.890.000 ₫",
    badge: "Sherry Oak",
  },
  {
    id: "spirit-lagavulin-16",
    name: "Lagavulin 16 Year Old",
    href: "https://winecellar.vn/ruou-whisky-single-malt/lagavulin-16-year-old/",
    image: "https://winecellar.vn/wp-content/uploads/2023/06/the-ileach-cask-strength.jpg",
    country: "Islay",
    style: "Peated Malt",
    price: "3.950.000 ₫",
  },
  {
    id: "spirit-nikka-barrel",
    name: "Nikka From The Barrel",
    href: "https://winecellar.vn/ruou-whisky-blended/nikka-from-the-barrel/",
    image: "https://winecellar.vn/wp-content/uploads/2023/06/the-ileach-cask-strength.jpg",
    country: "Japan",
    style: "Blended Whisky",
    price: "1.890.000 ₫",
    badge: "Best Seller",
  },
  {
    id: "spirit-tamdhu-12",
    name: "Tamdhu 12 Year Old",
    href: "https://winecellar.vn/ruou-whisky-single-malt/tamdhu-12-year-old/",
    image: "https://winecellar.vn/wp-content/uploads/2023/06/the-ileach-cask-strength.jpg",
    country: "Speyside",
    style: "Single Malt",
    price: "2.150.000 ₫",
  },
  {
    id: "spirit-hennessy-xo",
    name: "Hennessy XO",
    href: "https://winecellar.vn/ruou-cognac/hennessy-xo/",
    image: "https://winecellar.vn/wp-content/uploads/2023/06/the-ileach-cask-strength.jpg",
    country: "France",
    style: "Cognac XO",
    price: "6.750.000 ₫",
    badge: "Iconic",
  },
  {
    id: "spirit-glenfiddich-grand-cru",
    name: "Glenfiddich Grand Cru 23",
    href: "https://winecellar.vn/ruou-whisky-single-malt/glenfiddich-grand-cru-23-year-old/",
    image: "https://winecellar.vn/wp-content/uploads/2023/06/the-ileach-cask-strength.jpg",
    country: "Highland",
    style: "Single Malt",
    price: "8.420.000 ₫",
  },
  {
    id: "spirit-blue-label",
    name: "Johnnie Walker Blue Label",
    href: "https://winecellar.vn/ruou-whisky-blended/johnnie-walker-blue-label/",
    image: "https://winecellar.vn/wp-content/uploads/2023/06/the-ileach-cask-strength.jpg",
    country: "Scotland",
    style: "Blended Scotch",
    price: "4.950.000 ₫",
  },
  {
    id: "spirit-martell-cordon-bleu",
    name: "Martell Cordon Bleu",
    href: "https://winecellar.vn/ruou-cognac/martell-cordon-bleu/",
    image: "https://winecellar.vn/wp-content/uploads/2023/06/the-ileach-cask-strength.jpg",
    country: "France",
    style: "Cognac",
    price: "4.350.000 ₫",
  },
];

export const wineShowcaseProducts: HomeShowcaseProduct[] = [
  {
    id: "wine-ruinart-blanc",
    name: "Ruinart Blanc de Blancs",
    href: "https://winecellar.vn/ruou-vang-phap/champagne-ruinart-blanc-de-blancs/",
    image: "https://winecellar.vn/wp-content/uploads/2025/07/domaine-faiveley-bourgogne-pinot-noir.jpg",
    country: "Champagne",
    style: "Brut NV",
    price: "3.890.000 ₫",
    badge: "Champagne",
  },
  {
    id: "wine-chateau-talbot",
    name: "Château Talbot 2019",
    href: "https://winecellar.vn/ruou-vang-phap/chateau-talbot-2019/",
    image: "https://winecellar.vn/wp-content/uploads/2025/07/domaine-faiveley-bourgogne-pinot-noir.jpg",
    country: "Bordeaux",
    style: "Grand Cru",
    price: "2.950.000 ₫",
  },
  {
    id: "wine-cloudy-bay",
    name: "Cloudy Bay Sauvignon Blanc",
    href: "https://winecellar.vn/ruou-vang-newzealand/cloudy-bay-sauvignon-blanc/",
    image: "https://winecellar.vn/wp-content/uploads/2025/07/domaine-faiveley-bourgogne-pinot-noir.jpg",
    country: "New Zealand",
    style: "White Wine",
    price: "1.450.000 ₫",
  },
  {
    id: "wine-penfolds-389",
    name: "Penfolds BIN 389",
    href: "https://winecellar.vn/ruou-vang-uc/penfolds-bin-389-cabernet-shiraz/",
    image: "https://winecellar.vn/wp-content/uploads/2025/07/domaine-faiveley-bourgogne-pinot-noir.jpg",
    country: "Australia",
    style: "Cabernet Shiraz",
    price: "2.350.000 ₫",
  },
  {
    id: "wine-pio-cesare",
    name: "Pio Cesare Barolo DOCG",
    href: "https://winecellar.vn/ruou-vang-italia/pio-cesare-barolo-docg/",
    image: "https://winecellar.vn/wp-content/uploads/2025/07/domaine-faiveley-bourgogne-pinot-noir.jpg",
    country: "Piemonte",
    style: "Nebbiolo",
    price: "2.690.000 ₫",
  },
  {
    id: "wine-bouchard-chardonnay",
    name: "Bouchard Bourgogne Chardonnay",
    href: "https://winecellar.vn/ruou-vang-phap/bouchard-pere-fils-bourgogne-chardonnay/",
    image: "https://winecellar.vn/wp-content/uploads/2025/07/domaine-faiveley-bourgogne-pinot-noir.jpg",
    country: "Bourgogne",
    style: "Chardonnay",
    price: "865.000 ₫",
  },
  {
    id: "wine-vacheron-sancerre",
    name: "Domaine Vacheron Sancerre",
    href: "https://winecellar.vn/ruou-vang-phap/domaine-vacheron-sancerre/",
    image: "https://winecellar.vn/wp-content/uploads/2025/07/domaine-faiveley-bourgogne-pinot-noir.jpg",
    country: "Loire",
    style: "Sauvignon Blanc",
    price: "1.980.000 ₫",
  },
  {
    id: "wine-studio-miraval",
    name: "Studio by Miraval Rosé",
    href: "https://winecellar.vn/ruou-vang-phap/studio-by-miraval/",
    image: "https://winecellar.vn/wp-content/uploads/2025/07/domaine-faiveley-bourgogne-pinot-noir.jpg",
    country: "Provence",
    style: "Rosé",
    price: "750.000 ₫",
  },
];
