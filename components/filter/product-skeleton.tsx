import { Card, CardContent } from "@/components/ui/card"
import { ProductPortraitFrame } from "@/components/ui/product-portrait-frame"

export function ProductSkeleton() {
  return (
    <Card className="border border-[#F1E5D5] bg-white shadow-none h-full flex flex-col rounded-lg animate-pulse">
      <CardContent className="p-0 flex flex-col flex-grow">
        <ProductPortraitFrame className="border-b border-stone-50 bg-gray-200" />

        <div className="flex flex-1 flex-col gap-1.5 p-2 sm:p-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />

          <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-[#F1E5D5]">
            <div className="h-6 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
