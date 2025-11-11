import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { RelatedArticle } from "@/lib/api/articles";

interface RelatedArticlesProps {
  articles: RelatedArticle[];
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
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
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1C1C1C] mb-8">
            Bài viết liên quan
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/bai-viet/${article.slug}`}
                className="group block"
              >
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video">
                    <Image
                      src={article.cover_image_url || "/placeholder/article.svg"}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg text-[#1C1C1C] mb-2 group-hover:text-[#9B2C3B] transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    {article.excerpt && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <time dateTime={article.published_at}>
                        {formatDate(article.published_at)}
                      </time>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
