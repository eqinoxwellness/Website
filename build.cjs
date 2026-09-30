const fs = require('fs');
const path = require('path');

const outDir = path.join('.vercel', 'output', 'static');
fs.mkdirSync(outDir, { recursive: true });

// Copy all public static files to .vercel/output/static
const items = fs.readdirSync('.');
const ignoreList = ['.git', '.vercel', 'node_modules', 'build.cjs'];

for (const item of items) {
  if (ignoreList.includes(item)) continue;
  fs.cpSync(item, path.join(outDir, item), { recursive: true });
}

// Create Vercel build output config
const configPath = path.join('.vercel', 'output', 'config.json');
fs.writeFileSync(configPath, JSON.stringify({ version: 3 }), 'utf8');

console.log('Static build complete for Vercel deployment.');
