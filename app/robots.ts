import { MetadataRoute } from 'next'
import { fetchSettings, FALLBACK_SETTINGS } from '@/lib/api/settings'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default async function robots(): Promise<MetadataRoute.Robots> {
  let settings = FALLBACK_SETTINGS

  try {
    settings = await fetchSettings()
  } catch (error) {
    console.error('Failed to fetch settings for robots:', error)
  }

  if (settings.indexing_enabled === false) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
      sitemap: `${SITE_URL}/sitemap.xml`,
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
