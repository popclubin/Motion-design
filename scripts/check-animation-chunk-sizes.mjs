import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const LIMIT_BYTES = 250 * 1024;
const assetsDir = join(process.cwd(), 'dist', 'assets');

let files;
try {
  files = readdirSync(assetsDir);
} catch {
  console.error('No dist/assets directory found — run `npm run build` first.');
  process.exit(1);
}

const animChunks = files.filter((f) => /^anim-.*\.js$/.test(f));

let hasWarning = false;
for (const file of animChunks) {
  const bytes = readFileSync(join(assetsDir, file));
  const gzipBytes = gzipSync(bytes).length;
  if (gzipBytes > LIMIT_BYTES) {
    hasWarning = true;
    console.warn(
      `⚠ ${file}: ${(gzipBytes / 1024).toFixed(1)} KB gzipped exceeds the ${LIMIT_BYTES / 1024} KB budget.`,
    );
  } else {
    console.log(`  ${file}: ${(gzipBytes / 1024).toFixed(1)} KB gzipped`);
  }
}

if (!hasWarning) {
  console.log(`All ${animChunks.length} animation chunks are within the 250 KB gzip budget.`);
}
