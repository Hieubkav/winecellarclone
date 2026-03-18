import { MetadataRoute } from 'next'
import { fetchProductList } from '@/lib/api/products'
import { fetchArticleList } from '@/lib/api/articles'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITEMAP_BATCH_SIZE = 100

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/filter`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/san-pham`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/bai-viet`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  try {
    // Fetch all products (limit to reasonable number for sitemap)
    const productsResponse = await fetchProductList({ 
      page: 1, 
      per_page: SITEMAP_BATCH_SIZE,
    })
    
    const productPages: MetadataRoute.Sitemap = productsResponse.data.map((product) => ({
      url: `${SITE_URL}/san-pham/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    // Fetch all articles
    const articlesResponse = await fetchArticleList({
      page: 1,
      per_page: SITEMAP_BATCH_SIZE,
    })

    const articlePages: MetadataRoute.Sitemap = articlesResponse.data.map((article) => ({
      url: `${SITE_URL}/bai-viet/${article.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

    return [...staticPages, ...productPages, ...articlePages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return at least static pages if API fails
    return staticPages
  }
}
