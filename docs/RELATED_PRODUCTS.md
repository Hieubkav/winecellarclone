# Related Products Implementation Guide

## Tình trạng hiện tại

❌ **Chưa có API endpoint** cho sản phẩm liên quan
✅ **Frontend đã sẵn sàng** - chỉ cần thêm component khi có API

## Backend cần làm

### 1. Tạo API endpoint

**File:** `app/Services/Api/V1/Products/ProductDetailService.php`

Thêm logic tìm sản phẩm liên quan:

```php
protected function getRelatedProducts(Product $product, int $limit = 8): Collection
{
    // Strategy 1: Same brand + same category
    $related = Product::query()
        ->where('id', '!=', $product->id)
        ->where('active', true)
        ->where(function ($query) use ($product) {
            // Same brand
            if ($product->brand_term_id) {
                $query->where('brand_term_id', $product->brand_term_id);
            }
            
            // OR same category
            if ($product->product_categories()->exists()) {
                $categoryIds = $product->product_categories()->pluck('category_id');
                $query->orWhereHas('product_categories', function ($q) use ($categoryIds) {
                    $q->whereIn('category_id', $categoryIds);
                });
            }
        })
        ->limit($limit)
        ->get();

    // Strategy 2: If not enough, add products in similar price range
    if ($related->count() < $limit && $product->price) {
        $priceMin = $product->price * 0.7; // -30%
        $priceMax = $product->price * 1.3; // +30%
        
        $additional = Product::query()
            ->where('id', '!=', $product->id)
            ->where('active', true)
            ->whereBetween('price', [$priceMin, $priceMax])
            ->whereNotIn('id', $related->pluck('id'))
            ->limit($limit - $related->count())
            ->get();
        
        $related = $related->merge($additional);
    }

    return $related;
}
```

### 2. Thêm vào ProductDetail response

```php
public function show(string $slug): array
{
    $product = Product::where('slug', $slug)
        ->where('active', true)
        ->firstOrFail();

    $related = $this->getRelatedProducts($product);

    return [
        'data' => [
            // ... existing fields
            'related_products' => $related->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'price' => $p->price,
                'original_price' => $p->original_price,
                'discount_percent' => $p->discount_percent,
                'show_contact_cta' => $p->should_show_contact_cta,
                'cover_image_url' => $p->cover_image_url,
            ]),
        ],
    ];
}
```

## Frontend cần làm

### 1. Update TypeScript interface

**File:** `lib/api/products.ts`

```typescript
export interface ProductDetail {
  // ... existing fields
  related_products?: ProductListItem[]; // Add this
}
```

### 2. Tạo RelatedProducts component

**File:** `components/products/RelatedProducts.tsx`

```tsx
import Link from "next/link";
import { ProductCard } from "@/components/filter/product-card";
import type { ProductListItem } from "@/lib/api/products";

interface RelatedProductsProps {
  products: ProductListItem[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1C1C1C] mb-8 text-center">
            Sản phẩm liên quan
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

### 3. Thêm vào ProductDetailPage

**File:** `components/products/productDetailPage.tsx`

```tsx
import RelatedProducts from "./RelatedProducts";

export default function ProductDetailPage({ product }: ProductDetailPageProps) {
  // ... existing code

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-8">
      {/* ... existing sections */}

      {/* Related Products - Replace TODO comment */}
      {product.related_products && product.related_products.length > 0 && (
        <RelatedProducts products={product.related_products} />
      )}
    </div>
  );
}
```

## Testing

### Backend test:
```bash
curl http://127.0.0.1:8000/api/v1/products/ruou-vang-argentina-salentein-single-vineyard-malbec-2018
```

Kiểm tra có field `related_products` không.

### Frontend test:
1. Vào http://localhost:3000/san-pham/[any-slug]
2. Scroll xuống cuối trang
3. Nên thấy section "Sản phẩm liên quan" với grid 4 cột

## Related Files

**Frontend:**
- `components/products/productDetailPage.tsx` (line 289-291 - TODO comment)
- `lib/api/products.ts` (ProductDetail interface)
- `lib/utils/article-content.ts` (processProductContent helper)

**Backend:**
- `app/Services/Api/V1/Products/ProductDetailService.php`
- `app/Http/Controllers/Api/V1/ProductController.php`

## Priority

**Medium** - Nice to have feature, không blocking

**Estimated time:** 2-3 hours
- Backend: 1.5 hours (logic + testing)
- Frontend: 1 hour (component + integration)

---

**Status:** 📝 Planned (waiting for backend API)
**Created:** 2025-11-12
