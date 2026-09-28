import type { APIRoute } from 'astro';
import { services, categories } from '../data/services';
import { treatmentCategories } from '../data/treatments';
import { site, fullAddress } from '../config/site';

// llms.txt: a plain summary for AI assistants, generated from the same data as the pages
// so it never drifts out of date.
export const GET: APIRoute = ({ site: s }) => {
  const origin = s?.origin ?? 'http://localhost:4321';
  const lines: string[] = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    `- Address: ${fullAddress} (${site.address.landmark})`,
    `- Phone and WhatsApp: ${site.phoneDisplay}`,
    `- Hours: ${site.hours.openLabel}, Saturday to Thursday. Closed on Fridays.`,
    `- Consultations are with ${site.doctor.displayName}${site.doctor.qualification ? `, ${site.doctor.qualification}` : ''}.`,
    `- Serves: ${site.areaServed.join(', ')}.`,
    '- Approach: every consultation starts with history and examination, followed by a plain explanation of options, costs and realistic expectations. No specific outcome is promised.',
    '',
  ];
  for (const cat of categories) {
    lines.push(`## ${cat}`, '');
    for (const sv of services.filter((x) => x.category === cat)) {
      lines.push(`- [${sv.name}](${origin}/${sv.slug}): ${sv.intro}`);
    }
    lines.push('');
  }
  lines.push('## Treatment modalities', '', `- [All treatments](${origin}/treatments)`, '');
  for (const cat of treatmentCategories) {
    lines.push(`### ${cat.group}`);
    for (const t of cat.items) {
      lines.push(`- ${t.name}: ${t.what}`);
    }
    lines.push('');
  }
  lines.push('## The clinic', '', `- [Our doctor](${origin}/about-the-doctor)`, `- [Visit and contact](${origin}/contact)`, `- [Privacy policy](${origin}/privacy-policy)`, '');
  lines.push('## Optional', '', `- [Sitemap](${origin}/sitemap-index.xml)`, '');
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
