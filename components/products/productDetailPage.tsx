"use client";

import {
  Star,
  Share2,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  ShoppingBagIcon
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { wineProductData } from "@/data/product/product";

export default function ProductDetailPage() {
  const { 
    category, 
    name, 
    rating, 
    reviewCount, 
    price, 
    originalPrice, 
    unitsSold, 
    images, 
    details, 
    description, 
    badgeText 
  } = wineProductData;

  const [mainImageIndex, setMainImageIndex] = useState(0);

  const goToPreviousImage = () => {
    setMainImageIndex((prevIndex) => 
      prevIndex === 0 ? images.thumbnails.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    setMainImageIndex((prevIndex) => 
      prevIndex === images.thumbnails.length - 1 ? 0 : prevIndex + 1
    );
  };

  const selectImage = (index: number) => {
    setMainImageIndex(index);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-8">
      <div className="flex items-start justify-between">
        <div className="grid gap-2">
          <div className="text-sm text-[#1C1C1C] font-medium">{category}</div>
          <h1 className="text-[32px] md:text-[48px] font-bold leading-[1.2] tracking-[-0.5px] md:tracking-[-1px] text-[#1C1C1C] font-montserrat">{name}</h1>
        </div>
      </div>
      <Separator className="bg-gray-300" />
      <div className="grid items-start gap-6 md:gap-12 md:grid-cols-2">
        {/* Image Gallery Section */}
        <div className="grid gap-4 md:grid-cols-[120px_1fr]">
          {/* Thumbnail Images - Hidden on mobile, visible on desktop */}
          <div className="hidden md:flex md:flex-col md:gap-4">
            {images.thumbnails.map((thumbnail, index) => (
              <button 
                key={index}
                className={`overflow-hidden rounded-lg border transition-colors ${index === mainImageIndex ? 'border-[#ECAA4D]' : 'border-gray-200 hover:border-[#1C1C1C]'} dark:hover:border-gray-50`}
                onClick={() => selectImage(index)}
              >
                <img
                  src={thumbnail}
                  alt={`Product thumbnail ${index + 1}`}
                  className="aspect-4/3 w-full object-contain object-center"
                />
                <span className="sr-only">View Image {index + 1}</span>
              </button>
            ))}
          </div>
          
          {/* Main Product Image and Mobile Thumbnails */}
          <div className="relative">
            <img
              src={images.thumbnails[mainImageIndex]}
              alt={name}
              className="aspect-4/3 w-full rounded-lg border object-contain object-center"
            />
            <div className="absolute top-4 left-4 rounded-full bg-[#9B2C3B] px-3 py-1 text-xs font-medium text-white">
              {badgeText}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white text-[#1C1C1C]"
              onClick={goToPreviousImage}
              >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous image</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white text-[#1C1C1C]"
              onClick={goToNextImage}
              >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next image</span>
            </Button>
            
            {/* Mobile Thumbnail Images - Visible only on mobile */}
            <div className="mt-4 flex flex-row gap-2 overflow-x-auto pb-2 md:hidden">
              {images.thumbnails.map((thumbnail, index) => (
                <button 
                  key={index}
                  className={`overflow-hidden rounded-lg border transition-colors flex-shrink-0 ${index === mainImageIndex ? 'border-[#ECAA4D]' : 'border-gray-200 hover:border-[#1C1C1C]'} dark:hover:border-gray-50`}
                  onClick={() => selectImage(index)}
                >
                  <img
                    src={thumbnail}
                    alt={`Product thumbnail ${index + 1}`}
                    className="aspect-4/3 w-16 object-contain object-center"
                  />
                  <span className="sr-only">View Image {index + 1}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="grid gap-8">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1C1C1C] font-montserrat">{price}</span>
            <span className="text-lg text-gray-500 line-through font-montserrat">{originalPrice}</span>
          </div>
          <div className="text-[16px] md:text-[18px] leading-[1.65] md:leading-[1.7] text-[#1C1C1C] font-montserrat">Đã bán {unitsSold} chai</div>

          <div className="grid gap-4">
            <div className="grid gap-4">
              <div className="pb-2">
                <h3 className="text-[13px] sm:text-[14px] font-light uppercase tracking-[2.8px] sm:tracking-[3.2px] text-[#1C1C1C]">Thông tin rượu</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-[16px] sm:text-[18px] leading-[1.65] sm:leading-[1.70] text-[#1C1C1C] font-montserrat">
                <div className="flex justify-between border-b pb-1">
                  <span className="font-medium">Giống nho:</span>
                  <span className="text-right">{details.grape}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="font-medium">Vùng:</span>
                  <span className="text-right">{details.region}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="font-medium">Năm sản xuất:</span>
                  <span className="text-right">{details.vintage}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="font-medium">Nồng độ:</span>
                  <span className="text-right">{details.alcoholContent}</span>
                </div>
                <div className="flex justify-between border-b pb-1 col-span-2">
                  <span className="font-medium">Nhà sản xuất:</span>
                  <span className="text-right">{details.producer}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="pb-2">
                <h3 className="text-[13px] sm:text-[14px] font-light uppercase tracking-[2.8px] sm:tracking-[3.2px] text-[#1C1C1C]">Mô tả</h3>
              </div>
              <p className="text-[16px] sm:text-[18px] leading-[1.65] sm:leading-[1.70] text-[#1C1C1C] font-montserrat">
                {description}
              </p>
            </div>

            <div className="pt-2">
              <Button className="h-12 w-full text-lg bg-[#ECAA4D] text-white hover:bg-[#d9973a]">
                Liên hệ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}