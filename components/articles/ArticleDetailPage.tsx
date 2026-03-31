"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Clock, ChevronRight, Facebook, Twitter, ChevronLeft } from "lucide-react";
import ArticleJsonLd from "./ArticleJsonLd";
import RelatedArticles from "./RelatedArticles";
import type { ArticleDetail } from "@/lib/api/articles";
import { processArticleContent, calculateReadingTime } from "@/lib/utils/article-content";
import { getArticleImageUrl, getImageUrl } from "@/lib/utils/image";
import { useTracking } from "@/hooks/use-tracking";

interface ArticleDetailPageProps {
  article: ArticleDetail;
  fontFamily?: string;
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
        <figcaption className="text-center text-sm text-gray-500 mt-3 italic tracking-wide">
          {caption} {count > 1 && `(${currentIndex + 1}/${count})`}
        </figcaption>
      )}
    </figure>
  );
};

export default function ArticleDetailPage({ article, fontFamily }: ArticleDetailPageProps) {
  const { trackArticleView, trackCTAContact } = useTracking();

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
  const coverImage = getArticleImageUrl(
    article.cover_image_canonical_url || article.cover_image_url
  );

  // Prepare gallery images
  const galleryImages = article.gallery && article.gallery.length > 0
    ? article.gallery
        .map((img): { url: string; alt?: string } | null => {
          const rawUrl = img.canonical_url || img.url;
          if (!rawUrl) return null;
          return { url: getImageUrl(rawUrl), alt: img.alt || article.title || undefined };
        })
        .filter((img): img is { url: string; alt?: string } => Boolean(img))
    : [];

  // Share functionality
  const shareUrl = typeof window !== "undefined" 
    ? window.location.href 
    : `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn"}/bai-viet/${article.slug}`;
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

  return (
    <>
      <ArticleJsonLd article={article} />
      <div
        className="min-h-screen bg-white selection:bg-[#C9A050]/30 selection:text-[#8B1832]"
        style={fontFamily ? { fontFamily } : undefined}
      >
        <article className="min-h-screen">
          {/* Breadcrumb & Meta - Compact */}
          <div className="border-b border-gray-200/40 pt-6 pb-6 mb-6">
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <Link href="/" className="hover:text-[#8B1832] cursor-pointer transition-colors">
                  Trang chủ
                </Link>
                <ChevronRight className="h-3 w-3 text-[#C9A050]" />
                <Link href="/bai-viet" className="hover:text-[#8B1832] cursor-pointer transition-colors">
                  Bài viết
                </Link>
                <ChevronRight className="h-3 w-3 text-[#C9A050]" />
                <span className="text-[#C9A050] font-medium truncate max-w-[300px]">
                  {article.title}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1C1C1C] leading-tight mb-4">
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
                prose-headings:text-[#8B1832]
                prose-a:text-[#C9A050] prose-a:no-underline hover:prose-a:underline
                prose-p:leading-relaxed prose-p:mb-4
                prose-headings:mt-8 prose-headings:mb-4
                prose-li:marker:text-[#C9A050]
                prose-blockquote:border-l-[#C9A050] prose-blockquote:bg-gray-50/50 prose-blockquote:py-2 prose-blockquote:pr-4
                prose-img:rounded-xl prose-img:shadow-sm
            "
              style={fontFamily ? { fontFamily } : undefined}
            >
              {/* Excerpt as lead paragraph */}
              {article.excerpt && (
                <p className="lead text-xl text-gray-700 italic mb-6 border-l-2 border-[#C9A050]/50 pl-4">
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
                <>
                  <div
                    className="article-rich-content"
                    dangerouslySetInnerHTML={{ __html: processedContent }}
                  />
                  <style jsx>{articleRichContentStyles}</style>
                </>
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
                  <span className="font-bold text-2xl text-[#8B1832] block mb-2">
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
          <div className="container mx-auto px-4 md:px-6 max-w-7xl border-t border-gray-200 pt-8 mt-12 pb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gray-200" />
              <h2 className="text-2xl md:text-3xl font-bold text-[#8B1832] shrink-0">
                Bài viết liên quan
              </h2>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <RelatedArticles articles={article.related_articles} />
          </div>
        )}
      </div>
    </>
  );
}

const articleRichContentStyles = `
  .article-rich-content h1,
  .article-rich-content .editor-heading-h1 {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.01em;
    overflow-wrap: anywhere;
    word-break: break-word;
    margin: 0 0 16px 0;
    color: #8b1832;
  }

  @media (max-width: 767px) {
    .article-rich-content h1,
    .article-rich-content .editor-heading-h1 {
      font-size: 24px;
      line-height: 1.35;
      margin-bottom: 14px;
    }
  }

  .article-rich-content h2,
  .article-rich-content .editor-heading-h2 {
    font-size: 22px;
    font-weight: 600;
    margin: 20px 0 12px 0;
    color: #8b1832;
  }

  .article-rich-content h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 16px 0 10px 0;
    color: #8b1832;
  }

  .article-rich-content p,
  .article-rich-content .editor-paragraph {
    margin: 0 0 12px 0;
    line-height: 1.7;
  }

  .article-rich-content strong {
    color: #1f2937;
    font-weight: 600;
  }

  .article-rich-content em {
    font-style: italic;
  }

  .article-rich-content u {
    text-decoration: underline;
  }

  .article-rich-content a {
    color: #c9a050;
    text-decoration: none;
  }

  .article-rich-content a:hover {
    text-decoration: underline;
  }

  .article-rich-content blockquote {
    border-left: 4px solid #c9a050;
    padding: 8px 16px;
    color: #64748b;
    font-style: italic;
    margin: 12px 0;
    background: rgb(249 250 251 / 50%);
  }

  .article-rich-content ul,
  .article-rich-content .editor-list-ul {
    list-style-type: disc;
    padding-left: 24px;
    margin: 12px 0;
  }

  .article-rich-content ol,
  .article-rich-content .editor-list-ol {
    list-style-type: decimal;
    padding-left: 24px;
    margin: 12px 0;
  }

  .article-rich-content li,
  .article-rich-content .editor-listitem {
    margin: 6px 0;
  }

  .article-rich-content li::marker {
    color: #c9a050;
  }

  .article-rich-content img {
    border-radius: 0.75rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }
`;
