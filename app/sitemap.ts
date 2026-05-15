import { MetadataRoute } from 'next'
import { fetchProductListSafe, fetchProductFiltersSafe } from '@/lib/api/products'
import { fetchArticleListSafe } from '@/lib/api/articles'
import { IA_STATIC_PATHS } from '@/lib/ia/route-registry'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thienkimwine.vn'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITEMAP_BATCH_SIZE = 100
  const ARTICLE_SITEMAP_BATCH_SIZE = 50

  // Static pages
  const [productTypes, productsResponse] = await Promise.all([
    fetchProductFiltersSafe(),
    fetchProductListSafe({
      page: 1,
      per_page: SITEMAP_BATCH_SIZE,
    }),
  ])

  const typePages: MetadataRoute.Sitemap = (productTypes?.types ?? []).map((type) => ({
    url: `${SITE_URL}/san-pham/${type.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  const categoryPages: MetadataRoute.Sitemap = (productTypes?.categories ?? [])
    .filter((category) => category.slug)
    .flatMap((category) => {
      const matchedType = (productTypes?.types ?? []).find((type) => type.id === category.type_id)
      return matchedType ? [{
        url: `${SITE_URL}/san-pham/${matchedType.slug}/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.85,
      }] : []
    })

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/san-pham`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...typePages,
    ...categoryPages,
    {
      url: `${SITE_URL}/lien-he`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...IA_STATIC_PATHS.map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: slug.includes('/') ? 0.6 : 0.7,
    })),
  ]

  const totalProducts = productsResponse?.meta.total ?? productsResponse?.data.length ?? 0
  const productLastPage = productsResponse
    ? Math.max(Math.ceil(totalProducts / productsResponse.meta.per_page), 1)
    : 0
  const remainingProductRequests = productsResponse && productLastPage > 1
    ? Array.from({ length: productLastPage - 1 }, (_, index) =>
        fetchProductListSafe({
          page: index + 2,
          per_page: SITEMAP_BATCH_SIZE,
        })
      )
    : []
  const remainingProductResponses = remainingProductRequests.length > 0
    ? await Promise.all(remainingProductRequests)
    : []
  const allProducts = productsResponse
    ? [
        ...productsResponse.data,
        ...remainingProductResponses.flatMap((response) => response?.data ?? []),
      ]
    : []

  const productPages: MetadataRoute.Sitemap = allProducts.map((product) => ({
    url: `${SITE_URL}/san-pham/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const firstArticlesResponse = await fetchArticleListSafe({
    page: 1,
    per_page: ARTICLE_SITEMAP_BATCH_SIZE,
  })

  if (!firstArticlesResponse) {
    return [...staticPages, ...productPages]
  }

  const remainingArticleRequests = Array.from(
    { length: Math.max(firstArticlesResponse.meta.pagination.last_page - 1, 0) },
    (_, index) =>
      fetchArticleListSafe({
        page: index + 2,
        per_page: ARTICLE_SITEMAP_BATCH_SIZE,
      })
  )

  const remainingArticlesResponses = await Promise.all(remainingArticleRequests)
  const allArticles = [
    ...firstArticlesResponse.data,
    ...remainingArticlesResponses.flatMap((response) => response?.data ?? []),
  ]

  const articlePages: MetadataRoute.Sitemap = allArticles.map((article) => ({
    url: `${SITE_URL}/bai-viet/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticPages, ...productPages, ...articlePages]
}
