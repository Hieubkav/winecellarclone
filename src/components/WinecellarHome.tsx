import Header from "./layout/Header";
import Footer from "./layout/Footer";
import HeroCarousel from "./sections/HeroCarousel";
import DualBanner from "./sections/DualBanner";
import CategoryGrid from "./sections/CategoryGrid";
import PromotionCombos from "./sections/PromotionCombos";
import FavouriteProducts from "./sections/FavouriteProducts";
import BrandShowcase from "./sections/BrandShowcase";
import EventList from "./sections/EventList";
import ArticleGrid from "./sections/ArticleGrid";
import CustomerServices from "./sections/CustomerServices";
import StoreSystem from "./sections/StoreSystem";

const knowledgeArticles = [
    {
        title: "Gỏi cuốn tôm thịt & bí quyết pairing chuẩn vị",
        href: "/",
        image: "https://winecellar.vn/wp-content/uploads/2025/10/goi-cuon-tom-thit-ket-hop-ruou-vang-bi-quyet-pairing-chuan-vi-tu-chuyen-gia-winecellar-vn-711x400.jpg",
    },
    {
        title: "Khoa học về dáng ly – bí mật nâng tầm hương vị",
        href: "/",
        image: "https://winecellar.vn/wp-content/uploads/2025/10/khoa-hoc-ve-dang-ly-bi-mat-nang-tam-huong-vi-vang-711x400.jpg",
    },
    {
        title: "Những thửa ruộng Premier Cru trứ danh của Billaud-Simon",
        href: "/",
        image: "https://winecellar.vn/wp-content/uploads/2025/10/nhung-thua-ruong-premier-cru-tru-danh-cua-billaud-simon-711x400.jpg",
    },
    {
        title: "Chả cá Lã Vọng & 04 sắc thái rượu vang độc đáo",
        href: "/",
        image: "https://winecellar.vn/wp-content/uploads/2025/10/cha-ca-la-vong-04-sac-thai-ruou-vang-doc-dao-nang-tam-di-san-am-thuc-ha-thanh-thumb-400x400.jpg",
    },
    {
        title: "Chọn ly cho rượu vang sủi – bí quyết từ chuyên gia RIEDEL",
        href: "/",
        image: "https://winecellar.vn/wp-content/uploads/2025/10/chon-ly-cho-ruou-vang-sui-bi-quyet-tu-chuyen-gia-riedel-711x400.jpg",
    },
];

const newsArticles = [
    {
        title: "Tiêu chí chọn quà tặng doanh nghiệp 2026",
        href: "/",
        image: "https://winecellar.vn/wp-content/uploads/2025/10/phan-tich-tieu-chi-chon-qua-tang-doanh-nghiep-2026-tu-ngan-sach-den-xu-huong-ca-nhan-hoa-711x400.jpg",
    },
    {
        title: "3 xu hướng quà Tết & 5 nhóm sản phẩm chủ đạo",
        href: "/",
        image: "https://winecellar.vn/wp-content/uploads/2025/10/3-xu-huong-qua-tet-va-5-nhom-san-pham-lam-qua-tang-doanh-nghiep-thumbnail-711x400.jpg",
    },
    {
        title: "50+ hộp quà Tết doanh nghiệp tặng khách hàng",
        href: "/",
        image: "https://winecellar.vn/wp-content/uploads/2025/10/qua-tet-doanh-nghiep-tang-khach-hang-doi-tac-thumbnail-711x400.jpg",
    },
    {
        title: "15+ hộp quà doanh nghiệp giá rẻ và 5 nguyên tắc vàng",
        href: "/",
        image: "https://winecellar.vn/wp-content/uploads/2025/10/15-hop-qua-tang-doanh-nghiep-gia-re-va-5-nguyen-tac-vang-711x400.jpg",
    },
    {
        title: "5 chai whisky tặng doanh nhân ngày 13/10",
        href: "/",
        image: "https://winecellar.vn/wp-content/uploads/2025/10/Thumb-900x506-2-711x400.jpg",
    },
];

export default function WinecellarHome() {
    return (
        <div className="flex min-h-screen flex-col bg-white text-zinc-800">
            <Header />
            <main className="flex flex-1 flex-col gap-12">
                {/* <HeroCarousel /> */}
                {/* <DualBanner /> */}
                {/* <CategoryGrid /> */}
                {/* <PromotionCombos /> */}
                {/* <FavouriteProducts /> */}
                {/* <BrandShowcase /> */}
                {/* <EventList /> */}
                {/* <ArticleGrid title="Kiến thức rượu vang" articles={knowledgeArticles} background="neutral" /> */}
                {/* <ArticleGrid title="Tin tức" articles={newsArticles} /> */}
                {/* <CustomerServices /> */}
                {/* <StoreSystem /> */}
            </main>
            {/* <Footer /> */}
        </div>
    );
}
