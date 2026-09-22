/**
 * Generates Open Graph images (1200×630) for every page plus the app icons.
 * Run with: FONTCONFIG_FILE=<conf pointing at Sorts Mill Goudy + static Source Sans 3 TTFs named EqxSans> npm run og
 * Output is committed to /public so builds do not depend on fonts being installed.
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const out = new URL('../public/og/', import.meta.url);
mkdirSync(out, { recursive: true });
const svc = readFileSync(new URL('../src/data/services.ts', import.meta.url), 'utf8');
const pages = [...svc.matchAll(/slug: '([^']+)',\s*\n\s*category: '[^']+',\s*\n\s*name: '([^']+)'/g)].map((m) => ({ slug: m[1], title: m[2].replace(/’/g, '\u2019') }));
pages.unshift({ slug: 'home', title: 'Skin, hair and wellness care that begins with a proper consultation' });
pages.push({ slug: 'about-the-doctor', title: 'Meet the doctor behind every consultation' });

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
function wrap(text, max) {
  const words = text.split(' '); const lines = []; let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > max) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
  if (cur) lines.push(cur);
  return lines;
}

// Brand geometry is read from the components so OG images always match the site.
const sunMoon = readFileSync(new URL('../src/components/SunMoon.astro', import.meta.url), 'utf8');
const [light, dark, disc, rim] = [...sunMoon.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
const wordPath = readFileSync(new URL('../src/components/Wordmark.astro', import.meta.url), 'utf8').match(/ d="([^"]+)"/)[1];

function ogSvg(title, sub) {
  const lines = wrap(title, 21);
  const size = lines.length > 3 ? 60 : 68;
  const startY = 318 - ((lines.length - 1) * size * 1.1) / 2;
  const tspans = lines.map((l, i) => `<tspan x="80" y="${startY + i * size * 1.1}">${esc(l)}</tspan>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6D27A"/><stop offset=".45" stop-color="#E2A843"/><stop offset="1" stop-color="#B07620"/></linearGradient>
    <linearGradient id="l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F8DC92"/><stop offset="1" stop-color="#DA9E38"/></linearGradient>
    <linearGradient id="d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C98A26"/><stop offset="1" stop-color="#86560C"/></linearGradient>
    <linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B7802A"/><stop offset="1" stop-color="#7E520F"/></linearGradient>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2C766"/><stop offset="1" stop-color="#C8912F"/></linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="#F2C766" stop-opacity=".2"/><stop offset="1" stop-color="#F2C766" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#FBF6EF"/>
  <rect x="780" width="420" height="630" fill="#441F51"/>
  <rect x="778" width="4" height="630" fill="url(#v)"/>
  <circle cx="990" cy="315" r="200" fill="url(#glow)"/>
  <g transform="translate(990 315) scale(0.72) translate(-214 -206)">
    <path fill="url(#l)" d="${light}"/><path fill="url(#d)" d="${dark}"/><path fill="url(#g)" d="${disc}"/>
    <path d="${rim}" fill="none" stroke="#FCE3A2" stroke-opacity=".55" stroke-width="3"/>
  </g>
  <g transform="translate(80 62) scale(${250 / 2249})"><path fill="url(#t)" d="${wordPath}"/></g>
  <text x="80" y="128" font-family="Sorts Mill Goudy" font-size="25" fill="#8A5A12">Aesthetic and Wellness Centre</text>
  <text font-family="Sorts Mill Goudy" font-size="${size}" fill="#3A1D45">${tspans}</text>
  <text x="80" y="548" font-family="EqxSans" font-weight="600" font-size="26" fill="#3A1D45">${esc(sub)}</text>
  <text x="80" y="584" font-family="EqxSans" font-size="24" fill="#66586A">Open 11am to 8pm, closed on Fridays</text>
</svg>`;
}

for (const p of pages) {
  await sharp(Buffer.from(ogSvg(p.slug === 'home' || p.slug === 'about-the-doctor' ? p.title : `${p.title} in Bhubaneswar`, 'Satya Nagar, Bhubaneswar')))
    .png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(new URL(`${p.slug}.png`, out).pathname);
  console.log('og', p.slug);
}

// Icons
const mark = readFileSync(new URL('../public/favicon.svg', import.meta.url));
async function icon(size, pad, file) {
  const inner = await sharp(mark, { density: 800 }).resize(size - pad * 2, size - pad * 2).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: '#FBF6EF' } })
    .composite([{ input: inner, top: pad, left: pad }]).png().toFile(new URL(`../public/${file}`, import.meta.url).pathname);
}
await icon(180, 18, 'apple-touch-icon.png');
await icon(192, 16, 'icon-192.png');
await icon(512, 48, 'icon-512.png');

// favicon.ico containing a single 32×32 PNG
const png32 = await sharp(mark, { density: 400 }).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6); header.writeUInt8(32, 7); header.writeUInt8(0, 8); header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12); header.writeUInt32LE(png32.length, 14); header.writeUInt32LE(22, 18);
writeFileSync(new URL('../public/favicon.ico', import.meta.url), Buffer.concat([header, png32]));
console.log('icons done');
