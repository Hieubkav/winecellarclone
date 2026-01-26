export default function FilterLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-gray-200" />
        
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filter sidebar skeleton */}
          <aside className="w-full lg:w-64">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="mb-3 h-5 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-4 w-full animate-pulse rounded bg-gray-100" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Product grid skeleton */}
          <main className="flex-1">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="mb-4 aspect-square w-full animate-pulse rounded bg-gray-200" />
                  <div className="mb-2 h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
