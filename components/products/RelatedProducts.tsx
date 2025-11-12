import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FilterProductCard } from "@/components/filter/product-card";
import type { ProductListItem } from "@/lib/api/products";
import type { Wine } from "@/data/filter/store";

interface RelatedProductsSectionProps {
  title: string;
  products: ProductListItem[];
  viewAllHref?: string;
  viewAllLabel?: string;
}

// Convert ProductListItem to Wine format for FilterProductCard
const convertToWine = (product: ProductListItem): Wine => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  price: product.price || 0,
  originalPrice: product.original_price,
  discountPercent: product.discount_percent,
  showContactCta: product.show_contact_cta,
  imageUrl: product.main_image_url || "/placeholder/wine-bottle.svg",
  badge: product.badges?.[0] || (product.discount_percent ? `Giảm ${product.discount_percent}%` : undefined),
  brand: product.brand_term?.name,
  origin: product.country_term?.name,
  category: product.category?.name,
  type: product.type?.name,
  alcoholPercent: product.alcohol_percent,
});

export default function RelatedProductsSection({ 
  title, 
  products, 
  viewAllHref, 
  viewAllLabel = "Xem thêm" 
}: RelatedProductsSectionProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#1C1C1C]">
              {title}
            </h2>
            {viewAllHref && (
              <Button asChild variant="outline">
                <Link href={viewAllHref}>{viewAllLabel}</Link>
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <FilterProductCard
                key={product.id}
                wine={convertToWine(product)}
                viewMode="grid"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
