import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import type { RelatedArticle } from "@/lib/api/articles";
import { getImageUrl } from "@/lib/utils/article-content";

interface RelatedArticlesProps {
  articles: RelatedArticle[];
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

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/bai-viet/${article.slug}`}
          className="group block h-full flex flex-col p-4 -mx-4 rounded-xl hover:bg-gray-50/50 transition-all duration-300 border border-transparent hover:border-[#C9A050]/30"
        >
          <div className="relative overflow-hidden rounded-lg aspect-[4/3] mb-4 bg-gray-100 shadow-sm">
            <Image
              src={getImageUrl(article.cover_image_url)}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
            />
          </div>
          <h3 className="text-xl font-serif font-bold mb-3 group-hover:text-[#8B1832] transition-colors line-clamp-2">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow font-light">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-4 border-t border-gray-200/50 group-hover:border-[#C9A050]/20">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1.5 text-[#C9A050]" />
              <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
            </div>
            <span className="text-[#C9A050] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-medium">
              Đọc thêm <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
