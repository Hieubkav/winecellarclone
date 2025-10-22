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

import { knowledgeArticles, newsArticles } from "@/data/winecellar";

export default function WinecellarHome() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-800">
      <Header />
      <main className="flex flex-1 flex-col gap-12">
        <HeroCarousel />
        <DualBanner />
        <CategoryGrid />
        <PromotionCombos />
        <FavouriteProducts />
        <BrandShowcase />
        <EventList />
        <ArticleGrid title="Kiến thức rượu vang" articles={knowledgeArticles} background="neutral" />
        <ArticleGrid title="Tin tức" articles={newsArticles} />
        <CustomerServices />
        <StoreSystem />
      </main>
      <Footer />
    </div>
  );
}
