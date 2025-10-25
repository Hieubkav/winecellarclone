'use client';

import Image from 'next/image';
import Link from 'next/link';

import { featuredBrands } from '@/data/winecellar';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

export default function BrandShowcase() {
  return (
    <section className="bg-white py-1">
      <div className="mx-auto flex max-w-6xl flex-col gap-1">
        <header className="text-center mb-1">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-[#1C1C1C]">Thương hiệu nổi bật</h2>
        </header>
        <Carousel 
          opts={{ 
            align: 'center',
            loop: true 
          }}
          className="w-full"
          autoPlay={true}
          delay={3000}
        >
          <CarouselContent className="ml-0 px-4">
            {featuredBrands.map((brand) => (
              <CarouselItem 
                key={brand.name} 
                className="basis-1/3 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <Link
                  href={brand.href}
                  className="flex h-full items-center justify-center p-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Image 
                    src={brand.image} 
                    alt={brand.name} 
                    width={180} 
                    height={80} 
                    className="w-auto object-contain transition-transform duration-300 hover:scale-105" 
                  />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
