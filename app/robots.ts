import { MetadataRoute } from 'next'
import { fetchSettingsSafe, FALLBACK_SETTINGS } from '@/lib/api/settings'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await fetchSettingsSafe()

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
