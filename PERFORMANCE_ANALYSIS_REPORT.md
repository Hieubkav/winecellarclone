# Performance Analysis Report - Filter Page

**Date**: 2025-11-12
**Page**: http://localhost:3000/filter
**Analysis Tool**: Playwright + Browser DevTools

---

## 🔍 Executive Summary

The filter page is loading in **5.66 seconds**, which is significantly slow. The main bottlenecks are:
1. Sequential API calls creating waterfall effects
2. Aggressive infinite scroll pre-loading
3. High backend response times (TTFB: 304ms)
4. No caching strategy
5. Sequential image loading

---

## 📊 Performance Metrics

| Metric | Value | Status |
|--------|-------|--------|
| **Total Load Time** | 5.66s | ❌ Poor (should be <2s) |
| **Time to First Byte (TTFB)** | 304.70ms | ⚠️ High (should be <200ms) |
| **First Paint** | 752ms | ⚠️ OK |
| **First Contentful Paint** | 752ms | ⚠️ OK |
| **DOM Interactive** | 607ms | ✅ Good |
| **DOM Complete** | 927ms | ⚠️ OK |
| **Total Requests** | 36+ | ⚠️ High |
| **Total Downloaded** | 0.16MB (initial) | ✅ Good |

---

## 🐌 Key Bottlenecks Identified

### 1. **Sequential API Call Waterfall**

**Issue**: Three separate API calls happen in sequence:
```
1. Page Load → initialize()
   ↓
2. fetchProductFilters() → GET /api/v1/san-pham/filters/options
   ↓
3. useFilterUrlSync triggers
   ↓
4. fetchProducts() → GET /api/v1/san-pham?page=1...
   ↓
5. Infinite scroll triggers immediately
   ↓
6. fetchProducts() → GET /api/v1/san-pham?page=2...
```

**Impact**: Each step waits for the previous one, adding cumulative delays.

**Evidence from code**:
- `store.ts:379-399`: `initialize()` fetches filter options first
- `use-filter-url-sync.ts:132-137`: After initialization, URL sync triggers product fetch
- `product-list.tsx:81-97`: Infinite scroll observer with 600px pre-load margin

---

### 2. **Aggressive Infinite Scroll Pre-loading**

**Issue**: The infinite scroll has `rootMargin: "600px 0px"` which means page 2 loads when user is 600px away from bottom.

**Location**: `components/filter/product-list.tsx:88`
```typescript
const observer = new IntersectionObserver(
  (entries) => {
    const [entry] = entries
    if (entry.isIntersecting) {
      requestMore()
    }
  },
  { rootMargin: "600px 0px" }, // ← TOO AGGRESSIVE
)
```

**Impact**: 
- Page 2 loads immediately after page 1, even if user hasn't scrolled
- Doubles the initial load time
- Wastes bandwidth for users who don't scroll

---

### 3. **High Backend Response Time (TTFB)**

**Issue**: Backend takes 304ms to respond to initial request.

**API Calls Observed**:
- `GET /api/v1/san-pham/filters/options` - No timing data (likely slow)
- `GET /api/v1/san-pham?page=1&per_page=24&sort=name&price_min=200363&price_max=10000000` - No timing data

**Potential Causes**:
- Complex database queries without indexing
- No query result caching
- No HTTP caching headers (ETag, Cache-Control)
- Heavy aggregations for filter options

---

### 4. **No Caching Strategy**

**Issue**: Every filter change triggers a full API call.

**Evidence**:
- `store.ts:422-443`: `fetchProducts()` makes API call on every filter change
- No client-side caching of results
- No HTTP caching (no Cache-Control, ETag headers)
- Filter options fetched on every page load

**Impact**:
- Repeated identical API calls
- Server load increases unnecessarily
- Poor user experience when toggling filters

---

### 5. **Sequential Image Loading**

**Issue**: Product images load one by one after API response.

**Observed**:
```
← 200 product_69140e52e46b7.webp (27.29KB)
← 200 product_69140eed682bc.webp (71.50KB)
← 200 product_69140c955f24b.webp (43.37KB)
← 200 product_69140ecab78ba.webp (9.41KB)
...
```

**Current Implementation**:
- No lazy loading for below-the-fold images
- No progressive image loading
- No image preloading hints
- `priority={index < 4}` only on first 4 images

---

## 🎯 Recommended Optimizations

### Priority 1: High Impact, Quick Wins

#### 1.1. **Reduce Infinite Scroll Pre-load Margin**
**File**: `components/filter/product-list.tsx:88`
```typescript
// BEFORE
{ rootMargin: "600px 0px" }

// AFTER
{ rootMargin: "100px 0px" } // or "200px 0px"
```
**Expected Impact**: Prevents page 2 from loading immediately, reducing initial load time by ~30-40%

---

#### 1.2. **Add React Query for Caching**
**Install**: `npm install @tanstack/react-query`

**Benefits**:
- Automatic request deduplication
- Client-side caching
- Background refetching
- Optimistic updates

**Implementation**:
```typescript
// lib/api/client.ts - Add QueryClient provider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

// In store.ts - Use React Query
const { data, isLoading } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => fetchProductList(buildQueryParams(filters)),
  keepPreviousData: true, // Smooth transitions
})
```

**Expected Impact**: 
- 50-70% reduction in repeated API calls
- Instant filter changes for cached results
- Better UX with stale-while-revalidate

---

#### 1.3. **Implement Debounced Search**
**File**: `components/filter/product-list.tsx`

Currently search triggers immediately on every keystroke. Add debouncing:

```typescript
import { useDebouncedValue } from '@/hooks/use-debounced-value'

// In component
const debouncedSearch = useDebouncedValue(filters.searchQuery, 300)

useEffect(() => {
  if (debouncedSearch !== filters.searchQuery) {
    setSearchQuery(debouncedSearch)
  }
}, [debouncedSearch])
```

**Expected Impact**: Reduces API calls during typing by 80%

---

### Priority 2: Backend Optimizations

#### 2.1. **Add Database Indexes**
Ensure indexes exist on:
- `products.price`
- `products.alcohol_percent`
- `products.name`
- Foreign keys for joins

#### 2.2. **Implement Query Result Caching**
```php
// Laravel Backend
public function index(Request $request)
{
    $cacheKey = 'products:' . md5(json_encode($request->all()));
    
    return Cache::remember($cacheKey, 300, function () use ($request) {
        return Product::with(['brand', 'country', 'type'])
            ->filters($request)
            ->paginate(24);
    });
}
```

#### 2.3. **Add HTTP Caching Headers**
```php
return response()->json($data)
    ->header('Cache-Control', 'public, max-age=300')
    ->header('ETag', md5(json_encode($data)));
```

**Expected Impact**: 
- TTFB reduction from 304ms to <100ms
- Reduced database load
- Better CDN caching

---

### Priority 3: Advanced Optimizations

#### 3.1. **Implement Parallel API Calls**
Fetch filter options and initial products simultaneously:

```typescript
// In initialize()
const [filtersData, productsData] = await Promise.all([
  fetchProductFilters(),
  fetchProductList({ page: 1, per_page: 24 }),
])
```

**Expected Impact**: Reduces waterfall, saves 300-500ms

---

#### 3.2. **Add Optimistic UI Updates**
Show filter changes immediately, update in background:

```typescript
// When filter changes
set({ wines: applyFiltersLocally(wines, newFilter) }) // Instant
await fetchProducts() // Background update
```

---

#### 3.3. **Implement Virtual Scrolling**
For large product lists, use `react-virtual`:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

const virtualizer = useVirtualizer({
  count: wines.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 400, // Product card height
})
```

**Expected Impact**: Smooth scrolling with 1000+ products

---

#### 3.4. **Add Image Optimization**
```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src={wine.image}
  alt={wine.name}
  width={300}
  height={400}
  loading={index < 6 ? 'eager' : 'lazy'}
  placeholder="blur"
  blurDataURL={wine.thumbnailBase64}
/>
```

---

#### 3.5. **Implement Request Batching**
When multiple filters change in quick succession, batch into single request:

```typescript
const debouncedFetch = useDebouncedCallback(() => {
  fetchProducts()
}, 150)
```

---

## 📈 Expected Results After Optimizations

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Total Load Time | 5.66s | 1.5-2s | 65-70% |
| TTFB | 304ms | <100ms | 67% |
| API Calls on Load | 3+ | 1-2 | 50% |
| Repeated API Calls | High | Low | 80% |

---

## 🚀 Implementation Priority

### Phase 1 (Quick Wins - 1 day)
1. ✅ Reduce infinite scroll margin (5 min)
2. ✅ Add debounced search (15 min)
3. ✅ Add backend caching (2 hours)
4. ✅ Add HTTP caching headers (30 min)

**Expected Impact**: 40-50% improvement

---

### Phase 2 (Medium Effort - 2-3 days)
1. ✅ Implement React Query (4 hours)
2. ✅ Parallel API calls (1 hour)
3. ✅ Database indexes (2 hours)
4. ✅ Optimistic UI updates (3 hours)

**Expected Impact**: 60-70% improvement

---

### Phase 3 (Advanced - 1 week)
1. ✅ Virtual scrolling (6 hours)
2. ✅ Advanced image optimization (4 hours)
3. ✅ Request batching (3 hours)
4. ✅ CDN for static assets (2 hours)

**Expected Impact**: 70-80% improvement

---

## 🔧 Monitoring & Validation

After implementing optimizations, measure:
1. Core Web Vitals (LCP, FID, CLS)
2. API response times
3. Cache hit rates
4. User engagement metrics (bounce rate, time on page)

**Tools**:
- Lighthouse CI
- Google Analytics
- Backend APM (Laravel Telescope)
- Real User Monitoring (RUM)

---

## 📝 Notes

- Performance analysis run in development mode with Turbopack HMR
- Production build will be faster due to optimizations
- Backend running on `localhost:8000` (Laravel)
- Frontend on `localhost:3000` (Next.js 16)

---

**Analysis performed by**: Droid AI (Factory)
**Report generated**: 2025-11-12
