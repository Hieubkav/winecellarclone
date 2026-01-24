"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import { ArrowRight, ShoppingCart } from "lucide-react";
import type { ProductListItem } from "@/lib/api/products";
import { ProductImage } from "@/components/ui/product-image";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/utils/article-content";

interface RelatedProductsSectionProps {
  title: string;
  products: ProductListItem[];
  viewAllHref?: string;
  viewAllLabel?: string;
}

const formatPrice = (price: number | null | undefined): string => {
  if (!price || price <= 0) return "Liên hệ";
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export default function RelatedProductsSection({ 
  title, 
  products, 
  viewAllHref, 
  viewAllLabel = "Xem tất cả" 
}: RelatedProductsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [_isDragging, setIsDragging] = useState(false);
  const [_startX, setStartX] = useState(0);
  const [_scrollLeft, setScrollLeft] = useState(0);

  const _handleMouseDown = (e: MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const _handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const _handleMouseMove = (e: MouseEvent) => {
    if (!_isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - _startX) * 2;
    scrollRef.current.scrollLeft = _scrollLeft - walk;
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-serif font-bold text-slate-900 relative inline-block">
          {title}
          <span className="absolute -bottom-2 left-0 w-12 h-1 bg-[#9B2C3B] rounded-full"></span>
        </h2>
        {viewAllHref && (
          <Link 
            href={viewAllHref} 
            className="text-slate-600 hover:text-[#9B2C3B] text-sm font-medium flex items-center gap-1 group whitespace-nowrap hidden sm:flex"
          >
            {viewAllLabel} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.slice(0, 4).map((product) => {
          const discountPercent = product.discount_percent || 
            (product.original_price && product.price && product.original_price > product.price 
              ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
              : 0);

          return (
            <div
              key={product.id}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-[#e5ddd0] bg-white transition-all hover:shadow-lg hover:-translate-y-1 duration-300"
            >
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f0e8]">
                <Link href={`/san-pham/${product.slug}`} className="block w-full h-full p-4">
                  <ProductImage 
                    src={getImageUrl(product.main_image_url)} 
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 25vw"
                  />
                </Link>
                {discountPercent > 0 && (
                  <div className="absolute top-2 left-2 bg-[hsl(0,84.2%,60.2%)] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
                    -{discountPercent}%
                  </div>
                )}
                {/* Overlay Action */}
                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex justify-center">
                  <Button 
                    size="sm" 
                    className="w-full shadow-lg bg-[#9B2C3B] hover:bg-[#9B2C3B]/90 text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/san-pham/${product.slug}`;
                    }}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" /> Đặt hàng
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-4">
                {product.type?.name && (
                  <span className="text-xs text-slate-500 mb-1">{product.type.name}</span>
                )}
                <Link 
                  href={`/san-pham/${product.slug}`}
                  className="line-clamp-2 text-sm font-medium text-slate-900 mb-2 h-10 group-hover:text-[#9B2C3B] transition-colors"
                >
                  {product.name}
                </Link>
                <div className="mt-auto flex items-baseline gap-2">
                  <span className="text-base font-bold text-[#9B2C3B]">
                    {product.show_contact_cta ? "Liên hệ" : formatPrice(product.price)}
                  </span>
                  {product.original_price && product.price && product.original_price > product.price && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {viewAllHref && (
        <div className="mt-6 flex justify-center sm:hidden">
          <Button variant="outline" className="w-full border-[#9B2C3B]/20 hover:bg-[#9B2C3B]/5 text-[#9B2C3B]">
            {viewAllLabel}
          </Button>
        </div>
      )}
    </section>
  );
}
