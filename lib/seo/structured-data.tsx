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
      strategy="afterInteractive"
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
      strategy="afterInteractive"
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
      strategy="afterInteractive"
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
      strategy="afterInteractive"
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
      strategy="afterInteractive"
    />
  )
}

// ========== FAQPage Schema ==========
interface FAQItem {
  question: string
  answer: string
}

interface FAQPageSchemaProps {
  items: FAQItem[]
}

export function FAQPageSchema({ items }: FAQPageSchemaProps) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return null
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="afterInteractive"
    />
  )
}

// ========== CollectionPage Schema ==========
interface CollectionPageSchemaProps {
  name: string
  description?: string
  url: string
  numberOfItems?: number
}

export function CollectionPageSchema({
  name,
  description,
  url,
  numberOfItems,
}: CollectionPageSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    numberOfItems,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems,
    },
  }

  return (
    <Script
      id="collection-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="afterInteractive"
    />
  )
}

// ========== ItemList Schema (for product listings) ==========
interface ItemListProduct {
  name: string
  url: string
  image?: string
  price?: number
  currency?: string
}

interface ItemListSchemaProps {
  name: string
  description?: string
  items: ItemListProduct[]
  url?: string
}

export function ItemListSchema({
  name,
  description,
  items,
  url,
}: ItemListSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: item.name,
        url: item.url,
        image: item.image,
        offers: item.price ? {
          '@type': 'Offer',
          price: item.price.toString(),
          priceCurrency: item.currency || 'VND',
        } : undefined,
      },
    })),
  }

  return (
    <Script
      id="itemlist-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="afterInteractive"
    />
  )
}

// ========== Review Schema ==========
interface ReviewSchemaProps {
  itemReviewed: {
    type: 'Product' | 'Article' | 'Organization'
    name: string
  }
  author: string
  reviewRating: number
  reviewBody: string
  datePublished?: string
}

export function ReviewSchema({
  itemReviewed,
  author,
  reviewRating,
  reviewBody,
  datePublished = new Date().toISOString(),
}: ReviewSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': itemReviewed.type,
      name: itemReviewed.name,
    },
    author: {
      '@type': 'Person',
      name: author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: reviewRating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody,
    datePublished,
  }

  return (
    <Script
      id="review-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="afterInteractive"
    />
  )
}

// ========== VideoObject Schema (for embedded videos) ==========
interface VideoSchemaProps {
  name: string
  description: string
  thumbnailUrl: string
  uploadDate: string
  contentUrl?: string
  embedUrl?: string
  duration?: string // ISO 8601 format: PT1H30M
}

export function VideoSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  contentUrl,
  embedUrl,
  duration,
}: VideoSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl,
    uploadDate,
    contentUrl,
    embedUrl,
    duration,
  }

  return (
    <Script
      id="video-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="afterInteractive"
    />
  )
}

// ========== HowTo Schema (for guides/tutorials) ==========
interface HowToStep {
  name: string
  text: string
  image?: string
}

interface HowToSchemaProps {
  name: string
  description: string
  steps: HowToStep[]
  totalTime?: string // ISO 8601 format
  image?: string
}

export function HowToSchema({
  name,
  description,
  steps,
  totalTime,
  image,
}: HowToSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    image,
    totalTime,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
    })),
  }

  return (
    <Script
      id="howto-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="afterInteractive"
    />
  )
}
