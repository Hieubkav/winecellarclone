"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ArticleJsonLd from "./ArticleJsonLd";
import RelatedArticles from "./RelatedArticles";
import type { ArticleDetail } from "@/lib/api/articles";
import { processArticleContent } from "@/lib/utils/article-content";

interface ArticleDetailPageProps {
  article: ArticleDetail;
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
};

export default function ArticleDetailPage({ article }: ArticleDetailPageProps) {
  const coverImage = article.cover_image_url || "/placeholder/article.svg";
  const processedContent = processArticleContent(article.content);

  return (
    <>
      <ArticleJsonLd article={article} />
      <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <div className="container mx-auto px-4 py-6">
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/bai-viet">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>

      {/* Article Header */}
      <article className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-[#1C1C1C] mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8">
            {article.author && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{article.author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={article.published_at}>
                {formatDate(article.published_at)}
              </time>
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Cover Image */}
          <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={coverImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>

          {/* Excerpt */}
          {article.excerpt && (
            <div className="text-lg text-gray-700 mb-8 leading-relaxed font-medium">
              {article.excerpt}
            </div>
          )}

          {/* Content */}
          {processedContent && (
            <div
              className="prose prose-lg max-w-none
                prose-headings:text-[#1C1C1C] prose-headings:font-bold
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-[#9B2C3B] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-[#1C1C1C] prose-strong:font-semibold
                prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
                prose-li:text-gray-700 prose-li:mb-2
                prose-blockquote:border-l-4 prose-blockquote:border-[#9B2C3B] 
                prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-600
                prose-img:rounded-lg prose-img:shadow-md
              "
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
          )}

          {/* Gallery - Only show if more than 1 image (first image is cover) */}
          {article.gallery && article.gallery.length > 1 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-[#1C1C1C] mb-6">Hình ảnh</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {article.gallery.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-video rounded-lg overflow-hidden bg-gray-100"
                  >
                    <Image
                      src={image.url || "/placeholder/article.svg"}
                      alt={image.alt || article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Related Articles */}
      {article.related_articles && article.related_articles.length > 0 && (
        <RelatedArticles articles={article.related_articles} />
      )}

      {/* Footer CTA */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-[#1C1C1C] mb-4">
              Khám phá thêm bài viết
            </h2>
            <p className="text-gray-600 mb-6">
              Tìm hiểu thêm về rượu vang, cocktail và nghệ thuật thưởng thức
            </p>
            <Button asChild size="lg" className="bg-[#9B2C3B] hover:bg-[#7A2230]">
              <Link href="/bai-viet">Xem tất cả bài viết</Link>
            </Button>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
