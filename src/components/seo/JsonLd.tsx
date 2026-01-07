import Script from 'next/script';

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization Schema
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'StayScan',
  description: 'Premium concierge services for hotel guests',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://stayscan.in',
  logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://stayscan.in'}/logo.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'support@stayscan.in',
  },
  sameAs: [
    'https://twitter.com/stayscan',
    'https://www.linkedin.com/company/stayscan',
  ],
};

// Software Application Schema
export const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'StayScan',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '2300000',
    bestRating: '5',
    worstRating: '1',
  },
};

// Breadcrumb Schema Generator
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// FAQ Schema Generator
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Product Schema for Pricing
export function generateProductSchema(plan: {
  name: string;
  description: string;
  price: number;
  currency: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: plan.name,
    description: plan.description,
    offers: {
      '@type': 'Offer',
      price: plan.price,
      priceCurrency: plan.currency,
      availability: 'https://schema.org/InStock',
    },
  };
}
