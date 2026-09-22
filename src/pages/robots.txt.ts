import type { APIRoute } from 'astro';

// AI assistants and answer engines are allowed on purpose: being read and cited by them
// is part of the generative-engine optimisation strategy.
const aiBots = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot',
  'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bingbot',
];

export const GET: APIRoute = ({ site }) => {
  const origin = site?.origin ?? 'http://localhost:4321';
  const rules = ['Allow: /', 'Disallow: /api/', 'Disallow: /thank-you'].join('\n');
  const body = [
    'User-agent: *', rules, '',
    ...aiBots.map((b) => `User-agent: ${b}`), rules, '',
    `Sitemap: ${origin}/sitemap-index.xml`, '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
