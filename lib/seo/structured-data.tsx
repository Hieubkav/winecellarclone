import Script from 'next/script'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

interface OrganizationSchemaProps {
  name: string
  url?: string
  logo?: string
  description?: string
  address?: string
  telephone?: string
  email?: string
  socialLinks?: Array<{ url: string; platform: string }>
}

export function OrganizationSchema({
  name,
  url = SITE_URL,
  logo,
  description,
  address,
  telephone,
  email,
  socialLinks = [],
}: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo: logo ? {
      '@type': 'ImageObject',
      url: logo,
    } : undefined,
    description,
    address: address ? {
      '@type': 'PostalAddress',
      streetAddress: address,
    } : undefined,
    contactPoint: telephone || email ? {
      '@type': 'ContactPoint',
      telephone,
      email,
      contactType: 'customer service',
    } : undefined,
    sameAs: socialLinks.map(link => link.url),
  }

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="beforeInteractive"
    />
  )
}

interface ProductSchemaProps {
  name: string
  description?: string
  image?: string
  brand?: string
  sku?: string
  price?: number
  currency?: string
  availability?: 'in stock' | 'out of stock'
  url: string
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
  }
}

export function ProductSchema({
  name,
  description,
  image,
  brand = 'Thiên Kim Wine',
  sku,
  price,
  currency = 'VND',
  availability = 'in stock',
  url,
  aggregateRating,
}: ProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    sku,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: currency,
      price: price?.toString(),
      availability: availability === 'in stock' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Thiên Kim Wine',
      },
    },
    aggregateRating: aggregateRating ? {
      '@type': 'AggregateRating',
      ratingValue: aggregateRating.ratingValue,
      reviewCount: aggregateRating.reviewCount,
    } : undefined,
  }

  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="beforeInteractive"
    />
  )
}

interface ArticleSchemaProps {
  headline: string
  description?: string
  image?: string
  datePublished: string
  dateModified?: string
  author?: string
  publisher?: {
    name: string
    logo?: string
  }
  url: string
}

export function ArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author = 'Thiên Kim Wine',
  publisher = { name: 'Thiên Kim Wine' },
  url,
}: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: publisher.name,
      logo: publisher.logo ? {
        '@type': 'ImageObject',
        url: publisher.logo,
      } : undefined,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="beforeInteractive"
    />
  )
}

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="beforeInteractive"
    />
  )
}

interface WebSiteSchemaProps {
  name: string
  url?: string
  description?: string
  searchUrl?: string
}

export function WebSiteSchema({
  name,
  url = SITE_URL,
  description,
  searchUrl = `${SITE_URL}/filter?q={search_term_string}`,
}: WebSiteSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: searchUrl,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="beforeInteractive"
    />
  )
}
