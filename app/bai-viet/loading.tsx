import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function ArticleListLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Skeleton */}
      <div className="bg-[#9B2C3B] text-white py-16">
        <div className="container mx-auto px-4">
          <Skeleton className="h-12 w-64 mb-4 bg-white/20" />
          <Skeleton className="h-6 w-96 bg-white/20" />
        </div>
      </div>

      {/* Articles Grid Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="p-0">
                <Skeleton className="aspect-video w-full" />
              </CardHeader>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-full mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
              <CardFooter className="px-6 pb-6 pt-0">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
