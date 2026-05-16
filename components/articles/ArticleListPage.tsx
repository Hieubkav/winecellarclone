"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar, ArrowRight, ChevronDown, BookOpen, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ArticleCategory, ArticleListResponse } from "@/lib/api/articles";
import { cn } from "@/lib/utils";
import { getArticleImageUrl } from "@/lib/utils/image";
import { getArticlePublicHref } from "@/lib/articles/routes";

const SORT_OPTIONS = [
  { value: "-created_at", label: "Mới nhất" },
  { value: "created_at", label: "Cũ nhất" },
  { value: "title", label: "Tiêu đề A-Z" },
  { value: "-title", label: "Tiêu đề Z-A" },
];

interface ArticleListPageProps {
  data: ArticleListResponse;
  categories?: ArticleCategory[];
  activeCategorySlug?: string;
  fontFamily?: string;
  title?: string;
  description?: string;
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

interface BlogCardProps {
  article: {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image_url: string | null;
    cover_image_canonical_url?: string | null;
    category_key?: string | null;
    category_slug?: string | null;
    article_category?: { slug?: string | null } | null;
    published_at: string;
  };
  index: number;
}

function ArticleImagePlaceholder({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_top_left,_#fff7ed,_#f5efe5_38%,_#eadfce_100%)]">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#D4A84B]/20 blur-2xl" />
      <div className="absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-[#9B2C3B]/15 blur-2xl" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/70 bg-white/75 shadow-sm backdrop-blur">
          <BookOpen className="h-7 w-7 text-[#9B2C3B]" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D4A84B]">Thiên Kim Wine</p>
          <p className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-stone-700">{title}</p>
        </div>
      </div>
    </div>
  );
}

function BlogCard({ article, index }: BlogCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const articleHref = getArticlePublicHref(article);
  const coverImageUrl = getArticleImageUrl(article.cover_image_canonical_url || article.cover_image_url);
  const hasCoverImage = Boolean(article.cover_image_canonical_url || article.cover_image_url);

  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="group overflow-hidden border-none bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full rounded-xl">
        {/* Image Container */}
        <Link href={articleHref} className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
            {!hasCoverImage ? (
              <ArticleImagePlaceholder title={article.title} />
            ) : !isImageLoaded ? (
              <Skeleton className="absolute inset-0 w-full h-full" />
            ) : null}
            {hasCoverImage && (
              <Image
                src={coverImageUrl}
                alt={article.title}
                fill
                onLoad={() => setIsImageLoaded(true)}
                className={cn(
                  "object-cover transition-transform duration-700 group-hover:scale-105",
                  isImageLoaded ? "opacity-100" : "opacity-0"
                )}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
              />
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex flex-col flex-grow p-4">
          {/* Meta Info */}
          <div className="flex items-center gap-2 text-[11px] font-medium text-stone-500 mb-2 uppercase tracking-wider">
            <Calendar className="w-3 h-3 text-[#D4A84B]" />
            <time dateTime={article.published_at}>
              {formatDate(article.published_at)}
            </time>
          </div>

          {/* Title */}
          <Link href={articleHref} className="block">
            <h3 className="text-lg font-bold leading-snug mb-2 group-hover:text-[#9B2C3B] transition-colors line-clamp-2">
              {article.title}
            </h3>
          </Link>

          {/* Excerpt */}
          <p className="text-stone-500 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
            {article.excerpt || ""}
          </p>

          {/* Footer Action */}
          <div className="mt-auto pt-3 border-t border-dashed border-stone-200">
            <Link
              href={articleHref}
              className="w-full flex items-center justify-between text-[#9B2C3B] font-semibold text-xs uppercase tracking-widest group/btn hover:opacity-80 transition-opacity"
            >
              <span>Đọc tiếp</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ArticleListPage({
  data,
  categories = [],
  activeCategorySlug,
  fontFamily,
  title = "Bài viết",
  description = "Tin tức, kiến thức và xu hướng mới nhất"
}: ArticleListPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { pagination } = data.meta;
  const currentSort = searchParams.get("sort") || "-created_at";
  const currentCategorySlug = activeCategorySlug || searchParams.get("category_slug") || searchParams.get("category") || "";
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const currentSortLabel = SORT_OPTIONS.find(opt => opt.value === currentSort)?.label || "Mới nhất";
  const visibleCategories = categories.filter((category) => (category.articles_count ?? 0) > 0);
  const currentCategoryLabel = visibleCategories.find((category) => category.slug === currentCategorySlug)?.name || "Tất cả";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sortValue);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
    setIsDropdownOpen(false);
  };

  const handleCategoryChange = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("category");

    if (categorySlug) {
      params.set("category_slug", categorySlug);
    } else {
      params.delete("category_slug");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    setIsCategoryDropdownOpen(false);
  };

  const handleLoadMore = () => {
    if (pagination.has_more) {
      handlePageChange(pagination.page + 1);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-stone-50 selection:bg-[#9B2C3B]/20 selection:text-[#9B2C3B]"
      style={fontFamily ? { fontFamily } : undefined}
    >
      <main className="flex-grow">
        {/* Content Section */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-2">
                  {title}
                </h1>
                <p className="text-stone-500 text-sm md:text-base">
                  {description}
                </p>
              </div>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-sm text-stone-600 bg-white border border-stone-200 rounded-full px-4 py-2 hover:bg-stone-50 transition-colors"
                >
                  <span>Sắp xếp: <span className="font-semibold text-stone-800">{currentSortLabel}</span></span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isDropdownOpen && "rotate-180")} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-lg z-10 overflow-hidden">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-sm hover:bg-stone-50 transition-colors",
                          currentSort === option.value 
                            ? "text-[#9B2C3B] font-semibold bg-[#9B2C3B]/5" 
                            : "text-stone-600"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {visibleCategories.length > 0 && (
              <div className="mb-8 flex justify-start">
                <div className="relative" ref={categoryDropdownRef}>
                  <button
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="flex min-w-[220px] items-center justify-between gap-3 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 shadow-sm transition-colors hover:bg-stone-50"
                  >
                    <span className="flex items-center gap-2">
                      <Tags className="h-4 w-4 text-[#D4A84B]" />
                      <span>Danh mục: <span className="font-semibold text-stone-800">{currentCategoryLabel}</span></span>
                    </span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isCategoryDropdownOpen && "rotate-180")} />
                  </button>

                  {isCategoryDropdownOpen && (
                    <div className="absolute left-0 top-full z-10 mt-2 w-64 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
                      <button
                        onClick={() => handleCategoryChange("")}
                        className={cn(
                          "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-stone-50",
                          !currentCategorySlug ? "bg-[#9B2C3B]/5 font-semibold text-[#9B2C3B]" : "text-stone-600"
                        )}
                      >
                        <span>Tất cả</span>
                      </button>
                      {visibleCategories.map((category) => (
                        <button
                          key={category.slug}
                          onClick={() => handleCategoryChange(category.slug)}
                          className={cn(
                            "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-stone-50",
                            currentCategorySlug === category.slug
                              ? "bg-[#9B2C3B]/5 font-semibold text-[#9B2C3B]"
                              : "text-stone-600"
                          )}
                        >
                          <span>{category.name}</span>
                          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">
                            {category.articles_count}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Grid */}
            {data.data.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-stone-600 text-lg">Chưa có bài viết nào.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                  {data.data.map((article, index) => (
                    <BlogCard key={article.id} article={article} index={index} />
                  ))}
                </div>

                {/* Pagination / Load More */}
                <div className="mt-16 text-center">
                  {pagination.has_more ? (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleLoadMore}
                      className="min-w-[200px] border-[#9B2C3B]/20 text-[#9B2C3B] hover:bg-[#9B2C3B]/5 rounded-full"
                    >
                      Xem thêm bài viết
                    </Button>
                  ) : pagination.last_page > 1 ? (
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {Array.from(
                        { length: pagination.last_page },
                        (_, i) => i + 1
                      ).map((pageNum) => {
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
                              <span key={pageNum} className="px-2 text-stone-400">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm font-medium transition-all",
                              isCurrent
                                ? "bg-[#9B2C3B] text-white shadow-md"
                                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-100"
                            )}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                  <p className="mt-4 text-xs text-stone-500">
                    Hiển thị {data.data.length} trong tổng số {pagination.total} bài
                    viết
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
