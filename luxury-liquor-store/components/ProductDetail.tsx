import React, { useState } from 'react';
import Image from 'next/image';
import { MapPin, Droplets, FlaskConical, Globe, ShieldCheck, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { Product } from '../types';
import { Button } from './ui/Button';

interface ProductDetailProps {
  product: Product;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const IconMap = {
    MapPin: MapPin,
    Droplets: Droplets,
    FlaskConical: FlaskConical,
    Globe: Globe,
    Grape: FlaskConical, 
    Award: ShieldCheck
  };

  return (
    <div className="py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery (Takes 7/12 columns on large screens) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-100 bg-white p-8 shadow-sm group">
             {discountPercentage > 0 && (
              <span className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                -{discountPercentage}%
              </span>
            )}
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-white p-2 transition-all ${
                  selectedImage === idx ? 'border-brand-600 ring-2 ring-brand-100' : 'border-transparent hover:border-gray-200'
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx}`}
                  width={80}
                  height={80}
                  sizes="80px"
                  className="h-full w-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Product Info (Takes 5/12 columns) */}
        <div className="lg:col-span-5 flex flex-col">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-4 leading-tight">
            {product.name}
          </h1>

          <div className="mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-end gap-3 mb-1">
              <span className="text-3xl font-bold text-red-700">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-lg text-slate-400 line-through mb-1">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <Button size="lg" className="w-full gap-2 bg-[#e6a347] hover:bg-[#d58f35] text-white shadow-lg shadow-orange-200 uppercase font-bold tracking-wide">
              <Phone className="w-5 h-5" /> Liên hệ đặt hàng
            </Button>
          </div>

          {/* Specifications Grid - Compact */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
            {product.specs.map((spec, idx) => {
              const Icon = IconMap[spec.iconName] || Globe;
              return (
                <div key={idx} className="flex items-center gap-2.5">
                  <div className="text-red-600">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">{spec.label}</p>
                    <p className="text-sm font-semibold text-slate-900 truncate">{spec.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Description Section - Moved Here to Fill Gap */}
          <div className="mt-2">
             <h3 className="text-slate-900 font-serif font-bold text-lg mb-3">Thông tin chi tiết</h3>
             <div className="relative">
                <div 
                  className={`prose prose-sm prose-slate text-slate-600 transition-all duration-500 ease-in-out ${
                    !isDescExpanded ? 'max-h-[250px] overflow-hidden' : ''
                  }`}
                >
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  
                  {/* Gradient Overlay when collapsed */}
                  {!isDescExpanded && (
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-50/0 via-white to-white pointer-events-none" />
                  )}
                </div>

                <button 
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="mt-2 flex items-center gap-1 text-brand-600 font-medium hover:text-brand-700 hover:underline text-sm"
                >
                  {isDescExpanded ? (
                    <>Thu gọn <ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>Xem thêm <ChevronDown className="w-4 h-4" /></>
                  )}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};