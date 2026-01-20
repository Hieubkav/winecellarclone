export default function Loading() {
  return (
    <div className="bg-white text-[#1C1C1C]">
      <div className="mx-auto flex flex-col gap-10 px-4 py-8 lg:flex-row lg:py-12">
        <aside className="hidden w-full max-w-[300px] space-y-6 lg:block">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </aside>

        <main className="flex-1">
          <div className="mb-4 flex flex-col gap-4 sm:mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-4 sm:flex-none">
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          <div className="grid gap-6 grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
