"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { ArticleListResponse } from "@/lib/api/articles";

interface ArticleListPageProps {
  data: ArticleListResponse;
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

const truncateExcerpt = (text: string | null, maxLength: number = 150): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

export default function ArticleListPage({ data }: ArticleListPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pagination } = data.meta;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/bai-viet?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#9B2C3B] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Bài viết</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Khám phá kiến thức chuyên sâu về rượu vang, cocktail và nghệ thuật thưởng
            thức từ các chuyên gia
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="container mx-auto px-4 py-12">
        {data.data.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">Chưa có bài viết nào.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {data.data.map((article) => (
                <Card
                  key={article.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader className="p-0">
                    <Link href={`/bai-viet/${article.slug}`}>
                      <div className="relative aspect-video bg-gray-200">
                        <Image
                          src={article.cover_image_url || "/placeholder/article.svg"}
                          alt={article.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          loading="lazy"
                        />
                      </div>
                    </Link>
                  </CardHeader>

                  <CardContent className="p-6">
                    <Link
                      href={`/bai-viet/${article.slug}`}
                      className="block group"
                    >
                      <h2 className="text-xl font-bold text-[#1C1C1C] mb-3 line-clamp-2 group-hover:text-[#9B2C3B] transition-colors">
                        {article.title}
                      </h2>
                    </Link>

                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {truncateExcerpt(article.excerpt)}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <time dateTime={article.published_at}>
                        {formatDate(article.published_at)}
                      </time>
                    </div>
                  </CardContent>

                  <CardFooter className="px-6 pb-6 pt-0">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-[#9B2C3B] text-[#9B2C3B] hover:bg-[#9B2C3B] hover:text-white"
                    >
                      <Link href={`/bai-viet/${article.slug}`}>Đọc thêm</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(
                    (pageNum) => {
                      const isCurrent = pageNum === pagination.page;
                      const showPage =
                        pageNum === 1 ||
                        pageNum === pagination.last_page ||
                        (pageNum >= pagination.page - 1 &&
                          pageNum <= pagination.page + 1);

                      if (!showPage) {
                        if (
                          pageNum === pagination.page - 2 ||
                          pageNum === pagination.page + 2
                        ) {
                          return (
                            <span key={pageNum} className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={isCurrent ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={
                            isCurrent
                              ? "bg-[#9B2C3B] hover:bg-[#7A2230]"
                              : "hover:bg-gray-100"
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  disabled={pagination.page === pagination.last_page}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Pagination Info */}
            <div className="text-center mt-6 text-sm text-gray-600">
              Hiển thị {data.data.length} trong tổng số {pagination.total} bài viết
            </div>
          </>
        )}
      </div>
    </div>
  );
}
