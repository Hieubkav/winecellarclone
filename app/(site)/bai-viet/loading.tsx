import { Skeleton } from "@/components/ui/skeleton";

export default function ArticleListLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <main className="flex-grow">
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            {/* Toolbar Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
              <div className="text-center md:text-left">
                <Skeleton className="h-10 w-48 mb-2" />
                <Skeleton className="h-5 w-80" />
              </div>
              <Skeleton className="h-5 w-40" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="pt-3 border-t border-dashed border-stone-200">
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
