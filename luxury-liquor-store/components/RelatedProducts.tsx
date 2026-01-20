import React, { useRef, useState, MouseEvent } from 'react';
import Image from 'next/image';
import { ArrowRight, Globe, Droplets, FlaskConical, Grape } from 'lucide-react';
import { RelatedProduct } from '../types';

interface RelatedProductsProps {
  title: string;
  products: RelatedProduct[];
}

const IconMap = {
  Globe: Globe,
  Droplets: Droplets,
  FlaskConical: FlaskConical,
  Grape: Grape
};

export const RelatedProducts: React.FC<RelatedProductsProps> = ({ title, products }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Mouse Down Event - Start Dragging
  const handleMouseDown = (e: MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  // Mouse Leave/Up Event - Stop Dragging
  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Mouse Move Event - Perform Scroll
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="py-12 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-900">{title}</h2>
        <a href="#" className="text-brand-600 text-sm font-medium hover:text-brand-700 flex items-center gap-1 group whitespace-nowrap">
          Xem tất cả <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </a>
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
        {products.map((product) => (
          <div 
            key={product.id} 
            className="flex-shrink-0 w-[45%] md:w-[30%] lg:w-[22%] group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col select-none"
          >
            {/* Image Area */}
            <div className="relative aspect-[3/4] p-4 bg-gray-50 overflow-hidden pointer-events-none">
               {product.discount && (
                <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
                  -{product.discount}%
                </span>
              )}
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw"
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Content Area */}
            <div className="p-3 md:p-4 flex flex-col flex-grow pointer-events-none">
              <h3 className="text-sm md:text-base font-medium text-slate-900 line-clamp-2 mb-2 group-hover:text-red-700 transition-colors flex-grow">
                {product.name}
              </h3>
              
              {/* Specs List */}
              <div className="space-y-1 mb-2 md:mb-3">
                {product.specs?.map((spec, i) => {
                  const Icon = IconMap[spec.icon];
                  return (
                    <div key={i} className="flex items-center gap-1.5 text-[10px] md:text-xs text-slate-500">
                      <Icon className="w-3 h-3 text-red-500 shrink-0" />
                      <span className="truncate">{spec.text}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                <span className="font-bold text-red-700 text-base md:text-lg">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};