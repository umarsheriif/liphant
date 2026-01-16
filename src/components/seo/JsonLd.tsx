import Script from 'next/script';

// Organization Schema
export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Liphant',
    url: 'https://liphant.co',
    logo: 'https://liphant.co/logo.png',
    description:
      'Connect with qualified shadow teachers and therapy centers to support your child with special needs in Egypt.',
    foundingDate: '2024',
    founders: [
      {
        '@type': 'Person',
        name: 'Liphant Team',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'EG',
      addressLocality: 'Cairo',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@liphant.co',
      availableLanguage: ['English', 'Arabic'],
    },
    sameAs: [
      'https://facebook.com/liphant',
      'https://instagram.com/liphant',
      'https://twitter.com/liphant',
    ],
  };

  return (
    <Script
      id="organization-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Website Schema
export function WebsiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Liphant',
    url: 'https://liphant.co',
    description:
      'Egypt\'s #1 platform for connecting families with shadow teachers and therapy centers for children with special needs.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://liphant.co/en/teachers?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: ['en', 'ar'],
  };

  return (
    <Script
      id="website-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Teacher Profile Schema
interface TeacherJsonLdProps {
  name: string;
  description: string;
  image?: string;
  url: string;
  specializations: string[];
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
  location?: string;
}

export function TeacherJsonLd({
  name,
  description,
  image,
  url,
  specializations,
  rating,
  reviewCount,
  priceRange,
  location,
}: TeacherJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    description,
    image,
    url,
    jobTitle: 'Shadow Teacher / Therapist',
    knowsAbout: specializations,
    worksFor: {
      '@type': 'Organization',
      name: 'Liphant',
      url: 'https://liphant.co',
    },
    ...(location && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: location,
        addressCountry: 'EG',
      },
    }),
    ...(rating &&
      reviewCount && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: rating,
          reviewCount: reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
    ...(priceRange && {
      priceRange,
    }),
  };

  return (
    <Script
      id="teacher-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Therapy Center Schema
interface CenterJsonLdProps {
  name: string;
  description: string;
  image?: string;
  url: string;
  address: string;
  city: string;
  services: string[];
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
  phone?: string;
  email?: string;
}

export function CenterJsonLd({
  name,
  description,
  image,
  url,
  address,
  city,
  services,
  rating,
  reviewCount,
  priceRange,
  phone,
  email,
}: CenterJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': url,
    name,
    description,
    image,
    url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: city,
      addressCountry: 'EG',
    },
    ...(phone && { telephone: phone }),
    ...(email && { email }),
    medicalSpecialty: services,
    availableService: services.map((service) => ({
      '@type': 'MedicalTherapy',
      name: service,
    })),
    ...(rating &&
      reviewCount && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: rating,
          reviewCount: reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
    ...(priceRange && { priceRange }),
  };

  return (
    <Script
      id="center-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Breadcrumb Schema
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ Schema
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQJsonLdProps {
  items: FAQItem[];
}

export function FAQJsonLd({ items }: FAQJsonLdProps) {
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
  };

  return (
    <Script
      id="faq-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
