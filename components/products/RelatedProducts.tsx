"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import { ArrowRight, Globe, Droplets, FlaskConical } from "lucide-react";
import type { ProductListItem } from "@/lib/api/products";
import { ProductImage } from "@/components/ui/product-image";

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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="py-12 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-900">{title}</h2>
        {viewAllHref && (
          <Link 
            href={viewAllHref} 
            className="text-[#9B2C3B] text-sm font-medium hover:text-[#7a2330] flex items-center gap-1 group whitespace-nowrap"
          >
            {viewAllLabel} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
      
      {/* Carousel Container with Drag Support */}
      <div 
        ref={scrollRef}
        className={`flex overflow-x-auto gap-4 pb-6 -mx-4 px-4 no-scrollbar md:gap-6 ${
          isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseUpOrLeave}
        onMouseUp={handleMouseUpOrLeave}
        onMouseMove={handleMouseMove}
      >
        {products.map((product) => {
          const discountPercent = product.discount_percent || 
            (product.original_price && product.price && product.original_price > product.price 
              ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
              : 0);

          const specs: { icon: typeof Globe; text: string }[] = [];
          
          if (product.country_term?.name) {
            specs.push({ icon: Globe, text: product.country_term.name });
          }
          if (product.alcohol_percent) {
            specs.push({ icon: Droplets, text: `${product.alcohol_percent}%` });
          }
          if (product.volume_ml) {
            specs.push({ icon: FlaskConical, text: `${product.volume_ml}ml` });
          }

          return (
            <Link 
              key={product.id}
              href={`/san-pham/${product.slug}`}
              className="flex-shrink-0 w-[45%] md:w-[30%] lg:w-[22%] group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col select-none"
            >
              {/* Image Area */}
              <div className="relative aspect-[3/4] p-4 bg-gray-50 overflow-hidden pointer-events-none">
                {discountPercent > 0 && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
                    -{discountPercent}%
                  </span>
                )}
                <div className="relative w-full h-full">
                  <ProductImage 
                    src={product.main_image_url || "/placeholder/wine-bottle.svg"} 
                    alt={product.name}
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 22vw"
                  />
                </div>
              </div>

              {/* Content Area */}
              <div className="p-3 md:p-4 flex flex-col flex-grow pointer-events-none">
                <h3 className="text-sm md:text-base font-medium text-slate-900 line-clamp-2 mb-2 group-hover:text-red-700 transition-colors flex-grow">
                  {product.name}
                </h3>
                
                {/* Specs List */}
                {specs.length > 0 && (
                  <div className="space-y-1 mb-2 md:mb-3">
                    {specs.map((spec, i) => {
                      const Icon = spec.icon;
                      return (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] md:text-xs text-slate-500">
                          <Icon className="w-3 h-3 text-red-500 shrink-0" />
                          <span className="truncate">{spec.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                  <span className="font-bold text-red-700 text-base md:text-lg">
                    {product.show_contact_cta ? "Liên hệ" : formatPrice(product.price)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
