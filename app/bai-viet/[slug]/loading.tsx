import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function ArticleDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation Skeleton */}
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Article Header Skeleton */}
      <article className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Title Skeleton */}
          <Skeleton className="h-12 w-full mb-3" />
          <Skeleton className="h-12 w-3/4 mb-6" />

          {/* Meta Info Skeleton */}
          <div className="flex flex-wrap items-center gap-6 mb-8">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-40" />
          </div>

          <Separator className="mb-8" />

          {/* Cover Image Skeleton */}
          <Skeleton className="w-full aspect-video mb-8 rounded-lg" />

          {/* Excerpt Skeleton */}
          <div className="mb-8 space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </div>

          {/* Content Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="py-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </article>
    </div>
  );
}
