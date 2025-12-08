import React from 'react';
import { Product } from '../types';
import { Wine, MapPin, Droplets, Percent, Tag, Hourglass, Layers, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode }) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  // Calculate Discount
  const discountPercentage = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Attributes List with Specific Icons
  const attributes = [
    // Thương hiệu -> Tag
    { icon: <Tag size={14} />, label: product.brand || product.type, show: true },
    
    // Xuất xứ -> MapPin
    { icon: <MapPin size={14} />, label: product.origin, show: !!product.origin },

    // Hương vị -> Sparkles (New)
    { icon: <Sparkles size={14} />, label: product.flavor, show: !!product.flavor },
    
    // Tuổi rượu -> Hourglass
    { icon: <Hourglass size={14} />, label: `${product.age} Năm`, show: !!product.age },
    
    // Dung tích -> Droplets
    { icon: <Droplets size={14} />, label: `${product.volume}ml`, show: product.volume > 0 },
    
    // Nồng độ -> Percent (Keep)
    { icon: <Percent size={14} />, label: `${product.alcohol}%`, show: product.alcohol > 0 },
    
    // Chất liệu (cho phụ kiện) -> Layers
    { icon: <Layers size={14} />, label: product.material, show: !!product.material },
  ];

  if (viewMode === 'list') {
    return (
      <div className="group relative flex w-full overflow-hidden rounded-md border border-stone-100 bg-white shadow-sm transition-all hover:shadow-md hover:border-gold-400/50">
        <div className="relative w-32 sm:w-48 shrink-0 overflow-hidden bg-stone-50">
           {discountPercentage > 0 && (
             <span className="absolute top-2 left-0 z-10 bg-[#9e1e2d] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm rounded-r-sm">
               -{discountPercentage}%
             </span>
           )}
           <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain p-2 sm:p-4 transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="flex flex-1 flex-col justify-between p-3 sm:p-6">
          <div>
            <h3 className="font-serif text-base sm:text-xl font-bold text-stone-900 group-hover:text-brand-700 transition-colors line-clamp-2">
              {product.name}
            </h3>
            
            <div className="mt-2 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-x-8 sm:gap-y-3">
              {attributes.filter(attr => attr.show).map((attr, index) => (
                <div key={index} className="flex items-center gap-2 text-xs sm:text-sm text-stone-600">
                  <span className="text-brand-700 shrink-0">{attr.icon}</span>
                  <span className="truncate">{attr.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-3 sm:mt-6 flex flex-wrap items-baseline gap-2 sm:gap-3">
            <span className="font-serif text-lg sm:text-2xl font-bold text-brand-700">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs sm:text-sm font-medium text-stone-400 line-through decoration-stone-400 decoration-1">
                    {formatCurrency(product.originalPrice)}
                </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid View - Optimized for Mobile
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-md border border-stone-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-200/50">
      
      {/* Image Area with Zoom Effect */}
      <div className="relative aspect-[4/5] overflow-hidden bg-white border-b border-stone-50">
        {/* Discount Badge */}
        {discountPercentage > 0 && (
            <span className="absolute top-2 left-0 sm:top-4 z-10 bg-[#9e1e2d] px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-sm rounded-r-md">
                -{discountPercentage}%
            </span>
        )}
        
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain p-4 sm:p-8 transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        
        {/* Title */}
        <h3 className="mb-2 sm:mb-3 font-serif text-sm sm:text-lg font-bold leading-tight text-stone-900 group-hover:text-brand-700 transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[3.25rem]">
          {product.name}
        </h3>

        {/* Dynamic Attributes List - Compact on Mobile */}
        <div className="mb-2 sm:mb-4 flex flex-col gap-1 sm:gap-2">
            {attributes.filter(attr => attr.show).map((attr, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-stone-600">
                     <span className="text-brand-700 shrink-0 w-4 sm:w-5 flex justify-center">
                        {attr.icon}
                     </span>
                     <span className="truncate">{attr.label}</span>
                </div>
            ))}
        </div>

        {/* Price Section */}
        <div className="mt-auto flex flex-col pt-2 sm:pt-3 border-t border-stone-100">
            {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[10px] sm:text-xs font-medium text-stone-400 line-through decoration-stone-400 decoration-1 mb-0.5 sm:mb-1">
                    {formatCurrency(product.originalPrice)}
                </span>
            )}
            <span className="font-serif text-base sm:text-xl font-bold text-brand-700">
                {formatCurrency(product.price)}
            </span>
        </div>
      </div>
    </div>
  );
};