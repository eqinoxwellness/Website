import { site, fullAddress } from '../config/site';
import type { Faq, Service } from '../data/services';

export const clinicId = (origin: string) => `${origin}/#clinic`;

export function clinicNode(origin: string) {
  const node: Record<string, unknown> = {
    '@type': 'MedicalClinic',
    '@id': clinicId(origin),
    name: site.name,
    alternateName: site.legalName,
    description: site.description,
    url: `${origin}/`,
    telephone: site.phoneE164,
    image: `${origin}/og/home.png`,
    logo: `${origin}/icon-512.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: `${site.address.locality}, ${site.address.city}`,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.mapsUrl,
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: site.hours.openDays, opens: site.hours.open, closes: site.hours.close },
    ],
    areaServed: site.areaServed.map((name) => ({ '@type': 'Place', name })),
    isAcceptingNewPatients: true,
    knowsLanguage: ['en', 'hi', 'or'],
  };
  if (site.email) node.email = site.email;
  if (site.instagramUrl) node.sameAs = [site.instagramUrl];
  return node;
}

export function websiteNode(origin: string) {
  return { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: site.name, publisher: { '@id': clinicId(origin) }, inLanguage: 'en-IN' };
}

export function pageNode(origin: string, url: string, name: string, description: string, type = 'WebPage') {
  return { '@type': type, '@id': `${url}#webpage`, url, name, description, isPartOf: { '@id': `${origin}/#website` }, about: { '@id': clinicId(origin) }, inLanguage: 'en-IN', dateModified: site.policyUpdated };
}

export function faqNode(url: string, faqs: Faq[]) {
  return {
    '@type': 'FAQPage', '@id': `${url}#faq`,
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export function breadcrumbNode(url: string, items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`,
    itemListElement: items.map((i, idx) => ({ '@type': 'ListItem', position: idx + 1, name: i.name, item: i.url })),
  };
}

export function serviceNode(origin: string, url: string, s: Service) {
  return {
    '@type': 'Service', '@id': `${url}#service`, name: s.name, serviceType: s.name, description: s.description,
    url, provider: { '@id': clinicId(origin) },
    areaServed: { '@type': 'City', name: site.address.city },
  };
}

/** Emitted only once the doctor's qualification and registration are confirmed. */
export function physicianNode(origin: string) {
  const d = site.doctor;
  if (!d.qualification || !d.registration) return null;
  return {
    '@type': 'Physician', '@id': `${origin}/about-the-doctor#physician`, name: d.displayName,
    hasCredential: d.qualification, identifier: d.registration, worksFor: { '@id': clinicId(origin) },
    address: fullAddress,
  };
}
