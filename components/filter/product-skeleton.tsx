import { Card, CardContent } from "@/components/ui/card"

export function ProductSkeleton() {
  return (
    <Card className="border border-[#F1E5D5] bg-white shadow-none h-full flex flex-col rounded-lg animate-pulse">
      <CardContent className="flex flex-col gap-2 p-2 sm:p-3 flex-grow">
        <div className="flex flex-col gap-1 sm:flex-row">
          {/* Image skeleton */}
          <div className="flex flex-col items-center gap-1 sm:min-w-[180px]">
            <div className="relative h-57 w-29 sm:h-72 sm:w-36 bg-gray-200 rounded" />
          </div>

          {/* Meta info skeleton */}
          <div className="flex-1 flex flex-col justify-center gap-1.5">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>

        {/* Title and price skeleton */}
        <div className="flex flex-col gap-1 pt-1 border-t border-[#F1E5D5] flex-grow">
          <div className="h-6 bg-gray-200 rounded w-full" />
          <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto" />
          
          <div className="flex flex-col items-center sm:flex-row sm:items-center justify-between gap-1 w-full mt-2">
            <div className="h-6 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
