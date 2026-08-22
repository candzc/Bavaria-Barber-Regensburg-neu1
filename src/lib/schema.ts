import { business, openingHoursSchema } from './site';

const businessId = `${business.siteUrl}/#business`;

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    '@id': businessId,
    name: business.name,
    legalName: business.legalName,
    url: business.siteUrl,
    telephone: business.phone,
    email: business.email,
    priceRange: '€€',
    image: `${business.siteUrl}/images/salon-og.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.street,
      postalCode: business.postalCode,
      addressLocality: `${business.city}-${business.district}`,
      addressCountry: 'DE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: business.latitude,
      longitude: business.longitude,
    },
    hasMap: business.googleMapsUrl,
    foundingDate: business.founded,
    openingHoursSpecification: openingHoursSchema.map((d) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${d.dayOfWeek}`,
      opens: d.opens,
      closes: d.closes,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: business.ratingValue,
      reviewCount: business.reviewCount,
    },
    sameAs: [business.googleMapsUrl],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${business.siteUrl}/#website`,
    url: business.siteUrl,
    name: business.name,
    publisher: { '@id': businessId },
    inLanguage: 'de-DE',
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function serviceSchema(opts: { name: string; description: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: opts.name,
    description: opts.description,
    provider: { '@id': businessId },
    areaServed: {
      '@type': 'City',
      name: 'Regensburg',
    },
  };
}
