/**
 * Preflight: runs before every build.
 * FAILS the build if any copy contains wording that Indian healthcare advertising rules or
 * Google/Meta ad policies treat as high-risk. WARNS about facts Equinox has not confirmed.
 * STRICT=1 turns the warnings into failures — use it for the production go-live.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const strict = process.env.STRICT === '1';

const banned = [
  [/\bbest\b/i, 'best'], [/\bno\.\s?1\b/i, 'No.1'], [/\bnumber one\b/i, 'number one'],
  [/\bguarantee\w*/i, 'guarantee'], [/\bpermanent\w*/i, 'permanent'], [/\bcure[sd]?\b/i, 'cure'],
  [/\bmiracle\w*/i, 'miracle'], [/\bpainless\b/i, 'painless'], [/100\s?%/, '100%'],
  [/side[- ]effect[- ]free/i, 'side-effect free'], [/results? assured/i, 'results assured'],
  [/\bfairness\b/i, 'fairness'], [/\bwhiten\w*/i, 'whitening'], [/\bno side effects\b/i, 'no side effects'],
];

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(astro|tsx?|md|mdx)$/.test(f)) out.push(p);
  }
  return out;
}

const errors = [];
const warnings = [];

for (const file of walk(join(root, 'src'))) {
  const rel = relative(root, file);
  if (rel.includes('lib/analytics') || rel.includes('pages/api/')) continue; // code, not copy
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (line.includes('preflight-ignore') || /^\s*(\/\/|\*|\/\*)/.test(line)) return;
    for (const [re, label] of banned) if (re.test(line)) errors.push(`${rel}:${i + 1}  banned word "${label}"  →  ${line.trim().slice(0, 110)}`);
  });
}

const cfg = readFileSync(join(root, 'src/config/site.ts'), 'utf8');
for (const m of cfg.matchAll(/\/\/ CONFIRM: (.+)/g)) warnings.push(`site.ts  unconfirmed: ${m[1]}`);
const svc = readFileSync(join(root, 'src/data/services.ts'), 'utf8');
const slugs = [...svc.matchAll(/slug: '([^']+)'/g)].map((m) => m[1]);
const verified = [...svc.matchAll(/verified: (true|false)/g)].map((m) => m[1] === 'true');
slugs.forEach((s, i) => { if (!verified[i]) warnings.push(`services.ts  "${s}" not yet confirmed by Equinox (verified: false)`); });

const envNeeded = ['PUBLIC_GA4_ID', 'PUBLIC_META_PIXEL_ID', 'PUBLIC_CLARITY_ID', 'PUBLIC_GADS_ID', 'APPS_SCRIPT_URL'];
const missing = envNeeded.filter((k) => !process.env[k]);
if (process.env.VERCEL && missing.length) warnings.push(`env not set on Vercel: ${missing.join(', ')}`);

const bar = '─'.repeat(64);
if (warnings.length) {
  console.log(`\n${bar}\nPreflight: ${warnings.length} item(s) to confirm with Equinox before running ads\n${bar}`);
  warnings.forEach((w) => console.log('  • ' + w));
}
if (errors.length) {
  console.error(`\n${bar}\nPreflight FAILED: ${errors.length} high-risk claim(s) in copy\n${bar}`);
  errors.forEach((e) => console.error('  ✗ ' + e));
  console.error('\nRewrite these to describe the process, not an outcome. See BUILD_PROMPT.md, compliance rules.\n');
  process.exit(1);
}
if (strict && warnings.length) {
  console.error('\nSTRICT=1: resolve the items above before the production build.\n');
  process.exit(1);
}
console.log(`\nPreflight passed: no banned claims${warnings.length ? `, ${warnings.length} warning(s)` : ''}.\n`);
