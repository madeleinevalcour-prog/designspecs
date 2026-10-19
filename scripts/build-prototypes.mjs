// Rebuilds every HTML prototype (prototypes/*/build.py → docs-site/prototypes/*/index.html).
//   npm run prototypes
// Each prototype inlines tokens/css + ats-ui component CSS at build time, so it must be
// rebuilt whenever either changes. `npm run tokens` and the pre-commit hook run this.
import { readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'prototypes');

let failed = false;
for (const name of readdirSync(dir)) {
  const script = join(dir, name, 'build.py');
  if (!existsSync(script)) continue;
  process.stdout.write(`prototype ${name}: `);
  const r = spawnSync('python3', [script], { stdio: 'inherit' });
  if (r.status !== 0) failed = true;
}
if (failed) process.exit(1);
