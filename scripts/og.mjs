/**
 * Generates Open Graph images (1200×630) for every page plus the app icons.
 * Run with: FONTCONFIG_FILE=<conf pointing at Marcellus + static Source Sans 3 TTFs named EqxSans> npm run og
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

function ogSvg(title, sub) {
  const lines = wrap(title, 20);
  const size = lines.length > 3 ? 58 : 66;
  const startY = 300 - ((lines.length - 1) * size * 1.12) / 2;
  const tspans = lines.map((l, i) => `<tspan x="80" y="${startY + i * size * 1.12}">${esc(l)}</tspan>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><radialGradient id="lit" cx="35%" cy="35%" r="75%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E6E3D6"/></radialGradient></defs>
  <rect width="1200" height="630" fill="#F5F6F3"/>
  <rect x="780" width="420" height="630" fill="#1E2240"/>
  <rect x="779" width="3" height="630" fill="#D9A55B"/>
  <circle cx="990" cy="315" r="150" fill="#343A6B"/>
  <path d="M990 165a150 150 0 0 0 0 300Z" fill="url(#lit)"/>
  <line x1="990" y1="150" x2="990" y2="480" stroke="#D9A55B" stroke-width="3"/>
  <text font-family="Marcellus" font-size="${size}" fill="#23273F">${tspans}</text>
  <text x="80" y="92" font-family="Marcellus" font-size="34" fill="#23273F" letter-spacing="1">Equinox</text>
  <text x="80" y="124" font-family="EqxSans" font-size="22" fill="#595D74">Aesthetic &amp; Wellness Centre</text>
  <text x="80" y="548" font-family="EqxSans" font-weight="600" font-size="26" fill="#23273F">${esc(sub)}</text>
  <text x="80" y="584" font-family="EqxSans" font-size="24" fill="#595D74">Open 11am to 8pm, closed on Fridays</text>
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
  await sharp({ create: { width: size, height: size, channels: 4, background: '#F5F6F3' } })
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
