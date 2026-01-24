"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Clock, ChevronRight, Facebook, Twitter, ChevronLeft } from "lucide-react";
import ArticleJsonLd from "./ArticleJsonLd";
import RelatedArticles from "./RelatedArticles";
import type { ArticleDetail } from "@/lib/api/articles";
import { processArticleContent, calculateReadingTime } from "@/lib/utils/article-content";
import { useTracking } from "@/hooks/use-tracking";

interface ArticleDetailPageProps {
  article: ArticleDetail;
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
};

// Image Gallery Component with Carousel
const ImageGallery = ({ 
  images, 
  caption 
}: { 
  images: { url: string; alt?: string }[]; 
  caption?: string;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const count = images.length;

  const prevSlide = () => {
    setCurrentIndex((curr) => (curr === 0 ? count - 1 : curr - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((curr) => (curr === count - 1 ? 0 : curr + 1));
  };

  return (
    <figure className="my-10 not-prose group relative w-full">
      <div className="relative overflow-hidden rounded-xl shadow-sm aspect-[16/10] bg-gray-100">
        {count === 1 ? (
          <Image
            src={images[0].url}
            alt={images[0].alt || caption || "Article image"}
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
        ) : (
          <>
            <div
              className="flex transition-transform duration-500 ease-out h-full"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {images.map((img, idx) => (
                <div key={idx} className="min-w-full h-full relative">
                  <Image
                    src={img.url}
                    alt={img.alt || `${caption} - Ảnh ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={prevSlide}
                className="pointer-events-auto h-10 w-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-[#8B1832] hover:border-[#8B1832] transition-all shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextSlide}
                className="pointer-events-auto h-10 w-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-[#8B1832] hover:border-[#8B1832] transition-all shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Dots Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentIndex === idx
                      ? "bg-white w-6"
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {caption && (
        <figcaption className="text-center text-sm text-gray-500 mt-3 font-serif italic tracking-wide">
          {caption} {count > 1 && `(${currentIndex + 1}/${count})`}
        </figcaption>
      )}
    </figure>
  );
};

// Skeleton Loading Component
const ArticleSkeleton = () => (
  <div className="min-h-screen bg-white">
    <div className="border-b border-gray-200/40 pb-6 mb-6">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
          <div className="h-3 w-3 bg-gray-200 animate-pulse rounded" />
          <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="h-10 w-3/4 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="flex items-center gap-6">
          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    </div>
    <div className="container mx-auto px-4 max-w-5xl space-y-4">
      <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
      <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
      <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded" />
      <div className="h-64 w-full bg-gray-200 animate-pulse rounded-xl mt-6" />
    </div>
  </div>
);

export default function ArticleDetailPage({ article }: ArticleDetailPageProps) {
  const { trackArticleView, trackCTAContact } = useTracking();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (article?.id) {
      trackArticleView(article.id, {
        article_title: article.title,
        author: article.author?.name,
        published_at: article.published_at,
      });
    }
  }, [article?.id, article.title, article.author, article.published_at, trackArticleView]);

  const processedContent = processArticleContent(article.content);
  const readingTime = article.content ? calculateReadingTime(article.content) : 5;
  const coverImage = article.cover_image_url || "/placeholder/article.svg";

  // Prepare gallery images
  const galleryImages = article.gallery && article.gallery.length > 0
    ? article.gallery.map(img => ({ url: img.url || "/placeholder/article.svg", alt: img.alt || article.title }))
    : [];

  // Share functionality
  const shareUrl = typeof window !== "undefined" 
    ? window.location.href 
    : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/bai-viet/${article.slug}`;
  const shareTitle = article.title;

  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, "_blank", "width=600,height=500,noopener,noreferrer");
    trackCTAContact({ button: "share_facebook", placement: "article_share", article_id: article.id });
  };

  const handleShareX = () => {
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(xUrl, "_blank", "width=600,height=500,noopener,noreferrer");
    trackCTAContact({ button: "share_twitter", placement: "article_share", article_id: article.id });
  };

  if (isLoading) {
    return <ArticleSkeleton />;
  }

  return (
    <>
      <ArticleJsonLd article={article} />
      <div className="min-h-screen bg-white selection:bg-[#C9A050]/30 selection:text-[#8B1832]">
        <article className="min-h-screen">
          {/* Breadcrumb & Meta - Compact */}
          <div className="border-b border-gray-200/40 pb-6 mb-6">
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <Link href="/" className="hover:text-[#8B1832] cursor-pointer transition-colors">
                  Trang chủ
                </Link>
                <ChevronRight className="h-3 w-3 text-[#C9A050]" />
                <Link href="/bai-viet" className="hover:text-[#8B1832] cursor-pointer transition-colors">
                  Blog Rượu Vang
                </Link>
                <ChevronRight className="h-3 w-3 text-[#C9A050]" />
                <span className="text-[#C9A050] font-medium uppercase tracking-wide truncate max-w-[200px]">
                  {article.title}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#1C1C1C] leading-tight mb-4">
                {article.title}
              </h1>

              <div className="flex items-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-[#C9A050]" />
                  <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[#C9A050]" />
                  <span>{readingTime} phút đọc</span>
                </div>
                {article.author && (
                  <div className="flex items-center gap-2">
                    <span className="text-[#C9A050]">•</span>
                    <span>{article.author.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-4 max-w-5xl">
            <div
              className="prose prose-slate prose-lg max-w-none 
                prose-headings:font-serif prose-headings:text-[#8B1832]
                prose-a:text-[#C9A050] prose-a:no-underline hover:prose-a:underline
                prose-p:leading-relaxed prose-p:mb-4
                prose-headings:mt-8 prose-headings:mb-4
                prose-li:marker:text-[#C9A050]
                prose-blockquote:border-l-[#C9A050] prose-blockquote:bg-gray-50/50 prose-blockquote:py-2 prose-blockquote:pr-4
                prose-img:rounded-xl prose-img:shadow-sm
                prose-strong:text-[#1C1C1C]
              "
            >
              {/* Excerpt as lead paragraph */}
              {article.excerpt && (
                <p className="lead text-xl text-gray-700 font-serif italic mb-6 border-l-2 border-[#C9A050]/50 pl-4">
                  {article.excerpt}
                </p>
              )}

              {/* Cover Image */}
              <ImageGallery
                images={[{ url: coverImage, alt: article.title }]}
                caption={article.title}
              />

              {/* Content */}
              {processedContent && (
                <div dangerouslySetInnerHTML={{ __html: processedContent }} />
              )}

              {/* Gallery - Show if more than 1 image */}
              {galleryImages.length > 1 && (
                <>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-[#C9A050]/50 to-transparent my-10" />
                  <h3 className="text-[#C9A050] flex items-center gap-2">
                    <span className="inline-block w-8 h-[1px] bg-[#C9A050] align-middle" />
                    Hình ảnh bài viết
                  </h3>
                  <ImageGallery
                    images={galleryImages}
                    caption="Bộ sưu tập ảnh (Vuốt để xem thêm)"
                  />
                </>
              )}
            </div>

            {/* Share Section */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="text-center">
                  <span className="font-serif font-bold text-2xl text-[#8B1832] block mb-2">
                    Đừng uống một mình
                  </span>
                  <span className="text-gray-500 text-sm">
                    Chia sẻ bài viết này cho hội bạn thân
                  </span>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <button
                    onClick={handleShareFacebook}
                    className="flex-1 md:flex-none h-12 px-8 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 gap-2 min-w-[160px] inline-flex items-center justify-center font-medium"
                  >
                    <Facebook className="h-5 w-5 fill-current" />
                    <span>Facebook</span>
                  </button>

                  <button
                    onClick={handleShareX}
                    className="flex-1 md:flex-none h-12 px-8 bg-black hover:bg-black/80 text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 gap-2 min-w-[160px] inline-flex items-center justify-center font-medium"
                  >
                    <Twitter className="h-5 w-5 fill-current" />
                    <span>X (Twitter)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {article.related_articles && article.related_articles.length > 0 && (
          <div className="container mx-auto px-4 md:px-6 max-w-7xl border-t border-gray-200 pt-8 mt-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gray-200" />
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#8B1832] shrink-0">
                Bài viết liên quan
              </h2>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <RelatedArticles articles={article.related_articles} />
          </div>
        )}

        {/* Footer CTA */}
        <div className="bg-gray-50 py-12 mt-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-[#1C1C1C] mb-4 font-serif">
                Khám phá thêm bài viết
              </h2>
              <p className="text-gray-600 mb-6">
                Tìm hiểu thêm về rượu vang, cocktail và nghệ thuật thưởng thức
              </p>
              <Link
                href="/bai-viet"
                className="inline-flex h-12 px-8 items-center justify-center bg-[#8B1832] hover:bg-[#6B1226] text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 font-medium"
                onClick={() =>
                  trackCTAContact({
                    button: "view_all_articles",
                    placement: "article_footer",
                    article_id: article.id,
                    article_title: article.title,
                  })
                }
              >
                Xem tất cả bài viết
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
