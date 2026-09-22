import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Canonical site URL. On Vercel this resolves to the production domain automatically;
// set SITE_URL once a custom domain is live to pin it explicitly.
const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

export default defineConfig({
  site,
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'never',
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
  integrations: [
    react(),
    sitemap({
      filter: (page) => !/\/(thank-you|404)\/?$/.test(page),
      changefreq: 'monthly',
    }),
  ],
});
