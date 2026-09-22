/**
 * The Vercel adapter writes .vercel/output/config.json (Build Output API), which means vercel.json
 * headers are ignored. This injects security and caching headers into that config after the build.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const path = new URL('../.vercel/output/config.json', import.meta.url);
if (!existsSync(path)) { console.log('postbuild: no .vercel/output, skipping'); process.exit(0); }
const config = JSON.parse(readFileSync(path, 'utf8'));
const security = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};
const extra = [
  { src: '^/(.*)$', headers: security, continue: true },
  { src: '^/fonts/(.*)$', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }, continue: true },
  { src: '^/og/(.*)$', headers: { 'Cache-Control': 'public, max-age=604800' }, continue: true },
];
config.routes = [...extra, ...(config.routes || []).filter((r) => !r.headers?.['Strict-Transport-Security'])];
writeFileSync(path, JSON.stringify(config, null, 2));
console.log('postbuild: security and cache headers added to .vercel/output/config.json');
